import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { FaSearch, FaEye, FaEdit, FaTrash, FaSpinner, FaTimes, FaMapMarkerAlt, 
         FaCalendarAlt, FaClock, FaUserFriends, FaImage, FaExclamationTriangle } from 'react-icons/fa';
import { eventService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import EditEventModal from './EditEventModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
const ManageEvents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    fetchEvents();
  }, []);
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const eventsData = await eventService.getEventsByOrganization();
      const formattedEvents = eventsData.map(event => ({
        id: event.eventId,
        _id: event._id,
        title: event.title,
        type: event.type,
        subtype: event.subtype,
        location: event.location,
        date: event.date,
        time: event.time,
        description: event.description || '',
        summary: event.summary || '',
        capacity: event.capacity || 'Unlimited',
        image: event.image || 'https://via.placeholder.com/500',
        status: moment(event.date, 'DD-MM-YYYY').isSameOrAfter(moment(), 'day') ? 'upcoming' : 'past',
        organization: event.organization?.name || 'Unknown Organization',
        organizationId: event.organization?._id || null,
        registeredUsers: event.registeredUsers || []
      }));
      setEvents(formattedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  const filteredEvents = events.filter(event => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      event.title.toLowerCase().includes(searchLower) ||
      (event.type && event.type.toLowerCase().includes(searchLower)) ||
      (event.location && event.location.toLowerCase().includes(searchLower)) ||
      (event.organization && event.organization.toLowerCase().includes(searchLower))
    );
  });
  const handleViewEvent = async (eventId) => {
    try {
      setIsLoading(true);
      const eventDetails = await eventService.getEventById(eventId);
      const localEvent = events.find(e => e.id === eventId);
      setSelectedEvent({
        ...localEvent,
        ...eventDetails,
      });
      setViewModalOpen(true);
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError('Failed to load event details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleEditEvent = async (eventId) => {
    try {
      setIsLoading(true);
      const eventDetails = await eventService.getEventById(eventId);
      const localEvent = events.find(e => e.id === eventId);
      setSelectedEvent({
        ...localEvent,
        ...eventDetails,
      });
      setEditModalOpen(true);
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError('Failed to load event details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteClick = (event) => {
    setSelectedEvent(event);
    setDeleteModalOpen(true);
  };
  const handleDeleteConfirm = async () => {
    try {
      setIsSubmitting(true);
      await eventService.deleteEvent(selectedEvent.id);
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      setDeleteModalOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleModalClose = () => {
    setViewModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setSelectedEvent(null);
  };
  const handleEventUpdated = (updatedEvent) => {
    setEvents(events.map(event => 
      event.id === updatedEvent.id ? {
        ...event,
        ...updatedEvent,
        status: updatedEvent.date && moment(updatedEvent.date, 'DD-MM-YYYY').isSameOrAfter(moment(), 'day') 
          ? 'upcoming' 
          : 'past',
      } : event
    ));
    setEditModalOpen(false);
    setSelectedEvent(null);
  };
  if (isLoading && !selectedEvent) {
    return (
      <LoadingContainer>
        <FaSpinner className="spinner" />
        <p>Loading events...</p>
      </LoadingContainer>
    );
  }
  return (
    <ManageEventsContainer>
      <PageHeader>Manage Events</PageHeader>
      {error && <ErrorAlert>{error}</ErrorAlert>}
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <SearchIcon>
          <FaSearch />
        </SearchIcon>
      </SearchContainer>
      <TableContainer>
        <ScrollableTable>
          <EventsTable>
            <thead>
              <tr>
                <TableHeader>Title</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Location</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Registrations</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length > 0 ? (
                filteredEvents.map(event => (
                  <TableRow key={event.id}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>
                      <div>{event.type}</div>
                      {event.subtype && <small>{event.subtype}</small>}
                    </TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>
                      <div>{event.date}</div>
                      {event.time && <small>{event.time}</small>}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={event.status}>
                        {event.status === 'upcoming' ? 'Upcoming' : 'Past'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      {event.registeredUsers ? event.registeredUsers.length : 0}
                    </TableCell>
                    <TableCell>
                      <ActionButtonsContainer>
                        <ActionButton
                          title="View"
                          onClick={() => handleViewEvent(event.id)}
                        >
                          <FaEye />
                        </ActionButton>
                        <ActionButton
                          title="Edit"
                          onClick={() => handleEditEvent(event.id)}
                        >
                          <FaEdit />
                        </ActionButton>
                        <ActionButton
                          title="Delete"
                          className="delete"
                          onClick={() => handleDeleteClick(event)}
                        >
                          <FaTrash />
                        </ActionButton>
                      </ActionButtonsContainer>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <EmptyTableCell colSpan="7">
                    {searchTerm ? 'No events found matching your search.' : 'No events found. Create your first event!'}
                  </EmptyTableCell>
                </TableRow>
              )}
            </tbody>
          </EventsTable>
        </ScrollableTable>
      </TableContainer>
      {}
      {viewModalOpen && selectedEvent && (
        <ModalOverlay>
          <ModalContainer>
            <ModalHeader>
              <ModalTitle>{selectedEvent.title}</ModalTitle>
              <CloseButton onClick={handleModalClose}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <EventImageContainer>
                <EventImage src={selectedEvent.image} alt={selectedEvent.title} />
              </EventImageContainer>
              <EventDetails>
                <DetailItem>
                  <DetailIcon><FaMapMarkerAlt /></DetailIcon>
                  <DetailText>
                    <DetailLabel>Location</DetailLabel>
                    <DetailValue>{selectedEvent.location}</DetailValue>
                  </DetailText>
                </DetailItem>
                <DetailItem>
                  <DetailIcon><FaCalendarAlt /></DetailIcon>
                  <DetailText>
                    <DetailLabel>Date</DetailLabel>
                    <DetailValue>{selectedEvent.date}</DetailValue>
                  </DetailText>
                </DetailItem>
                <DetailItem>
                  <DetailIcon><FaClock /></DetailIcon>
                  <DetailText>
                    <DetailLabel>Time</DetailLabel>
                    <DetailValue>{selectedEvent.time || 'Not specified'}</DetailValue>
                  </DetailText>
                </DetailItem>
                <DetailItem>
                  <DetailIcon><FaUserFriends /></DetailIcon>
                  <DetailText>
                    <DetailLabel>Capacity</DetailLabel>
                    <DetailValue>{selectedEvent.capacity || 'Unlimited'}</DetailValue>
                  </DetailText>
                </DetailItem>
              </EventDetails>
              <EventSection>
                <SectionTitle>Event Type</SectionTitle>
                <SectionContent>
                  {selectedEvent.type} {selectedEvent.subtype && `- ${selectedEvent.subtype}`}
                </SectionContent>
              </EventSection>
              {selectedEvent.summary && (
                <EventSection>
                  <SectionTitle>Summary</SectionTitle>
                  <SectionContent>{selectedEvent.summary}</SectionContent>
                </EventSection>
              )}
              {selectedEvent.description && (
                <EventSection>
                  <SectionTitle>Description</SectionTitle>
                  <SectionContent>{selectedEvent.description}</SectionContent>
                </EventSection>
              )}
              <EventSection>
                <SectionTitle>Registered Applicants</SectionTitle>
                <SectionContent>
                  <StatusBadge status={selectedEvent.status === 'upcoming' ? 'active' : 'inactive'}>
                    {selectedEvent.registeredUsers?.length || 0} {selectedEvent.registeredUsers?.length === 1 ? 'person' : 'people'} registered
                  </StatusBadge>
                </SectionContent>
              </EventSection>
            </ModalBody>
            <ModalFooter>
              <CloseModalButton onClick={handleModalClose}>Close</CloseModalButton>
            </ModalFooter>
          </ModalContainer>
        </ModalOverlay>
      )}
      {}
      {editModalOpen && selectedEvent && (
        <EditEventModal
          isOpen={editModalOpen}
          onClose={handleModalClose}
          event={selectedEvent}
          onEventUpdated={handleEventUpdated}
        />
      )}
      {}
      {deleteModalOpen && selectedEvent && (
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={handleModalClose}
          onConfirm={handleDeleteConfirm}
          eventTitle={selectedEvent.title}
        />
      )}
    </ManageEventsContainer>
  );
};
export default ManageEvents;
const ManageEventsContainer = styled.div`
  width: 100%;
`;
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  .spinner {
    animation: spin 1s linear infinite;
    font-size: 2rem;
    color: #4299e1;
    margin-bottom: 16px;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
const PageHeader = styled.h1`
  margin-bottom: 24px;
  font-size: 1.8rem;
  color: #333;
  @media (max-width: 768px) {
    margin-top: 10px; 
  }
`;
const ErrorAlert = styled.div`
  background-color: #fed7d7;
  color: #c53030;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 0.9rem;
`;
const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
  max-width: 400px;
`;
const SearchInput = styled.input`
  width: 100%;
  padding: 10px 40px 10px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;
const SearchIcon = styled.span`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
`;
const TableContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden; 
`;
const ScrollableTable = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; 
  @media (max-width: 1024px) {
    background-image: linear-gradient(to right, rgba(255,255,255,0), rgba(0,0,0,0.05) 80%);
    background-size: 15px 100%;
    background-repeat: no-repeat;
    background-position: right;
  }
`;
const EventsTable = styled.table`
  width: 100%;
  min-width: 750px; 
  border-collapse: collapse;
`;
const TableHeader = styled.th`
  padding: 16px;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
  font-weight: 600;
  color: #4a5568;
  white-space: nowrap; 
`;
const TableRow = styled.tr`
  &:hover {
    background-color: #f7fafc;
  }
`;
const TableCell = styled.td`
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  small {
    display: block;
    color: #718096;
    font-size: 0.8rem;
    margin-top: 4px;
  }
`;
const EmptyTableCell = styled.td`
  padding: 24px 16px;
  text-align: center;
  color: #718096;
`;
const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${props => props.status === 'upcoming' || props.status === 'active' ? '#ebf8ff' : '#f7fafc'};
  color: ${props => props.status === 'upcoming' || props.status === 'active' ? '#3182ce' : '#718096'};
  border: 1px solid ${props => props.status === 'upcoming' || props.status === 'active' ? '#bee3f8' : '#e2e8f0'};
`;
const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
  white-space: nowrap;
`;
const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  color: #4a5568;
  transition: all 0.2s;
  &:hover {
    background-color: #edf2f7;
  }
  &.delete {
    color: #e53e3e;
    &:hover {
      background-color: #fed7d7;
    }
  }
`;
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;
const ModalContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: fadeIn 0.3s;
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
`;
const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #2d3748;
`;
const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #718096;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  &:hover {
    background-color: #f7fafc;
    color: #e53e3e;
  }
`;
const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  max-height: calc(90vh - 130px);
`;
const EventImageContainer = styled.div`
  width: 100%;
  height: 200px;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f7fafc;
`;
const EventImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
const EventDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;
const DetailItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;
const DetailIcon = styled.div`
  color: #4a5568;
  min-width: 20px;
  padding-top: 2px;
`;
const DetailText = styled.div`
  display: flex;
  flex-direction: column;
`;
const DetailLabel = styled.span`
  color: #718096;
  font-size: 0.875rem;
`;
const DetailValue = styled.span`
  color: #2d3748;
  font-weight: 500;
`;
const EventSection = styled.div`
  margin-bottom: 20px;
`;
const SectionTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: #4a5568;
`;
const SectionContent = styled.div`
  color: #2d3748;
  line-height: 1.5;
`;
const ModalFooter = styled.div`
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;
const CloseModalButton = styled.button`
  padding: 8px 16px;
  background-color: #edf2f7;
  color: #4a5568;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background-color: #e2e8f0;
  }
`;