import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import { 
  FaTachometerAlt, 
  FaCalendarPlus, 
  FaCalendarAlt, 
  FaUsers, 
  FaBars, 
  FaTimes,
  FaSignOutAlt,
  FaEdit,
  FaBuilding
} from 'react-icons/fa';
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [organizationData, setOrganizationData] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const storedOrgData = localStorage.getItem('organizationData');
    if (storedOrgData) {
      setOrganizationData(JSON.parse(storedOrgData));
    }
  }, []);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('organizationData');
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };
  return (
    <>
      <MobileToggle onClick={toggleSidebar}>
        <FaBars />
      </MobileToggle>
      <SidebarContainer isOpen={isOpen}>
        <SidebarHeader>
          <h2>Event CMS</h2>
          <CloseButton onClick={toggleSidebar}>
            <FaTimes />
          </CloseButton>
        </SidebarHeader>
        {organizationData && (
          <UserInfo>
            <UserIcon>
              {organizationData.image ? (
                <OrgImage src={organizationData.image} alt={organizationData.name} />
              ) : (
                <FaBuilding />
              )}
            </UserIcon>
            <UserName>{organizationData.name || 'Organization'}</UserName>
            <UserRole>{organizationData.email || ''}</UserRole>
          </UserInfo>
        )}
        <SidebarNav>
          <SidebarLink to="/" onClick={() => setIsOpen(false)}>
            <FaTachometerAlt /> Dashboard
          </SidebarLink>
          <SidebarLink to="/create-event" onClick={() => setIsOpen(false)}>
            <FaCalendarPlus /> Create Event
          </SidebarLink>
          <SidebarLink to="/manage-events" onClick={() => setIsOpen(false)}>
            <FaCalendarAlt /> Manage Events
          </SidebarLink>
          <SidebarLink to="/applicants" onClick={() => setIsOpen(false)}>
            <FaUsers /> Applicants
          </SidebarLink>
          <SidebarLink to="/edit-profile" onClick={() => setIsOpen(false)}>
            <FaEdit /> Edit Profile
          </SidebarLink>
        </SidebarNav>
        <SidebarFooter>
          <LogoutButton onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </LogoutButton>
        </SidebarFooter>
      </SidebarContainer>
      {}
      {isOpen && <Overlay onClick={toggleSidebar} />}
    </>
  );
};
export default Sidebar;
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
  display: none;
  @media (max-width: 768px) {
    display: block;
  }
`;
const MobileToggle = styled.button`
  display: none;
  position: fixed;
  top: 10px;
  left: 10px;
  background-color: #4a5568;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px;
  z-index: 997; 
  cursor: pointer;
  font-size: 1.2rem;
  @media (max-width: 768px) {
    display: block;
  }
`;
const CloseButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  @media (max-width: 768px) {
    display: block;
  }
`;
const SidebarContainer = styled.div`
  width: 250px;
  background-color: #2d3748;
  color: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  @media (max-width: 768px) {
    position: fixed;
    width: 250px;
    z-index: 999;
    left: ${props => props.isOpen ? '0' : '-250px'};
  }
`;
const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #4a5568;
  display: flex;
  justify-content: space-between;
  align-items: center;
  h2 {
    margin: 0;
    font-size: 1.5rem;
  }
`;
const UserInfo = styled.div`
  padding: 20px;
  border-bottom: 1px solid #4a5568;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;
const UserIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #4299e1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 10px;
  overflow: hidden;
`;
const OrgImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
const UserName = styled.div`
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 4px;
`;
const UserRole = styled.div`
  font-size: 0.8rem;
  color: #cbd5e0;
`;
const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 15px 0;
  flex-grow: 1;
`;
const SidebarLink = styled(NavLink)`
  padding: 12px 20px;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #cbd5e0;
  transition: all 0.2s;
  gap: 10px;
  &:hover {
    background-color: #4a5568;
    color: white;
  }
  &.active {
    background-color: #4299e1;
    color: white;
  }
`;
const SidebarFooter = styled.div`
  padding: 20px;
  border-top: 1px solid #4a5568;
  margin-top: auto;
`;
const LogoutButton = styled.button`
  width: 100%;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #e53e3e;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 1rem;
  &:hover {
    background-color: #c53030;
  }
`;