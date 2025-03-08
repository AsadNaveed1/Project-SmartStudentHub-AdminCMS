import 'react-native-get-random-values';
import '@ethersproject/shims';
import { ethers } from 'ethers';
import { Platform } from 'react-native';
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const IS_DEVELOPMENT = true;
const EventRegistrationABI = [
  "function createEvent(string memory _eventId, string memory _title, string memory _description, string memory _date, string memory _location) external",
  "function registerForEvent(uint256 _eventId) external",
  "function eventCount() external view returns (uint256)",
  "function getAllEvents() external view returns (tuple(uint256 id, string eventId, string title, string description, string date, string location, address organizer, uint256 registrationCount)[])",
  "function getRegistrations(uint256 _eventId) external view returns (tuple(uint256 eventId, address user, uint256 timestamp)[])",
  "function events(uint256) external view returns (uint256 id, string eventId, string title, string description, string date, string location, address organizer, uint256 registrationCount)"
];
class BlockchainService {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.signer = null;
    this.initialized = false;
    this.userAddress = null;
    this.networkInfo = null;
    this.initialize();
  }
  async initialize() {
    try {
      console.log("Initializing BlockchainService...");
      let providerUrl;
      if (IS_DEVELOPMENT) {
        if (Platform.OS === 'android') {
          providerUrl = 'http://10.0.2.2:8545';
        } else {
          providerUrl = 'http://127.0.0.1:8545';
        }
        console.log("Using local development network at", providerUrl);
      } else {
        providerUrl = 'https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague';
        console.log("Using SKALE network at", providerUrl);
      }
      this.provider = new ethers.providers.JsonRpcProvider(providerUrl);
      const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
      this.signer = new ethers.Wallet(privateKey, this.provider);
      this.userAddress = await this.signer.getAddress();
      this.networkInfo = await this.provider.getNetwork();
      console.log("Connected to network:", this.networkInfo.name, "Chain ID:", this.networkInfo.chainId);
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        EventRegistrationABI,
        this.signer
      );
      const code = await this.provider.getCode(CONTRACT_ADDRESS);
      if (code === '0x') {
        console.error("No contract found at the specified address!");
        throw new Error("Contract not deployed at this address");
      } else {
        console.log("Contract verified at address:", CONTRACT_ADDRESS);
        console.log("Contract bytecode length:", (code.length - 2) / 2, "bytes");
      }
      this.initialized = true;
      console.log("BlockchainService initialized successfully with address:", this.userAddress);
      try {
        const count = await this.getEventCount();
        console.log("Current event count:", count);
      } catch (error) {
        console.error("Could not get event count, contract may be invalid:", error);
      }
      return true;
    } catch (error) {
      console.error("BlockchainService initialization failed:", error);
      this.initialized = false;
      return false;
    }
  }
  getNetworkInfo() {
    if (!this.networkInfo) {
      return { name: "Unknown", chainId: 0 };
    }
    return this.networkInfo;
  }
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
    if (!this.initialized) {
      throw new Error("Blockchain service not initialized");
    }
  }
  async getEventCount() {
    try {
      await this.ensureInitialized();
      const count = await this.contract.eventCount();
      return count.toNumber();
    } catch (error) {
      console.error("Error getting event count:", error);
      return 0;
    }
  }
  async createEvent(eventId, title, description, date, location) {
    try {
      await this.ensureInitialized();
      console.log(`Creating event: ${title}, ID: ${eventId}, Date: ${date}, Location: ${location}`);
      const tx = await this.contract.createEvent(
        eventId, 
        title,
        description, 
        date, 
        location,
        { gasLimit: 500000 }
      );
      console.log(`Create event transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`Event created, receipt:`, receipt);
      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error) {
      console.error("Error creating event:", error);
      let errorMessage = "Failed to create event";
      if (error.error && error.error.reason) {
        errorMessage = error.error.reason;
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  async registerForEvent(eventId) {
    try {
      await this.ensureInitialized();
      console.log(`Attempting to register for event ID: ${eventId}`);
      const count = await this.contract.eventCount();
      const eventCount = count.toNumber();
      console.log(`Total events available: ${eventCount}`);
      if (eventId >= eventCount) {
        const error = `Event ID ${eventId} does not exist. Only ${eventCount} events are available.`;
        console.error(error);
        return {
          success: false,
          error: error
        };
      }
      try {
        const registrations = await this.contract.getRegistrations(eventId);
        const isAlreadyRegistered = registrations.some(reg => 
          reg.user.toLowerCase() === this.userAddress.toLowerCase()
        );
        if (isAlreadyRegistered) {
          return {
            success: false,
            error: "You are already registered for this event."
          };
        }
      } catch (error) {
        console.warn("Failed to check existing registrations:", error);
      }
      const tx = await this.contract.registerForEvent(eventId, {
        gasLimit: 200000
      });
      console.log(`Registration transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error) {
      console.error("Error registering for event:", error);
      let errorMessage = "Registration failed";
      if (error.error && error.error.reason) {
        errorMessage = error.error.reason;
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      if (errorMessage.includes("Event does not exist")) {
        errorMessage = `This event is no longer available.`;
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  async getAllEvents() {
    try {
      await this.ensureInitialized();
      const events = await this.contract.getAllEvents();
      return events.map(event => ({
        id: event.id.toNumber(),
        eventId: event.eventId,
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        organizer: event.organizer,
        registrationCount: event.registrationCount.toNumber(),
        isOrganizer: event.organizer.toLowerCase() === this.userAddress.toLowerCase()
      }));
    } catch (error) {
      console.error("Error fetching events from blockchain:", error);
      return [];
    }
  }
  async getEventDetails(id) {
    try {
      await this.ensureInitialized();
      const count = await this.getEventCount();
      if (id >= count) {
        console.warn(`Event ID ${id} does not exist`);
        return null;
      }
      const [eventId, title, description, date, location, organizer, registrationCount] = 
        await this.contract.events(id);
      return {
        id: id,
        eventId: eventId,
        title: title,
        description: description,
        date: date,
        location: location,
        organizer: organizer,
        registrationCount: registrationCount.toNumber(),
        isOrganizer: organizer.toLowerCase() === this.userAddress.toLowerCase()
      };
    } catch (error) {
      console.error(`Error fetching details for event ${id}:`, error);
      return null;
    }
  }
  async getEventRegistrations(eventId) {
    try {
      await this.ensureInitialized();
      const registrations = await this.contract.getRegistrations(eventId);
      return registrations.map(reg => ({
        eventId: reg.eventId.toNumber(),
        user: reg.user,
        timestamp: new Date(reg.timestamp.toNumber() * 1000),
        isCurrentUser: reg.user.toLowerCase() === this.userAddress.toLowerCase()
      }));
    } catch (error) {
      console.error(`Error fetching registrations for event ${eventId}:`, error);
      return [];
    }
  }
  async getUserRegistrations() {
    try {
      await this.ensureInitialized();
      console.log("Getting registrations for address:", this.userAddress);
      const events = await this.getAllEvents();
      const userRegistrations = [];
      for (const event of events) {
        try {
          const registrations = await this.getEventRegistrations(event.id);
          const isRegistered = registrations.some(reg => 
            reg.user.toLowerCase() === this.userAddress.toLowerCase()
          );
          if (isRegistered) {
            userRegistrations.push({
              ...event,
              isRegistered: true
            });
          }
        } catch (err) {
          console.warn(`Error checking registration for event ${event.id}:`, err);
        }
      }
      return userRegistrations;
    } catch (error) {
      console.error("Error fetching user registrations:", error);
      return [];
    }
  }
  async isRegisteredForEvent(eventId) {
    try {
      await this.ensureInitialized();
      const registrations = await this.contract.getRegistrations(eventId);
      return registrations.some(reg => 
        reg.user.toLowerCase() === this.userAddress.toLowerCase()
      );
    } catch (error) {
      console.error(`Error checking registration status for event ${eventId}:`, error);
      return false;
    }
  }
  getUserAddress() {
    return this.userAddress;
  }
  async checkContractMethods() {
    try {
      console.log("Available contract methods:", 
        Object.keys(this.contract.functions).join(", "));
      return Object.keys(this.contract.functions);
    } catch (error) {
      console.error("Error checking contract methods:", error);
      return [];
    }
  }
  async createTestEvent() {
    try {
      return await this.createEvent(
        "TEST123", 
        "Test Event",
        "This is a test event description", 
        "2025-03-15", 
        "Virtual"
      );
    } catch (error) {
      console.error("Error creating test event:", error);
      return {
        success: false,
        error: "Failed to create test event"
      };
    }
  }
}
const blockchainService = new BlockchainService();
export default blockchainService;