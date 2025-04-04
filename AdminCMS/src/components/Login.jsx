import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaCalendarCheck } from 'react-icons/fa';
import { authService } from '../services/api';
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [userType, setUserType] = useState('organization');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (token && isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      let response;
      if (userType === 'organization') {
        response = await authService.organizationLogin(formData.email, formData.password);
        localStorage.setItem('token', response.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userType', 'organization');
        localStorage.setItem('organizationData', JSON.stringify(response.organization));
      } else {
        response = await authService.login(formData.email, formData.password);
        localStorage.setItem('token', response.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userType', 'user');
        localStorage.setItem('userData', JSON.stringify(response.user));
      }
      window.dispatchEvent(new Event('storage'));
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <LoginContainer>
      <LoginCard>
        <LogoContainer>
          <LogoIcon>
            <FaCalendarCheck />
          </LogoIcon>
          <LogoText>Event CMS</LogoText>
        </LogoContainer>
        <LoginHeader>
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </LoginHeader>
        <UserTypeToggle>
          <ToggleButton 
            active={userType === 'organization'} 
            onClick={() => setUserType('organization')}
            type="button"
          >
            Organization
          </ToggleButton>
          <ToggleButton 
            active={userType === 'user'} 
            onClick={() => setUserType('user')}
            type="button"
          >
            Regular User
          </ToggleButton>
        </UserTypeToggle>
        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}
        <LoginForm onSubmit={handleSubmit}>
          <FormGroup>
            <InputLabel htmlFor="email">Email Address</InputLabel>
            <InputWrapper>
              <InputIcon>
                <FaEnvelope />
              </InputIcon>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder={userType === 'organization' ? "organization@example.com" : "you@example.com"}
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </InputWrapper>
          </FormGroup>
          <FormGroup>
            <InputLabel htmlFor="password">Password</InputLabel>
            <InputWrapper>
              <InputIcon>
                <FaLock />
              </InputIcon>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </InputWrapper>
          </FormGroup>
          <RememberForgotRow>
            <RememberMeLabel>
              <input type="checkbox" />
              Remember me
            </RememberMeLabel>
            <ForgotPasswordLink to="#">Forgot password?</ForgotPasswordLink>
          </RememberForgotRow>
          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </SubmitButton>
        </LoginForm>
        <SignupPrompt>
          {userType === 'organization' ? (
            <>New organization? <SignupLink to="/signup">Create an organization account</SignupLink></>
          ) : (
            <>Don't have an account? <SignupLink to="/user-signup">Sign up as a user</SignupLink></>
          )}
        </SignupPrompt>
      </LoginCard>
    </LoginContainer>
  );
};
export default Login;
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f7fafc;
  padding: 20px;
`;
const LoginCard = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 450px;
`;
const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
`;
const LogoIcon = styled.div`
  font-size: 2rem;
  color: #4299e1;
  margin-right: 12px;
`;
const LogoText = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
`;
const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 20px;
  h1 {
    font-size: 1.5rem;
    color: #2d3748;
    margin: 0 0 8px 0;
  }
  p {
    font-size: 0.9rem;
    color: #718096;
    margin: 0;
  }
`;
const UserTypeToggle = styled.div`
  display: flex;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
`;
const ToggleButton = styled.button`
  flex: 1;
  padding: 10px;
  background-color: ${props => props.active ? '#4299e1' : 'white'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: ${props => props.active ? '600' : '400'};
  &:hover {
    background-color: ${props => props.active ? '#3182ce' : '#f7fafc'};
  }
`;
const ErrorMessage = styled.div`
  background-color: #fed7d7;
  color: #c53030;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 0.9rem;
`;
const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const InputLabel = styled.label`
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
`;
const InputWrapper = styled.div`
  position: relative;
`;
const InputIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 1rem;
`;
const Input = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
  &::placeholder {
    color: #cbd5e0;
  }
`;
const RememberForgotRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
`;
const RememberMeLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4a5568;
  cursor: pointer;
  input {
    cursor: pointer;
  }
`;
const ForgotPasswordLink = styled(Link)`
  color: #4299e1;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;
const SubmitButton = styled.button`
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #3182ce;
  }
  &:disabled {
    background-color: #90cdf4;
    cursor: not-allowed;
  }
`;
const SignupPrompt = styled.div`
  text-align: center;
  margin-top: 30px;
  font-size: 0.9rem;
  color: #4a5568;
`;
const SignupLink = styled(Link)`
  color: #4299e1;
  text-decoration: none;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;