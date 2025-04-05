import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaImage, FaSpinner } from 'react-icons/fa';
import { eventService } from '../services/api';
import moment from 'moment';
const EditEventModal = ({ isOpen, onClose, event, onEventUpdated }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    subtype: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    time: '',
    description: '',
    summary: '',
    capacity: '',
    image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dateForPicker, setDateForPicker] = useState('');
  useEffect(() => {
    if (event) {
      let startTime = '';
      let endTime = '';
      if (event.time && event.time.includes('-')) {
        const [start, end] = event.time.split('-').map(t => t.trim());
        startTime = start;
        endTime = end;
      }
      let datePickerValue = '';
      if (event.date) {
        const dateParts = event.date.split('-');
        if (dateParts.length === 3) {
          datePickerValue = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        }
      }
      setDateForPicker(datePickerValue);
      setFormData({
        title: event.title || '',
        type: event.type || '',
        subtype: event.subtype || '',
        location: event.location || '',
        date: event.date || '',
        time: event.time || '',
        startTime,
        endTime,
        description: event.description || '',
        summary: event.summary || '',
        capacity: event.capacity || '',
        image: event.image || 'https://via.placeholder.com/500'
      });
    }
  }, [event]);
  if (!isOpen || !event) return null;
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleDateChange = (e) => {
    const htmlDate = e.target.value;
    if (htmlDate) {
      const dateMoment = moment(htmlDate);
      const formattedDate = dateMoment.format('DD-MM-YYYY');
      setDateForPicker(htmlDate);
      setFormData(prev => ({ ...prev, date: formattedDate }));
    } else {
      setDateForPicker('');
      setFormData(prev => ({ ...prev, date: '' }));
    }
  };
  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    if (name === 'startTime') {
      const updatedTime = value && formData.endTime ? `${value} - ${formData.endTime}` : value || formData.endTime;
      setFormData(prev => ({ 
        ...prev, 
        startTime: value,
        time: updatedTime
      }));
    } else if (name === 'endTime') {
      const updatedTime = formData.startTime && value ? `${formData.startTime} - ${value}` : formData.startTime || value;
      setFormData(prev => ({ 
        ...prev, 
        endTime: value,
        time: updatedTime
      }));
    }
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
    setIsSubmitting(true);
    setError('');
    try {
      if (!formData.title || !formData.type || !formData.location || !formData.date) {
        throw new Error('Please fill in all required fields.');
      }
      const updatedEvent = await eventService.updateEvent(event.id, formData);
      const formattedEvent = {
        ...event,
        ...formData,
        status: formData.date && moment(formData.date, 'DD-MM-YYYY').isSameOrAfter(moment(), 'day') 
          ? 'upcoming' 
          : 'past',
      };
      onEventUpdated(formattedEvent);
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err.message || 'Failed to update event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>Edit Event</ModalTitle>
          <CloseButton onClick={onClose} type="button">
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            {error && <ErrorAlert>{error}</ErrorAlert>}
            <FormGroup>
              <FormLabel htmlFor="title">Event Title *</FormLabel>
              <FormInput 
                type="text" 
                id="title" 
                name="title" 
                value={formData.title} 
                onChange={handleChange}
                required
              />
            </FormGroup>
            <FormRow>
              <FormGroup>
                <FormLabel htmlFor="type">Event Type *</FormLabel>
                <FormSelect 
                  id="type" 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="University Event">University Event</option>
                  <option value="External Event">External Event</option>
                  <option value="Conference">Conference</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Networking">Networking</option>
                  <option value="Career Fair">Career Fair</option>
                  <option value="Other">Other</option>
                </FormSelect>
                <FormHelp>Current type: {formData.type || 'None selected'}</FormHelp>
              </FormGroup>
              <FormGroup>
                <FormLabel htmlFor="subtype">Subtype</FormLabel>
                <FormInput 
                  type="text" 
                  id="subtype" 
                  name="subtype" 
                  value={formData.subtype} 
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </FormGroup>
            </FormRow>
            <FormGroup>
              <FormLabel htmlFor="location">Location *</FormLabel>
              <FormInput 
                type="text" 
                id="location" 
                name="location" 
                value={formData.location} 
                onChange={handleChange}
                required
              />
            </FormGroup>
            <FormRow>
              <FormGroup>
                <FormLabel htmlFor="date">Date *</FormLabel>
                <FormInput 
                  type="date" 
                  id="date" 
                  name="date" 
                  value={dateForPicker}
                  onChange={handleDateChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Time Range</FormLabel>
                <TimeRangeContainer>
                  <TimeInput
                    type="time"
                    name="startTime"
                    placeholder="Start time"
                    value={formData.startTime && formData.startTime.match(/\d{1,2}:\d{2}/) 
                      ? formData.startTime.match(/\d{1,2}:\d{2}/)[0] 
                      : ''}
                    onChange={(e) => {
                      const timeValue = e.target.value;
                      if (timeValue) {
                        const [hours, minutes] = timeValue.split(':');
                        const hour = parseInt(hours);
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const hour12 = hour % 12 || 12;
                        const formattedTime = `${hour12}:${minutes} ${ampm}`;
                        handleTimeChange({
                          target: { name: 'startTime', value: formattedTime }
                        });
                      } else {
                        handleTimeChange({
                          target: { name: 'startTime', value: '' }
                        });
                      }
                    }}
                  />
                  <TimeRangeSeparator>to</TimeRangeSeparator>
                  <TimeInput
                    type="time"
                    name="endTime"
                    placeholder="End time"
                    value={formData.endTime && formData.endTime.match(/\d{1,2}:\d{2}/) 
                      ? formData.endTime.match(/\d{1,2}:\d{2}/)[0] 
                      : ''}
                    onChange={(e) => {
                      const timeValue = e.target.value;
                      if (timeValue) {
                        const [hours, minutes] = timeValue.split(':');
                        const hour = parseInt(hours);
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const hour12 = hour % 12 || 12;
                        const formattedTime = `${hour12}:${minutes} ${ampm}`;
                        handleTimeChange({
                          target: { name: 'endTime', value: formattedTime }
                        });
                      } else {
                        handleTimeChange({
                          target: { name: 'endTime', value: '' }
                        });
                      }
                    }}
                  />
                </TimeRangeContainer>
              </FormGroup>
            </FormRow>
            <FormGroup>
              <FormLabel htmlFor="capacity">Capacity</FormLabel>
              <FormInput 
                type="text" 
                id="capacity" 
                name="capacity" 
                value={formData.capacity} 
                onChange={handleChange}
                placeholder="Number of participants or 'Unlimited'"
              />
            </FormGroup>
            <FormGroup>
              <FormLabel htmlFor="summary">Summary</FormLabel>
              <FormTextarea 
                id="summary" 
                name="summary" 
                value={formData.summary} 
                onChange={handleChange}
                rows="2"
                placeholder="Brief summary of the event"
              />
            </FormGroup>
            <FormGroup>
              <FormLabel htmlFor="description">Description</FormLabel>
              <FormTextarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleChange}
                rows="4"
                placeholder="Detailed description of the event"
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>Event Image</FormLabel>
              <ImagePreviewContainer>
                <ImagePreview src={formData.image} alt="Event preview" />
                <ImageUploadOverlay>
                  <FileInputLabel htmlFor="image-upload">
                    <FaImage /> Change Image
                  </FileInputLabel>
                  <FileInput 
                    type="file" 
                    id="image-upload" 
                    accept="image/*" 
                    onChange={handleFileChange}
                  />
                </ImageUploadOverlay>
              </ImagePreviewContainer>
              <FormHelp>Image will be converted to a Base64 encoded string</FormHelp>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <FaSpinner className="spinner" /> Updating...
                </>
              ) : 'Update Event'}
            </SubmitButton>
          </ModalFooter>
        </form>
      </ModalContainer>
    </ModalOverlay>
  );
};
export default EditEventModal;
const TimeRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
const TimeRangeSeparator = styled.span`
  color: #718096;
  font-size: 0.9rem;
`;
const TimeInput = styled.input`
  flex: 1;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;
const ModalContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: fadeIn 0.3s;
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
`;
const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #2d3748;
`;
const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #718096;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  &:hover {
    background-color: #f7fafc;
    color: #e53e3e;
  }
`;
const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  max-height: calc(90vh - 130px);
`;
const ErrorAlert = styled.div`
  background-color: #fed7d7;
  color: #c53030;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 0.9rem;
`;
const FormGroup = styled.div`
  margin-bottom: 20px;
`;
const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;
const FormLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #4a5568;
`;
const FormInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;
const FormSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;
const FormTextarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;
const FormHelp = styled.p`
  margin-top: 4px;
  font-size: 0.8rem;
  color: #718096;
`;
const ImagePreviewContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f7fafc;
`;
const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
const ImageUploadOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  ${ImagePreviewContainer}:hover & {
    opacity: 1;
  }
`;
const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: white;
  color: #4a5568;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  &:hover {
    background-color: #edf2f7;
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
const ModalFooter = styled.div`
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;
const CancelButton = styled.button`
  padding: 10px 16px;
  background-color: white;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background-color: #f7fafc;
  }
`;
const SubmitButton = styled.button`
  padding: 10px 16px;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background-color: #3182ce;
  }
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
  .spinner {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;