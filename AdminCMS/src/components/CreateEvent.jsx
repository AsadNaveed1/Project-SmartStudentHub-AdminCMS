import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTag, FaBuilding, FaUsers, FaMoneyBill, FaImage, FaPlus } from 'react-icons/fa';
import { eventService } from '../services/api';
const CreateEvent = () => {
  const navigate = useNavigate();
  const [organizationData, setOrganizationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    capacity: '',
    price: '0',
    image: 'https://via.placeholder.com/500'
  });
  useEffect(() => {
    const storedOrgData = localStorage.getItem('organizationData');
    if (storedOrgData) {
      const parsedOrgData = JSON.parse(storedOrgData);
      setOrganizationData(parsedOrgData);
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
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxWidth = 1000;
          const maxHeight = 562;
          let width = img.width;
          let height = img.height;
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = height * (maxWidth / width);
              width = maxWidth;
            } else {
              width = width * (maxHeight / height);
              height = maxHeight;
            }
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          const resizedImage = canvas.toDataURL('image/jpeg', 0.9);
          setFormData({
            ...formData,
            image: resizedImage
          });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const eventId = `event_${Date.now()}`;
      const time = `${formData.startTime} - ${formData.endTime}`;
      const dateParts = formData.date.split('-');
      const formattedDate = dateParts.length === 3 
        ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` 
        : formData.date;
      const eventType = "External Event";
      const eventData = {
        ...formData,
        date: formattedDate,
        time,
        eventId,
        organizationId: organizationData.organizationId,
        organizationName: organizationData.name,
        organization: {
          name: organizationData.name,
          id: organizationData.organizationId,
          organizationId: organizationData.organizationId,
          image: organizationData.image
        },
        type: eventType,
        subtype: formData.category
      };
      await eventService.createEvent(eventData);
      alert('Event created successfully!');
      navigate('/manage-events');
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err.response?.data?.message || 'Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const categories = [
    'Academic',
    'Career',
    'Conference',
    'Entertainment',
    'Exhibition',
    'Festival',
    'Networking',
    'Social',
    'Sports',
    'Technology',
    'Workshop'
  ];
  return (
    <PageContainer>
      <PageHeader>
        <h1>Create New Event</h1>
        <p>Fill in the details to create a new event for your organization</p>
      </PageHeader>
      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}
      <FormCard>
        <EventForm onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>Event Information</SectionTitle>
            <FormGroup>
              <InputLabel htmlFor="title">Event Title*</InputLabel>
              <Input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
            {}
            <FormGroup>
              <InputLabel>Event Image</InputLabel>
              <ImageUploadContainer>
                {formData.image && formData.image !== 'https://via.placeholder.com/500' ? (
                  <ImagePreview src={formData.image} alt="Event Image" />
                ) : (
                  <ImagePlaceholder width="180px" height="101px" radius="4px">
                    <FaPlus />
                  </ImagePlaceholder>
                )}
                <div>
                  <FileUploadButton>
                    <FaImage /> Upload Image
                    <FileInput 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                    />
                  </FileUploadButton>
                  <HelpText>Recommended: 16:9 ratio, min 800x450px</HelpText>
                </div>
              </ImageUploadContainer>
            </FormGroup>
            <FormRow>
              <FormGroup>
                <InputLabel htmlFor="category">Category*</InputLabel>
                <Select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup>
                <InputLabel htmlFor="organizationDisplay">Organization</InputLabel>
                <OrganizationDisplay>
                  <OrgIcon>
                    <FaBuilding />
                  </OrgIcon>
                  <OrgName>{organizationData?.name || ''}</OrgName>
                </OrganizationDisplay>
              </FormGroup>
            </FormRow>
            <FormGroup>
              <InputLabel htmlFor="description">Description*</InputLabel>
              <TextArea
                id="description"
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
          </FormSection>
          <FormSection>
            <SectionTitle>Date & Location</SectionTitle>
            <FormRow>
              <FormGroup>
                <InputLabel htmlFor="date">Date*</InputLabel>
                <DateTimeInput>
                  <DateTimeIcon>
                    <FaCalendarAlt />
                  </DateTimeIcon>
                  <Input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    style={{ paddingLeft: '40px' }}
                  />
                </DateTimeInput>
              </FormGroup>
            </FormRow>
            <FormRow>
              <FormGroup>
                <InputLabel htmlFor="startTime">Start Time*</InputLabel>
                <DateTimeInput>
                  <DateTimeIcon>
                    <FaClock />
                  </DateTimeIcon>
                  <Input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    style={{ paddingLeft: '40px' }}
                  />
                </DateTimeInput>
              </FormGroup>
              <FormGroup>
                <InputLabel htmlFor="endTime">End Time*</InputLabel>
                <DateTimeInput>
                  <DateTimeIcon>
                    <FaClock />
                  </DateTimeIcon>
                  <Input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                    style={{ paddingLeft: '40px' }}
                  />
                </DateTimeInput>
              </FormGroup>
            </FormRow>
            <FormGroup>
              <InputLabel htmlFor="location">Location*</InputLabel>
              <LocationInput>
                <LocationIcon>
                  <FaMapMarkerAlt />
                </LocationIcon>
                <Input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  style={{ paddingLeft: '40px' }}
                />
              </LocationInput>
            </FormGroup>
          </FormSection>
          <FormSection>
            <SectionTitle>Additional Details</SectionTitle>
            <FormRow>
              <FormGroup>
                <InputLabel htmlFor="capacity">Capacity*</InputLabel>
                <CapacityInput>
                  <CapacityIcon>
                    <FaUsers />
                  </CapacityIcon>
                  <Input
                    type="number"
                    id="capacity"
                    name="capacity"
                    min="1"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                    style={{ paddingLeft: '40px' }}
                  />
                </CapacityInput>
              </FormGroup>
              <FormGroup>
                <InputLabel htmlFor="price">Price (HKD)</InputLabel>
                <PriceInput>
                  <PriceIcon>
                    <FaMoneyBill />
                  </PriceIcon>
                  <Input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    style={{ paddingLeft: '40px' }}
                  />
                </PriceInput>
              </FormGroup>
            </FormRow>
          </FormSection>
          <ButtonGroup>
            <CancelButton type="button" onClick={() => navigate('/manage-events')}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={isLoading}>
              {isLoading ? 'Creating Event...' : 'Create Event'}
            </SubmitButton>
          </ButtonGroup>
        </EventForm>
      </FormCard>
    </PageContainer>
  );
};
export default CreateEvent;
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
const FormCard = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;
const EventForm = styled.form`
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
const OrganizationDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: #f7fafc;
`;
const OrgIcon = styled.div`
  color: #a0aec0;
  font-size: 1rem;
`;
const OrgName = styled.div`
  color: #4a5568;
  font-size: 1rem;
`;
const DateTimeInput = styled.div`
  position: relative;
`;
const DateTimeIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 1rem;
  z-index: 1;
`;
const LocationInput = styled.div`
  position: relative;
`;
const LocationIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 1rem;
  z-index: 1;
`;
const CapacityInput = styled.div`
  position: relative;
`;
const CapacityIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 1rem;
  z-index: 1;
`;
const PriceInput = styled.div`
  position: relative;
`;
const PriceIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 1rem;
  z-index: 1;
`;
const ImageUploadContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  border: 1px dashed #cbd5e0;
  border-radius: 6px;
  background-color: #f7fafc;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;
const ImagePreview = styled.img`
  width: 180px;
  height: 101px; 
  border-radius: 4px;
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