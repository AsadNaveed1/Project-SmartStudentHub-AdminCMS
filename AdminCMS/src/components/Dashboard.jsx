import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaChartLine, 
  FaRegClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChevronRight,
  FaFilter,
  FaEllipsisV,
  FaSpinner
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { eventService } from '../services/api';
import moment from 'moment';
const Dashboard = ({ user }) => {
  const [timeframe, setTimeframe] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalApplicants: 0,
    recentApplicants: 0,
    recentEvents: []
  });
  const [error, setError] = useState('');
  const [events, setEvents] = useState([]);
  const [activities, setActivities] = useState([]);
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        const eventsData = await eventService.getEventsByOrganization();
        const currentDate = moment();
        const upcomingEvents = eventsData.filter(event => 
          moment(event.date, 'DD-MM-YYYY').isSameOrAfter(currentDate, 'day')
        );
        const totalRegistrations = eventsData.reduce((total, event) => 
          total + (event.registeredUsers ? event.registeredUsers.length : 0), 0
        );
        const mockActivities = [];
        if (upcomingEvents.length > 0) {
          mockActivities.push({ 
            id: 1, 
            type: 'registration', 
            user: 'New user', 
            event: upcomingEvents[0]?.title || 'Event', 
            time: '2 hours ago' 
          });
        }
        mockActivities.push({ 
          id: 2, 
          type: 'event_created', 
          user: 'You', 
          event: 'New Event', 
          time: '3 hours ago' 
        });
        if (upcomingEvents.length > 1) {
          mockActivities.push({ 
            id: 3, 
            type: 'registration', 
            user: 'Another user', 
            event: upcomingEvents[1]?.title || 'Event', 
            time: '5 hours ago' 
          });
        }
        const sortedUpcomingEvents = [...upcomingEvents].sort((a, b) => 
          moment(a.date, 'DD-MM-YYYY').diff(moment(b.date, 'DD-MM-YYYY'))
        );
        const formattedEvents = sortedUpcomingEvents.map(event => ({
          id: event.eventId,
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
          status: 'confirmed',
          applicants: event.registeredUsers ? event.registeredUsers.length : 0
        }));
        const popularEvents = [...eventsData]
          .sort((a, b) => 
            (b.registeredUsers ? b.registeredUsers.length : 0) - 
            (a.registeredUsers ? a.registeredUsers.length : 0)
          )
          .slice(0, 3)
          .map(event => ({
            id: event.eventId,
            title: event.title,
            applicants: event.registeredUsers ? event.registeredUsers.length : 0,
            capacity: 50
          }));
        setEvents(eventsData);
        setActivities(mockActivities);
        setStats({
          totalEvents: eventsData.length,
          upcomingEvents: upcomingEvents.length,
          totalApplicants: totalRegistrations,
          recentApplicants: Math.min(10, totalRegistrations),
          recentEvents: formattedEvents.slice(0, 3),
          popularEvents: popularEvents
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventData();
  }, [timeframe]);
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    setIsLoading(true);
  };
  if (isLoading) {
    return (
      <DashboardContainer>
        <PageHeader>Dashboard</PageHeader>
        <LoadingContainer>
          <FaSpinner className="spinner" />
          <LoadingText>Loading dashboard data...</LoadingText>
        </LoadingContainer>
      </DashboardContainer>
    );
  }
  return (
    <DashboardContainer>
      <DashboardHeader>
        <PageHeader>Dashboard</PageHeader>
        <TimeframeSelector>
          <TimeframeButton 
            isActive={timeframe === 'week'} 
            onClick={() => handleTimeframeChange('week')}
          >
            Week
          </TimeframeButton>
          <TimeframeButton 
            isActive={timeframe === 'month'} 
            onClick={() => handleTimeframeChange('month')}
          >
            Month
          </TimeframeButton>
          <TimeframeButton 
            isActive={timeframe === 'year'} 
            onClick={() => handleTimeframeChange('year')}
          >
            Year
          </TimeframeButton>
        </TimeframeSelector>
      </DashboardHeader>
      {error && <ErrorAlert>{error}</ErrorAlert>}
      <StatsGrid>
        <StatCard>
          <StatIconContainer color="#4299e1">
            <FaCalendarAlt />
          </StatIconContainer>
          <StatContent>
            <StatValue>{stats.totalEvents}</StatValue>
            <StatLabel>Total Events</StatLabel>
            <StatTrend isPositive>+{Math.min(2, stats.totalEvents)} this {timeframe}</StatTrend>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIconContainer color="#48bb78">
            <FaRegClock />
          </StatIconContainer>
          <StatContent>
            <StatValue>{stats.upcomingEvents}</StatValue>
            <StatLabel>Upcoming Events</StatLabel>
            <StatTrend>
              {stats.recentEvents.length > 0 
                ? `Next: ${stats.recentEvents[0].date}` 
                : 'No upcoming events'}
            </StatTrend>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIconContainer color="#ed8936">
            <FaUsers />
          </StatIconContainer>
          <StatContent>
            <StatValue>{stats.totalApplicants}</StatValue>
            <StatLabel>Total Applicants</StatLabel>
            <StatTrend isPositive>+{stats.recentApplicants} this {timeframe}</StatTrend>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIconContainer color="#9f7aea">
            <FaChartLine />
          </StatIconContainer>
          <StatContent>
            <StatValue>
              {stats.totalEvents > 0 
                ? Math.round(stats.totalApplicants / stats.totalEvents) 
                : 0}
            </StatValue>
            <StatLabel>Avg. Applicants/Event</StatLabel>
            <StatTrend isPositive>+5% from last {timeframe}</StatTrend>
          </StatContent>
        </StatCard>
      </StatsGrid>
      <DashboardContent>
        <DashboardColumn>
          <SectionCard>
            <SectionHeader>
              <h2>Upcoming Events</h2>
              <ViewAllLink to="/manage-events">View All</ViewAllLink>
            </SectionHeader>
            <EventsList>
              {stats.recentEvents.length > 0 ? (
                stats.recentEvents.map(event => (
                  <EventItem key={event.id}>
                    <EventItemMain>
                      <EventDate>
                        <span>{event.date}</span>
                        <small>{event.time}</small>
                      </EventDate>
                      <EventDetails>
                        <EventTitle>{event.title}</EventTitle>
                        <EventLocation>{event.location}</EventLocation>
                      </EventDetails>
                    </EventItemMain>
                    <EventItemSide>
                      <StatusIndicator status={event.status}>
                        {event.status === 'confirmed' ? (
                          <FaCheckCircle />
                        ) : (
                          <FaExclamationTriangle />
                        )}
                      </StatusIndicator>
                      <EventApplicants>{event.applicants} applicants</EventApplicants>
                    </EventItemSide>
                  </EventItem>
                ))
              ) : (
                <EmptyMessage>No upcoming events scheduled.</EmptyMessage>
              )}
            </EventsList>
          </SectionCard>
          <SectionCard>
            <SectionHeader>
              <h2>Popular Events</h2>
              <FilterButton>
                <FaFilter />
              </FilterButton>
            </SectionHeader>
            {stats.popularEvents && stats.popularEvents.length > 0 ? (
              stats.popularEvents.map(event => (
                <PopularEventItem key={event.id}>
                  <PopularEventInfo>
                    <h3>{event.title}</h3>
                    <p>{event.applicants} applicants</p>
                  </PopularEventInfo>
                  <CapacityBar>
                    <CapacityFill width={(event.applicants / event.capacity) * 100} />
                  </CapacityBar>
                  <CapacityText>
                    {Math.round((event.applicants / event.capacity) * 100)}% full
                  </CapacityText>
                </PopularEventItem>
              ))
            ) : (
              <EmptyMessage>No popular events to display.</EmptyMessage>
            )}
          </SectionCard>
        </DashboardColumn>
        <DashboardColumn>
          <SectionCard>
            <SectionHeader>
              <h2>Recent Activity</h2>
              <MoreButton>
                <FaEllipsisV />
              </MoreButton>
            </SectionHeader>
            <ActivityList>
              {activities.map(activity => (
                <ActivityItem key={activity.id}>
                  <ActivityIcon type={activity.type}>
                    {activity.type === 'registration' ? (
                      <FaUsers />
                    ) : activity.type === 'event_created' ? (
                      <FaCalendarAlt />
                    ) : (
                      <FaRegClock />
                    )}
                  </ActivityIcon>
                  <ActivityContent>
                    <ActivityMessage>
                      <strong>{activity.user}</strong> {activity.type === 'registration' 
                        ? 'registered for' 
                        : activity.type === 'event_created'
                        ? 'created event'
                        : 'updated event'
                      } <span>{activity.event}</span>
                    </ActivityMessage>
                    <ActivityTime>{activity.time}</ActivityTime>
                  </ActivityContent>
                </ActivityItem>
              ))}
            </ActivityList>
            <ViewMoreButton>
              View More Activity <FaChevronRight />
            </ViewMoreButton>
          </SectionCard>
          <SectionCard>
            <SectionHeader>
              <h2>Quick Actions</h2>
            </SectionHeader>
            <QuickActionsGrid>
              <QuickActionButton to="/create-event">
                <FaCalendarAlt />
                <span>Create Event</span>
              </QuickActionButton>
              <QuickActionButton to="/manage-events">
                <FaRegClock />
                <span>Manage Events</span>
              </QuickActionButton>
              <QuickActionButton to="/applicants">
                <FaUsers />
                <span>View Applicants</span>
              </QuickActionButton>
              <QuickActionButton to="#">
                <FaChartLine />
                <span>Analytics</span>
              </QuickActionButton>
            </QuickActionsGrid>
          </SectionCard>
        </DashboardColumn>
      </DashboardContent>
    </DashboardContainer>
  );
};
export default Dashboard;
const ErrorAlert = styled.div`
  background-color: #fed7d7;
  color: #c53030;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 0.9rem;
`;
const EmptyMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #718096;
  font-size: 0.9rem;
