
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from sklearn.neighbors import NearestNeighbors
import numpy as np
import pickle
import os
from bson import ObjectId
import dotenv
import logging

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

dotenv.load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'test')
client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
events_collection = db['events']
users_collection = db['users']
organizations_collection = db['organizations']

MODEL_PATH = 'knn_model.pkl'

model = None
event_id_to_index_map = {}
user_ids = []
interaction_matrix = None


def train_model():
    global model, event_id_to_index_map, user_ids, interaction_matrix

    logger.info("Starting model training...")

    events = list(events_collection.find({}, {'_id': 1, 'eventId': 1, 'title': 1, 'organization': 1}))
    if not events:
        logger.error("No events found in the database. Cannot train the model.")
        return False

    event_id_map = {event['eventId']: str(event['_id']) for event in events}
    logger.info(f"Event ID Map: {event_id_map}")

    event_ids = [event['eventId'] for event in events]
    event_id_to_index_map = {event_id: idx for idx, event_id in enumerate(event_ids)}
    logger.info(f"Event ID to Index Map: {event_id_to_index_map}")

    users = list(users_collection.find({}, {'registeredEvents': 1}))
    if not users:
        logger.error("No users found in the database. Cannot train the model.")
        return False

    user_ids = [str(user['_id']) for user in users]
    logger.info(f"User IDs: {user_ids}")

    interaction_matrix = np.zeros((len(user_ids), len(event_ids)))

    for i, user in enumerate(users):
        for event_ref in user.get('registeredEvents', []):
            event_ref_str = str(event_ref)
            event_id_str = None
            for eid, oid in event_id_map.items():
                if oid == event_ref_str:
                    event_id_str = eid
                    break
            if event_id_str and event_id_str in event_id_to_index_map:
                j = event_id_to_index_map[event_id_str]
                interaction_matrix[i][j] = 1

    if interaction_matrix.shape[0] == 0 or interaction_matrix.shape[1] == 0:
        logger.error("Interaction matrix is empty. Cannot train the model.")
        return False

    logger.info(f"Interaction Matrix:\n{interaction_matrix}")

    model = NearestNeighbors(metric='cosine', algorithm='brute')
    model.fit(interaction_matrix)

    model.user_ids = user_ids
    model.event_ids = event_ids
    model.interaction_matrix = interaction_matrix

    with open(MODEL_PATH, 'wb') as f:
        pickle.dump({
            'model': model,
            'event_id_to_index_map': event_id_to_index_map,
            'user_ids': user_ids,
            'interaction_matrix': interaction_matrix
        }, f)

    logger.info("Model trained and saved successfully.")
    return True


def load_model():
    global model, event_id_to_index_map, user_ids, interaction_matrix

    if not os.path.exists(MODEL_PATH):
        logger.info("Model file not found. Training a new model...")
        success = train_model()
        if not success:
            logger.error("Model training failed during initial load.")
    else:
        try:
            with open(MODEL_PATH, 'rb') as f:
                data = pickle.load(f)
                required_keys = {'model', 'event_id_to_index_map', 'user_ids', 'interaction_matrix'}
                if not required_keys.issubset(data.keys()):
                    logger.warning("Pickle file is missing required data. Re-training the model...")
                    success = train_model()
                    if not success:
                        logger.error("Model training failed during re-training.")
                        return
                else:
                    model = data['model']
                    event_id_to_index_map = data['event_id_to_index_map']
                    user_ids = data['user_ids']
                    interaction_matrix = data['interaction_matrix']
                    logger.info("Model loaded successfully from disk.")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}. Attempting to retrain.")
            success = train_model()
            if not success:
                logger.error("Model training failed after load failure.")


