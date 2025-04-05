import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { styled } from 'styled-components';
import Sidebar from './components/Sidebar';
import CreateEvent from './components/CreateEvent';
import ManageEvents from './components/ManageEvents';
import Applicants from './components/Applicants';
import Dashboard from './components/Dashboard';
import EditProfile from './components/EditProfile';
import Login from './components/Login';
import Signup from './components/Signup';
import SetOrganizationCredentials from './components/SetOrganizationCredentials';
import { authService } from './services/api';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true' && localStorage.getItem('token');
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true' && localStorage.getItem('token')
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Auth verification failed:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    verifyAuth();
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const authStatus = localStorage.getItem('isAuthenticated') === 'true' && token;
      setIsAuthenticated(authStatus);
      if (authStatus && !user) {
        authService.getCurrentUser()
          .then(userData => setUser(userData))
          .catch(err => console.error('Failed to load user data:', err));
      }
    };
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [user]);

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <p>Loading application...</p>
      </LoadingContainer>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/set-organization-credentials" element={<SetOrganizationCredentials />} />
        <Route path="*" element={
          <ProtectedRoute>
            <AppContainer>
              <Sidebar user={user} />
              <MainContent>
                <Routes>
                  <Route path="/" element={<Dashboard user={user} />} />
                  <Route path="/create-event" element={<CreateEvent user={user} />} />
                  <Route path="/manage-events" element={<ManageEvents user={user} />} />
                  <Route path="/applicants" element={<Applicants user={user} />} />
                  <Route path="/edit-profile" element={<EditProfile user={user} />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </MainContent>
            </AppContainer>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3182ce;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f5f5;
  @media (max-width: 768px) {
    padding: 15px;
    padding-top: 50px; 
  }
`;

//http://localhost:5173/set-organization-credentials