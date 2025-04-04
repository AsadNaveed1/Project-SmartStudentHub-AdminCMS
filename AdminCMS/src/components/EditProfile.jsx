import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaMapMarkerAlt, FaImage, FaPlus } from 'react-icons/fa';
import { organizationService } from '../services/api';
const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    type: '',
    subtype: '',
    image: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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
  useEffect(() => {
    const storedOrgData = localStorage.getItem('organizationData');
    if (storedOrgData) {
      const orgData = JSON.parse(storedOrgData);
      setFormData({
        name: orgData.name || '',
        description: orgData.description || '',
        location: orgData.location || '',
        type: orgData.type || '',
        subtype: orgData.subtype || '',
        image: orgData.image || 'https://via.placeholder.com/150'
      });
      setOriginalData(orgData);
    } else {
      setError('Organization data not found. Please log in again.');
    }
  }, []);
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
    setSuccessMessage('');
    setIsLoading(true);
    try {
      const response = await organizationService.updateOrganization(
        originalData.organizationId,
        formData
      );
      localStorage.setItem('organizationData', JSON.stringify({
        ...originalData,
        ...response
      }));
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <PageContainer>
      <PageHeader>
        <h1>Edit Organization Profile</h1>
        <p>Update your organization information</p>
      </PageHeader>
      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}
      {successMessage && (
        <SuccessMessage>
          {successMessage}
        </SuccessMessage>
      )}
      <FormCard>
        <ProfileForm onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>Organization Information</SectionTitle>
            <LogoSection>
              {formData.image && formData.image !== 'https://via.placeholder.com/150' ? (
                <ImagePreview src={formData.image} alt="Organization Logo" />
              ) : (
                <ImagePlaceholder width="90px" height="90px" radius="6px">
                  <FaPlus />
                </ImagePlaceholder>
              )}
              <div>
                <FileUploadButton>
                  <FaImage /> Update Logo
                  <FileInput 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                </FileUploadButton>
                <HelpText>Recommended: Square image, 300x300px</HelpText>
              </div>
            </LogoSection>
            <FormGroup>
              <InputLabel htmlFor="name">Organization Name*</InputLabel>
              <InputWithIcon>
                <IconWrapper>
                  <FaBuilding />
                </IconWrapper>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{ paddingLeft: '40px' }}
                />
              </InputWithIcon>
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
                  {organizationTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup>
                <InputLabel htmlFor="subtype">Subtype</InputLabel>
                <Input
                  type="text"
                  id="subtype"
                  name="subtype"
                  value={formData.subtype}
                  onChange={handleInputChange}
                  placeholder="e.g. Technology, Education"
                />
              </FormGroup>
            </FormRow>
            <FormGroup>
              <InputLabel htmlFor="description">Description*</InputLabel>
              <TextArea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <InputLabel htmlFor="location">Location*</InputLabel>
              <InputWithIcon>
                <IconWrapper>
                  <FaMapMarkerAlt />
                </IconWrapper>
                <Input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  style={{ paddingLeft: '40px' }}
                />
              </InputWithIcon>
            </FormGroup>
          </FormSection>
          <ButtonGroup>
            <CancelButton type="button" onClick={() => navigate('/')}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={isLoading}>
              {isLoading ? 'Saving Changes...' : 'Save Changes'}
            </SubmitButton>
          </ButtonGroup>
        </ProfileForm>
      </FormCard>
    </PageContainer>
  );
};
export default EditProfile;
const PageContainer = styled.div`
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
`;
const PageHeader = styled.div`
  margin-bottom: 24px;
  h1 {
    font-size: 1.8rem;
    color: #2d3748;
    margin: 0 0 8px 0;
  }
  p {
    font-size: 1rem;
    color: #718096;
    margin: 0;
  }
`;
const ErrorMessage = styled.div`
  background-color: #fed7d7;
  color: #c53030;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 0.9rem;
`;
const SuccessMessage = styled.div`
  background-color: #c6f6d5;
  color: #2f855a;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 0.9rem;
`;
const FormCard = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;
const ProfileForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 30px;
`;
const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: #2d3748;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
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
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;
const InputLabel = styled.label`
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
`;
const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;
const InputWithIcon = styled.div`
  position: relative;
`;
const IconWrapper = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 1rem;
  z-index: 1;
`;
const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
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
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;
const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px dashed #cbd5e0;
  border-radius: 6px;
  background-color: #f7fafc;
  margin-bottom: 15px;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;
const ImagePreview = styled.img`
  width: 90px;
  height: 90px;
  border-radius: 6px;
  object-fit: cover;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;
const ImagePlaceholder = styled.div`
  width: ${props => props.width || "80px"};
  height: ${props => props.height || "80px"};
  border-radius: ${props => props.radius || "4px"};
  background-color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #a0aec0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;
const HelpText = styled.span`
  display: block;
  font-size: 0.75rem;
  color: #718096;
  margin-top: 5px;
`;
const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`;
const Button = styled.button`
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`;
const SubmitButton = styled(Button)`
  background-color: #4299e1;
  color: white;
  border: none;
  &:hover {
    background-color: #3182ce;
  }
  &:disabled {
    background-color: #90cdf4;
    cursor: not-allowed;
  }
`;
const CancelButton = styled(Button)`
  background-color: white;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  &:hover {
    background-color: #f7fafc;
  }
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