@app.route('/recommend', methods=['POST'])
def recommend():
    """
    Expects JSON payload:
    {
        "user_id": "user's ObjectId as string",
        "num_recommendations": 5  # Optional, defaults to 5
    }
    """
    data = request.get_json()

    if not data:
        logger.error("No data received in the request.")
        return jsonify({"error": "No data provided."}), 400

    user_id = data.get('user_id')
    num_recommendations = data.get('num_recommendations', 5)

    if not user_id:
        logger.error("user_id is missing in the request.")
        return jsonify({"error": "user_id is required."}), 400

    try:
        user_obj_id = ObjectId(user_id)
    except Exception as e:
        logger.error(f"Invalid user_id format: {user_id}. Error: {str(e)}")
        return jsonify({"error": "Invalid user_id format."}), 400

    try:
        user = users_collection.find_one({'_id': user_obj_id}, {'registeredEvents': 1})
    except Exception as e:
        logger.error(f"Database error when fetching user {user_id}: {str(e)}")
        return jsonify({"error": "Database error."}), 500

    if not user:
        logger.error(f"User not found: {user_id}")
        return jsonify({"error": "User not found."}), 404

    registered_events = user.get('registeredEvents', [])
    if not registered_events:
        logger.info(f"User {user_id} has no registered events.")
        return jsonify({"message": "User has no registered events.", "recommendations": []}), 200

    try:
        events = list(events_collection.find({}, {
            '_id': 1,
            'eventId': 1,
            'title': 1,
            'organization': 1,
            'type': 1,
            'subtype': 1,
            'location': 1,
            'date': 1,
            'time': 1
        }))
    except Exception as e:
        logger.error(f"Database error when fetching events: {str(e)}")
        return jsonify({"error": "Database error."}), 500

    id_to_event_id_map = {str(event['_id']): event['eventId'] for event in events}
    logger.info(f"Event ID Map in Recommend: {id_to_event_id_map}")

    user_vector = np.zeros(len(event_id_to_index_map))
    excluded_event_ids = []

    for event_ref in registered_events:
        event_ref_str = str(event_ref)
        event_id_str = id_to_event_id_map.get(event_ref_str)
        if event_id_str and event_id_str in event_id_to_index_map:
            j = event_id_to_index_map[event_id_str]
            user_vector[j] = 1
            excluded_event_ids.append(event_id_str)
            logger.debug(f"User {user_id} registered for Event ID: {event_id_str}")

    user_vector = user_vector.reshape(1, -1)
    logger.info(f"User Vector for {user_id}: {user_vector}")

    if model is None or interaction_matrix is None:
        logger.error("Model is not trained. Insufficient data.")
        return jsonify({"error": "Model is not trained. Insufficient data."}), 500

    n_samples_fit = interaction_matrix.shape[0]
    desired_neighbors = min(num_recommendations + 1, n_samples_fit)

    if desired_neighbors < 2:
        logger.warning("Not enough data to provide recommendations.")
        return jsonify({"error": "Not enough data to provide recommendations."}), 400

    try:
        distances, indices = model.kneighbors(user_vector, n_neighbors=desired_neighbors)
        logger.info(f"KNN Distances: {distances}")
        logger.info(f"KNN Indices: {indices}")
    except ValueError as ve:
        logger.error(f"KNN Error: {str(ve)}")
        return jsonify({"error": "Error generating recommendations."}), 500
    except Exception as e:
        logger.error(f"Unexpected error during KNN computation: {str(e)}")
        return jsonify({"error": "Unexpected error during recommendation generation."}), 500

    similar_users_indices = indices.flatten()
    logger.info(f"Similar Users Indices: {similar_users_indices}")

    similar_users = []
    for i in similar_users_indices:
        if i < len(user_ids):
            similar_user_id = user_ids[i]
            try:
                similar_user = users_collection.find_one({'_id': ObjectId(similar_user_id)}, {'registeredEvents': 1})
                if similar_user and similar_user_id != user_id:
                    similar_users.append(similar_user)
                    logger.debug(f"Found similar user: {similar_user_id}")
            except Exception as e:
                logger.error(f"Error fetching similar user {similar_user_id}: {str(e)}")

    logger.info(f"Similar Users: {[str(u['_id']) for u in similar_users]}")

    recommended_event_ids = set()
    for u in similar_users:
        for event_ref in u.get('registeredEvents', []):
            event_id_str = id_to_event_id_map.get(str(event_ref))
            if (
                event_id_str not in excluded_event_ids and
                event_id_str in event_id_to_index_map
            ):
                recommended_event_ids.add(event_id_str)
                logger.debug(f"Recommended Event Added: {event_id_str}")

    if not recommended_event_ids:
        logger.info("No similar events found for recommendations.")
        return jsonify({"message": "No similar events found.", "recommendations": []}), 200

    try:
        recommended_events = list(events_collection.aggregate([
            {'$match': {'eventId': {'$in': list(recommended_event_ids)}}},
            {'$lookup': {
                'from': 'organizations',
                'localField': 'organization',
                'foreignField': '_id',
                'as': 'organization_details'
            }},
            {'$unwind': {'path': '$organization_details', 'preserveNullAndEmptyArrays': True}},
            {'$project': {
                'eventId': 1,
                'title': 1,
                'image': 1,
                'summary': 1,
                'description': 1,
                'type': 1,
                'subtype': 1,
                'location': 1,
                'date': 1,
                'time': 1,
                'organization': {
                    'name': {'$ifNull': ['$organization_details.name', 'N/A']}
                }
            }},
            {'$limit': num_recommendations}
        ]))
        logger.info(f"Recommended Events Fetched: {[e['eventId'] for e in recommended_events]}")
    except Exception as e:
        logger.error(f"Database error when fetching recommended events: {str(e)}")
        return jsonify({"error": "Database error."}), 500

    if not recommended_events:
        logger.info("No recommended events found in the database.")
        return jsonify({"message": "No recommended events found.", "recommendations": []}), 200

    formatted_events = [{
        'eventId': event.get('eventId', ''),
        'title': event.get('title', ''),
        'organization': event.get('organization', {'name': 'N/A'}),
        'image': event.get('image', ''),
        'summary': event.get('summary', ''),
        'description': event.get('description', ''),
        'type': event.get('type', ''),
        'subtype': event.get('subtype', ''),
        'location': event.get('location', ''),
        'date': event.get('date', ''),
        'time': event.get('time', ''),
    } for event in recommended_events]

    logger.info(f"Returning {len(formatted_events)} recommendations for user {user_id}.")
    logger.debug(f"Formatted Recommendations: {formatted_events}")

    return jsonify({"recommendations": formatted_events}), 200


@app.route('/retrain', methods=['POST'])
def retrain():

    logger.info("Retraining model upon request...")
    success = train_model()
    if success:
        logger.info("Model retrained successfully.")
        return jsonify({"message": "Model retrained successfully."}), 200
    else:
        logger.error("Model retraining failed.")
        return jsonify({"error": "Model retraining failed."}), 500


if __name__ == '__main__':
    load_model()
    app.run(host='0.0.0.0', port=5003, debug=True)