`;
const DashboardContainer = styled.div`
  width: 100%;
`;
const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
`;
const PageHeader = styled.h1`
  font-size: 1.8rem;
  color: #333;
  margin: 0;
  @media (max-width: 768px) {
    margin-top: 10px; 
  }
`;
const TimeframeSelector = styled.div`
  display: flex;
  gap: 10px;
  background-color: #edf2f7;
  padding: 5px;
  border-radius: 8px;
`;
const TimeframeButton = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.isActive ? 'white' : 'transparent'};
  color: ${props => props.isActive ? '#3182ce' : '#4a5568'};
  border: none;
  border-radius: 6px;
  font-weight: ${props => props.isActive ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background-color: ${props => props.isActive ? 'white' : '#e2e8f0'};
  }
`;
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  .spinner {
    animation: spin 1s linear infinite;
    font-size: 2rem;
    color: #3182ce;
    margin-bottom: 16px;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
const LoadingText = styled.p`
  color: #718096;
  font-size: 1rem;
`;
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;
const StatCard = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;
const StatIconContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: ${props => props.color || '#4299e1'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  margin-right: 16px;
`;
const StatContent = styled.div`
  flex: 1;
`;
const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1.2;
`;
const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 4px;
`;
const StatTrend = styled.div`
  font-size: 0.8rem;
  color: ${props => props.isPositive ? '#48bb78' : '#718096'};
  display: flex;
  align-items: center;
`;
const DashboardContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;
const DashboardColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const SectionCard = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;
const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  h2 {
    font-size: 1.2rem;
    color: #2d3748;
    margin: 0;
  }
