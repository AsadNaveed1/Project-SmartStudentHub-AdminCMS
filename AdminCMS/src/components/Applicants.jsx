import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { FaSearch, FaEye, FaChevronDown, FaChevronUp, FaTimes, FaSpinner, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { eventService } from '../services/api';
import moment from 'moment';
const Applicants = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [applicantSearchTerm, setApplicantSearchTerm] = useState('');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 10;
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const eventsData = await eventService.getEventsByOrganization();
        const formattedEvents = eventsData.map(event => {
          const applicants = event.registeredUsers ? event.registeredUsers.map(user => {
            return {
              id: user._id || 'Unknown ID',
              name: user.fullName || 'No Name',
              email: user.email || 'No Email',
              uniYear: user.universityYear || 'Not provided',
              degree: user.degree || 'Not provided',
              faculty: user.faculty || 'Not provided'
            };
          }) : [];
          return {
            id: event.eventId || 'Unknown Event',
            title: event.title || 'Untitled Event',
            type: event.type || 'N/A',
            subtype: event.subtype || '',
            location: event.location || 'Not specified',
            date: event.date || 'No date',
            status: event.date && moment(event.date, 'DD-MM-YYYY').isSameOrAfter(moment(), 'day') 
              ? 'upcoming' 
              : 'past',
            applicants
          };
        });
        const sortedEvents = formattedEvents.sort((a, b) => {
          if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
          if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
          return moment(a.date, 'DD-MM-YYYY').diff(moment(b.date, 'DD-MM-YYYY'));
        });
        setEvents(sortedEvents);
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
    setCurrentPage(1);
  };
  const handleApplicantSearch = (e) => {
    setApplicantSearchTerm(e.target.value);
  };
  const filteredEvents = events.filter(event => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      event.title.toLowerCase().includes(searchLower) ||
      (event.type && event.type.toLowerCase().includes(searchLower)) ||
      (event.location && event.location.toLowerCase().includes(searchLower))
    );
  });
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const handleViewApplicants = (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (selectedEventId === eventId) {
      setSelectedEventId(null);
      setSelectedEvent(null);
      setApplicantSearchTerm('');
    } else {
      setSelectedEventId(eventId);
      setSelectedEvent(event);
      setApplicantSearchTerm('');
    }
  };
  const closeApplicantsTable = () => {
    setSelectedEventId(null);
    setSelectedEvent(null);
    setApplicantSearchTerm('');
  };
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  const filteredApplicants = selectedEvent?.applicants.filter(applicant => {
    if (!applicantSearchTerm) return true;
    const searchLower = applicantSearchTerm.toLowerCase();
    return (
      (applicant.name && applicant.name.toLowerCase().includes(searchLower)) ||
      (applicant.email && applicant.email.toLowerCase().includes(searchLower)) ||
      (applicant.degree && applicant.degree.toLowerCase().includes(searchLower)) ||
      (applicant.faculty && applicant.faculty.toLowerCase().includes(searchLower)) ||
      (applicant.uniYear && applicant.uniYear.toLowerCase().includes(searchLower))
    );
  }) || [];
  if (isLoading) {
    return (
      <LoadingContainer>
        <FaSpinner className="spinner" />
        <p>Loading applicant data...</p>
      </LoadingContainer>
    );
  }
  return (
    <ApplicantsContainer>
      <PageHeader>Event Applicants</PageHeader>
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
                <TableHeader>Applicants</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {currentEvents.length > 0 ? (
                currentEvents.map(event => (
                  <TableRow key={event.id} isActive={selectedEventId === event.id}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>
                      <div>{event.type}</div>
                      {event.subtype && <small>{event.subtype}</small>}
                    </TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>
                      <StatusBadge status={event.status}>
                        {event.status === 'upcoming' ? 'Upcoming' : 'Past'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{event.applicants.length}</TableCell>
                    <TableCell>
                      <ActionButton
                        title="View Applicants"
                        onClick={() => handleViewApplicants(event.id)}
                        isActive={selectedEventId === event.id}
                      >
                        <FaEye /> {selectedEventId === event.id ? <FaChevronUp /> : <FaChevronDown />}
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <EmptyTableCell colSpan="7">
                    {searchTerm ? 'No events found matching your search.' : 'No events found.'}
                  </EmptyTableCell>
                </TableRow>
              )}
            </tbody>
          </EventsTable>
        </ScrollableTable>
      </TableContainer>
      {filteredEvents.length > 0 && (
        <PaginationContainer>
          <PaginationInfo>
            Showing {indexOfFirstEvent + 1}-{Math.min(indexOfLastEvent, filteredEvents.length)} of {filteredEvents.length} events
          </PaginationInfo>
          <PaginationControls>
            <PaginationButton 
              onClick={goToPreviousPage} 
              disabled={currentPage === 1}
              title="Previous page"
            >
              <FaChevronLeft />
            </PaginationButton>
            <PageIndicator>{currentPage} of {totalPages}</PageIndicator>
            <PaginationButton 
              onClick={goToNextPage} 
              disabled={currentPage === totalPages}
              title="Next page"
            >
              <FaChevronRight />
            </PaginationButton>
          </PaginationControls>
        </PaginationContainer>
      )}
      {selectedEvent && (
        <ApplicantsTableSection>
          <ApplicantsTableHeader>
            <h3>Applicants for: {selectedEvent.title}</h3>
            <CloseButton onClick={closeApplicantsTable}>
              <FaTimes />
            </CloseButton>
          </ApplicantsTableHeader>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Search applicants..."
              value={applicantSearchTerm}
              onChange={handleApplicantSearch}
            />
            <SearchIcon>
              <FaSearch />
            </SearchIcon>
          </SearchContainer>
          <ApplicantsSummary>
            Showing {filteredApplicants.length} of {selectedEvent.applicants.length} applicants
          </ApplicantsSummary>
          <TableContainer>
            <ScrollableTable>
              <ApplicantsTable>
                <thead>
                  <tr>
                    <DetailHeader>ID</DetailHeader>
                    <DetailHeader>Name</DetailHeader>
                    <DetailHeader>Email</DetailHeader>
                    <DetailHeader>Uni Year</DetailHeader>
                    <DetailHeader>Degree</DetailHeader>
                    <DetailHeader>Faculty</DetailHeader>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplicants.length > 0 ? (
                    filteredApplicants.map(applicant => (
                      <DetailRow key={applicant.id}>
                        <DetailCell>{applicant.id}</DetailCell>
                        <DetailCell>{applicant.name}</DetailCell>
                        <DetailCell>{applicant.email}</DetailCell>
                        <DetailCell>{applicant.uniYear}</DetailCell>
                        <DetailCell>{applicant.degree}</DetailCell>
                        <DetailCell>{applicant.faculty}</DetailCell>
                      </DetailRow>
                    ))
                  ) : (
                    <DetailRow>
                      <EmptyTableCell colSpan="6">
                        {selectedEvent.applicants.length === 0 
                          ? 'No applicants have registered for this event yet.' 
                          : 'No applicants match your search criteria.'}
                      </EmptyTableCell>
                    </DetailRow>
                  )}
                </tbody>
              </ApplicantsTable>
            </ScrollableTable>
          </TableContainer>
        </ApplicantsTableSection>
      )}
    </ApplicantsContainer>
  );
};
export default Applicants;
const ApplicantsContainer = styled.div`
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
const ApplicantsSummary = styled.div`
  margin-bottom: 15px;
  font-size: 0.9rem;
  color: #718096;
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
  background-color: ${props => props.isActive ? '#ebf8ff' : 'transparent'};
  &:hover {
    background-color: ${props => props.isActive ? '#ebf8ff' : '#f7fafc'};
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
const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: ${props => props.isActive ? '#ebf8ff' : 'none'};
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  color: ${props => props.isActive ? '#3182ce' : '#4a5568'};
  transition: all 0.2s;
  white-space: nowrap;
  &:hover {
    background-color: ${props => props.isActive ? '#bee3f8' : '#edf2f7'};
  }
`;
const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 10px 0;
  @media (max-width: 640px) {
    flex-direction: column;
    gap: 15px;
  }
`;
const PaginationInfo = styled.div`
  font-size: 0.9rem;
  color: #718096;
`;
const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;
const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.disabled ? '#edf2f7' : 'white'};
  color: ${props => props.disabled ? '#a0aec0' : '#4a5568'};
  border: 1px solid ${props => props.disabled ? '#edf2f7' : '#e2e8f0'};
  border-radius: 4px;
  padding: 8px 12px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  &:hover:not(:disabled) {
    background-color: #edf2f7;
    border-color: #cbd5e0;
  }
`;
const PageIndicator = styled.div`
  font-size: 0.9rem;
  color: #4a5568;
`;
const ApplicantsTableSection = styled.div`
  margin-top: 30px;
  animation: fadeIn 0.3s ease-in-out;
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
const ApplicantsTableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  h3 {
    font-size: 1.2rem;
    color: #2d3748;
    margin: 0;
  }
`;
const CloseButton = styled.button`
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: #edf2f7;
    color: #e53e3e;
  }
`;
const ApplicantsTable = styled.table`
  width: 100%;
  min-width: 850px; 
  border-collapse: collapse;
`;
const DetailHeader = styled.th`
  padding: 12px 8px;
  text-align: left;
  background-color: #edf2f7;
  font-weight: 500;
  color: #4a5568;
  font-size: 0.9rem;
  white-space: nowrap;
`;
const DetailRow = styled.tr`
  &:nth-child(odd) {
    background-color: #f7fafc;
  }
  &:hover {
    background-color: #edf2f7;
  }
`;
const DetailCell = styled.td`
  padding: 10px 8px;
  font-size: 0.9rem;
  border-bottom: 1px solid #e2e8f0;
`;