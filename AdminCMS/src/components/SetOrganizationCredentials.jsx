import React, { useState } from 'react';
import { styled } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaIdCard, FaCalendarCheck } from 'react-icons/fa';
import axios from 'axios';
const SetOrganizationCredentials = () => {
  const [formData, setFormData] = useState({
    organizationId: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
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
    setSuccess('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/organization/set-credentials', {
        organizationId: formData.organizationId,
        email: formData.email,
        password: formData.password
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userType', 'organization');
      localStorage.setItem('organizationData', JSON.stringify(response.data.organization));
      window.dispatchEvent(new Event('storage'));
      setSuccess('Organization credentials set successfully! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Set credentials error:', err);
      setError(err.response?.data?.message || 'Failed to set credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Container>
      <Card>
        <LogoContainer>
          <LogoIcon>
            <FaCalendarCheck />
          </LogoIcon>
          <LogoText>Event CMS</LogoText>
        </LogoContainer>
        <Header>
          <h1>Set Organization Credentials</h1>
          <p>Add login credentials to an existing organization</p>
        </Header>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <InputLabel htmlFor="organizationId">Organization ID</InputLabel>
            <InputWrapper>
              <InputIcon>
                <FaIdCard />
              </InputIcon>
              <Input
                type="text"
                id="organizationId"
                name="organizationId"
                placeholder="e.g. 1 for HKU"
                value={formData.organizationId}
                onChange={handleInputChange}
                required
              />
            </InputWrapper>
          </FormGroup>
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
                placeholder="organization@example.com"
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
            <HelpText>At least 8 characters</HelpText>
          </FormGroup>
          <FormGroup>
            <InputLabel htmlFor="confirmPassword">Confirm Password</InputLabel>
            <InputWrapper>
              <InputIcon>
                <FaLock />
              </InputIcon>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </InputWrapper>
          </FormGroup>
          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? 'Setting Credentials...' : 'Set Credentials'}
          </SubmitButton>
        </Form>
      </Card>
    </Container>
  );
};
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f7fafc;
  padding: 20px;
`;
const Card = styled.div`
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
const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
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
const ErrorMessage = styled.div`
  background-color: #fed7d7;
  color: #c53030;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 0.9rem;
`;
const SuccessMessage = styled.div`
  background-color: #c6f6d5;
  color: #2f855a;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 0.9rem;
`;
const Form = styled.form`
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
const HelpText = styled.span`
  font-size: 0.8rem;
  color: #718096;
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
export default SetOrganizationCredentials;