`;
const ViewAllLink = styled(Link)`
  font-size: 0.9rem;
  color: #4299e1;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;
const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const EventItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: #f7fafc;
  transition: background-color 0.2s;
  &:hover {
    background-color: #edf2f7;
  }
`;
const EventItemMain = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;
const EventDate = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
  span {
    font-size: 0.9rem;
    font-weight: 600;
    color: #2d3748;
  }
  small {
    font-size: 0.75rem;
    color: #718096;
  }
`;
const EventDetails = styled.div`
  display: flex;
  flex-direction: column;
`;
const EventTitle = styled.h3`
  font-size: 1rem;
  color: #2d3748;
  margin: 0 0 4px 0;
`;
const EventLocation = styled.div`
  font-size: 0.8rem;
  color: #718096;
`;
const EventItemSide = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
`;
const StatusIndicator = styled.div`
  color: ${props => props.status === 'confirmed' ? '#48bb78' : '#ed8936'};
  font-size: 1rem;
`;
const EventApplicants = styled.div`
  font-size: 0.8rem;
  color: #718096;
`;
const PopularEventItem = styled.div`
  padding: 15px 0;
  border-bottom: 1px solid #edf2f7;
  &:last-child {
    border-bottom: none;
  }
`;
const PopularEventInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  h3 {
    font-size: 1rem;
    color: #2d3748;
    margin: 0;
  }
  p {
    font-size: 0.9rem;
    color: #718096;
    margin: 0;
  }
`;
const CapacityBar = styled.div`
  height: 6px;
  background-color: #edf2f7;
  border-radius: 3px;
  margin-bottom: 5px;
  overflow: hidden;
`;
const CapacityFill = styled.div`
  height: 100%;
  width: ${props => props.width}%;
  background-color: #4299e1;
  border-radius: 3px;
`;
const CapacityText = styled.div`
  font-size: 0.8rem;
  color: #718096;
  text-align: right;
`;
const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;
const ActivityIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: ${props => {
    switch(props.type) {
      case 'registration': return '#ebf8ff';
      case 'event_created': return '#feebc8';
      default: return '#e9d8fd';
    }
  }};
  color: ${props => {
    switch(props.type) {
      case 'registration': return '#3182ce';
      case 'event_created': return '#dd6b20';
      default: return '#6b46c1';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
`;
const ActivityContent = styled.div`
  flex: 1;
`;
const ActivityMessage = styled.div`
  font-size: 0.9rem;
  color: #4a5568;
  margin-bottom: 4px;
  strong, span {
    color: #2d3748;
  }
`;
const ActivityTime = styled.div`
  font-size: 0.8rem;
  color: #a0aec0;
`;
const ViewMoreButton = styled.button`
  background: none;
  border: none;
  color: #4299e1;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 16px;
  padding: 8px 0;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;
const FilterButton = styled.button`
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 4px;
  &:hover {
    background-color: #edf2f7;
    color: #4299e1;
  }
`;
const MoreButton = styled.button`
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 4px;
  &:hover {
    background-color: #edf2f7;
    color: #4a5568;
  }
`;
const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;
const QuickActionButton = styled(Link)`
  background-color: #f7fafc;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;
  color: #4a5568;
  transition: all 0.2s;
  svg {
    font-size: 1.5rem;
    color: #4299e1;
  }
  span {
    font-size: 0.9rem;
    font-weight: 500;
  }
  &:hover {
    background-color: #edf2f7;
    transform: translateY(-2px);
  }
`;