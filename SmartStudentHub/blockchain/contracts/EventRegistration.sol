// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EventRegistration {
    uint256 public eventCount = 0;

    struct Event {
        uint256 id;
        string eventId;
        string title;
        string description;
        string date;
        string location;
        address organizer;
        uint256 registrationCount;
    }

    struct Registration {
        uint256 eventId;
        address user;
        uint256 timestamp;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => Registration[]) public registrations;

    event EventCreated(
        uint256 id,
        string eventId,
        string title,
        string description,
        string date,
        string location,
        address organizer
    );

    event UserRegistered(
        uint256 eventId,
        address user,
        uint256 timestamp
    );

    // Create a new event
    function createEvent(
        string memory _eventId,
        string memory _title,
        string memory _description,
        string memory _date,
        string memory _location
    ) public {
        eventCount++;
        events[eventCount] = Event(
            eventCount,
            _eventId,
            _title,
            _description,
            _date,
            _location,
            msg.sender,
            0
        );
        emit EventCreated(eventCount, _eventId, _title, _description, _date, _location, msg.sender);
    }

    // Register for an event
    function registerForEvent(uint256 _eventId) public {
        require(_eventId > 0 && _eventId <= eventCount, "Event does not exist.");
        registrations[_eventId].push(Registration(_eventId, msg.sender, block.timestamp));
        events[_eventId].registrationCount++;
        emit UserRegistered(_eventId, msg.sender, block.timestamp);
    }

    // Get registrations for an event
    function getRegistrations(uint256 _eventId) public view returns (Registration[] memory) {
        return registrations[_eventId];
    }

    // Get all events
    function getAllEvents() public view returns (Event[] memory) {
        Event[] memory allEvents = new Event[](eventCount);
        for (uint256 i = 1; i <= eventCount; i++) {
            allEvents[i - 1] = events[i];
        }
        return allEvents;
    }
}