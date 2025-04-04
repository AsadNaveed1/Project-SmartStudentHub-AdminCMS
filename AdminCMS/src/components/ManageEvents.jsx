import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { FaSearch, FaEye, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import { eventService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
const ManageEvents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const eventsData = await eventService.getAllEvents();
        const formattedEvents = eventsData.map(event => ({
          id: event.eventId,
          title: event.title,
          type: event.type,
          subtype: event.subtype,
          location: event.location,
          date: event.date,
          time: event.time,
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
    fetchEvents();
  }, []);
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  const filteredEvents = events.filter(event => {
    const searchLower = searchTerm.toLowerCase();
    return (
      event.title.toLowerCase().includes(searchLower) ||
      event.type.toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower) ||
      (event.organization && event.organization.toLowerCase().includes(searchLower))
    );
  });
  const handleViewEvent = (eventId) => {
    alert(`View event with ID: ${eventId}`);
  };
  const handleEditEvent = (eventId) => {
    navigate(`/edit-event/${eventId}`);
  };
  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventService.deleteEvent(eventId);
        setEvents(events.filter(event => event.id !== eventId));
        alert('Event deleted successfully');
      } catch (err) {
        console.error('Error deleting event:', err);
        alert('Failed to delete event. Please try again.');
      }
    }
  };
  if (isLoading) {
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
                      <small>{event.subtype}</small>
                    </TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>
                      <div>{event.date}</div>
                      <small>{event.time}</small>
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
                          onClick={() => handleDeleteEvent(event.id)}
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
  background-color: ${props => props.status === 'upcoming' ? '#ebf8ff' : '#f7fafc'};
  color: ${props => props.status === 'upcoming' ? '#3182ce' : '#718096'};
  border: 1px solid ${props => props.status === 'upcoming' ? '#bee3f8' : '#e2e8f0'};
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