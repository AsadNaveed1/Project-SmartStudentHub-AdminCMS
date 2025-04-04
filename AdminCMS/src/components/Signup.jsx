import React, { useState } from 'react';
import { styled } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaBuilding, FaCalendarCheck, FaMapMarkerAlt, FaImage } from 'react-icons/fa';
import { authService } from '../services/api';
const Signup = () => {
  const [formData, setFormData] = useState({
    organizationName: '',
    email: '',
    password: '',
    confirmPassword: '',
    description: '',
    location: '',
    type: '',
    subtype: '',
    image: 'https://via.placeholder.com/150'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const organizationTypes = [
    'University',
    'Non-Governmental Organization',
    'Community Organization',
    'Cultural Institution',
    'Student Society',
    'Artist Group',
    'Community Group',
    'Academic Society',
    'Private Company',
    'Entertainment Company',
    'Educational Institution'
  ];
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
      const organizationData = {
        name: formData.organizationName,
        email: formData.email,
        password: formData.password,
        description: formData.description,
        location: formData.location,
        type: formData.type,
        subtype: formData.subtype || null,
        image: formData.image
      };
      const response = await authService.signupOrganization(organizationData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userType', 'organization');
      localStorage.setItem('organizationData', JSON.stringify(response.organization));
      window.dispatchEvent(new Event('storage'));
      alert('Organization account created successfully!');
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <SignupContainer>
      <SignupCard>
        <LogoContainer>
          <LogoIcon>
            <FaCalendarCheck />
          </LogoIcon>
          <LogoText>Event CMS</LogoText>
        </LogoContainer>
        <SignupHeader>
          <h1>Create an Organization Account</h1>
          <p>Register your organization to manage events</p>
        </SignupHeader>
        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}
        <SignupForm onSubmit={handleSubmit}>
          <FormGroup>
            <InputLabel htmlFor="organizationName">Organization Name*</InputLabel>
            <InputWrapper>
              <InputIcon>
                <FaBuilding />
              </InputIcon>
              <Input
                type="text"
                id="organizationName"
                name="organizationName"
                placeholder="Your Organization"
                value={formData.organizationName}
                onChange={handleInputChange}
                required
              />
            </InputWrapper>
          </FormGroup>
          {}
          <FormGroup>
            <InputLabel>Organization Logo</InputLabel>
            <LogoUploadContainer>
              <LogoPreview src={formData.image} alt="Logo Preview" />
              <FileUploadButton>
                <FaImage /> Upload Logo
                <FileInput 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </FileUploadButton>
            </LogoUploadContainer>
          </FormGroup>
          <FormRow>
            <FormGroup>
              <InputLabel htmlFor="type">Organization Type*</InputLabel>
              <Select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Type</option>
                {organizationTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <InputLabel htmlFor="subtype">Organization Subtype</InputLabel>
              <Input
                type="text"
                id="subtype"
                name="subtype"
                placeholder="e.g. Technology, Education"
                value={formData.subtype}
                onChange={handleInputChange}
              />
            </FormGroup>
          </FormRow>
          <FormGroup>
            <InputLabel htmlFor="description">Description*</InputLabel>
            <TextArea
              id="description"
              name="description"
              placeholder="Brief description of your organization"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              required
            />
          </FormGroup>
          <FormGroup>
            <InputLabel htmlFor="location">Location*</InputLabel>
            <InputWrapper>
              <InputIcon>
                <FaMapMarkerAlt />
              </InputIcon>
              <Input
                type="text"
                id="location"
                name="location"
                placeholder="Your organization's location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </InputWrapper>
          </FormGroup>
          <Divider>Account Information</Divider>
          <FormGroup>
            <InputLabel htmlFor="email">Email Address*</InputLabel>
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
          <FormRow>
            <FormGroup>
              <InputLabel htmlFor="password">Password*</InputLabel>
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
              <InputLabel htmlFor="confirmPassword">Confirm Password*</InputLabel>
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
          </FormRow>
          <TermsAgreement>
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">
              I agree to the <Link to="#">Terms of Service</Link> and <Link to="#">Privacy Policy</Link>
            </label>
          </TermsAgreement>
          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Organization Account'}
          </SubmitButton>
        </SignupForm>
        <LoginPrompt>
          Already have an account? <LoginLink to="/login">Sign in</LoginLink>
        </LoginPrompt>
      </SignupCard>
    </SignupContainer>
  );
};
export default Signup;
const SignupContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f7fafc;
  padding: 20px;
`;
const SignupCard = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 650px;
  margin: 20px 0;
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
const SignupHeader = styled.div`
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
const SignupForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;
const FormRow = styled.div`
  display: flex;
  gap: 20px;
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 20px;
  }
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
const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  background-color: white;
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;
const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
  &::placeholder {
    color: #cbd5e0;
  }
`;
const Divider = styled.div`
  width: 100%;
  text-align: center;
  border-bottom: 1px solid #e2e8f0;
  line-height: 0.1em;
  margin: 10px 0 20px;
  color: #718096;
  font-size: 0.9rem;
`;
const HelpText = styled.span`
  font-size: 0.8rem;
  color: #718096;
`;
const TermsAgreement = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.85rem;
  color: #4a5568;
  input {
    margin-top: 3px;
  }
  a {
    color: #4299e1;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
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
const LoginPrompt = styled.div`
  text-align: center;
  margin-top: 30px;
  font-size: 0.9rem;
  color: #4a5568;
`;
const LoginLink = styled(Link)`
  color: #4299e1;
  text-decoration: none;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;
const LogoUploadContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  border: 1px dashed #cbd5e0;
  border-radius: 6px;
  background-color: #f7fafc;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
  }
`;
const LogoPreview = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;
const FileUploadButton = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background-color: #4299e1;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background-color 0.2s;
  &:hover {
    background-color: #3182ce;
  }
`;
const FileInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;