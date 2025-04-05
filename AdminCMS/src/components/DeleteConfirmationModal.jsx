import React from 'react';
import styled from 'styled-components';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, eventTitle }) => {
  if (!isOpen) return null;
  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>Confirm Deletion</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <WarningContainer>
            <WarningIcon>
              <FaExclamationTriangle />
            </WarningIcon>
            <WarningText>
              <WarningTitle>Are you sure you want to delete this event?</WarningTitle>
              <WarningDescription>
                You are about to delete the event: <strong>{eventTitle}</strong>.
                <br />
                This action cannot be undone, and all associated data will be permanently removed.
              </WarningDescription>
            </WarningText>
          </WarningContainer>
        </ModalBody>
        <ModalFooter>
          <CancelButton onClick={onClose}>
            Cancel
          </CancelButton>
          <DeleteButton onClick={onConfirm}>
            Delete Event
          </DeleteButton>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};
export default DeleteConfirmationModal;
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
  max-width: 500px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: shakeWarning 0.5s;
  @keyframes shakeWarning {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
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
  font-size: 1.25rem;
  color: #e53e3e;
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
`;
const WarningContainer = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
`;
const WarningIcon = styled.div`
  color: #e53e3e;
  font-size: 1.5rem;
  padding-top: 3px;
`;
const WarningText = styled.div`
  flex: 1;
`;
const WarningTitle = styled.h3`
  margin: 0 0 8px 0;
  color: #2d3748;
  font-size: 1.1rem;
`;
const WarningDescription = styled.p`
  margin: 0;
  color: #4a5568;
  line-height: 1.5;
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
const DeleteButton = styled.button`
  padding: 10px 16px;
  background-color: #e53e3e;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background-color: #c53030;
  }
`;