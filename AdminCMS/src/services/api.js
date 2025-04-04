import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userType');
        localStorage.removeItem('userData');
        localStorage.removeItem('organizationData');
        window.dispatchEvent(new Event('storage'));
      }
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  organizationLogin: async (email, password) => {
    const response = await api.post('/auth/organization/login', { email, password });
    return response.data;
  },
  signupUser: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },
  signupOrganization: async (organizationData) => {
    const response = await api.post('/auth/organization/signup', organizationData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
export const organizationService = {
  getAllOrganizations: async () => {
    const response = await api.get('/organizations');
    return response.data;
  },
  getOrganizationById: async (id) => {
    const response = await api.get(`/organizations/${id}`);
    return response.data;
  },
  updateOrganization: async (id, organizationData) => {
    const response = await api.put(`/organizations/${id}`, organizationData);
    return response.data;
  },
  deleteOrganization: async (id) => {
    const response = await api.delete(`/organizations/${id}`);
    return response.data;
  }
};
export const eventService = {
  getAllEvents: async () => {
    const response = await api.get('/events');
    return response.data;
  },
  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  getEventsByCategory: async (category) => {
    const response = await api.get(`/events/category/${category}`);
    return response.data;
  },
  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },
  updateEvent: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
  getEventApplicants: async (id) => {
    const event = await api.get(`/events/${id}`);
    return event.data.registeredUsers || [];
  }
};
export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }
};
export default api;