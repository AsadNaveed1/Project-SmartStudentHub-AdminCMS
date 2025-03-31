const axios = require('axios');
const Event = require('../models/Event');
const { HNSWLib } = require('@langchain/community/vectorstores/hnswlib');
const { OllamaEmbeddings } = require('@langchain/ollama');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { RunnableSequence, RunnablePassthrough } = require('@langchain/core/runnables');
const { PromptTemplate } = require('@langchain/core/prompts');
const { Document } = require('@langchain/core/documents');
const fs = require('fs').promises;
const path = require('path');
const { createWorker } = require('tesseract.js');
class ChatbotService {
  constructor() {
    this.ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.embeddings = new OllamaEmbeddings({
      model: 'nomic-embed-text',
      baseUrl: this.ollamaBaseUrl
    });
    this.llmModel = 'llama3:8b';
    this.imageModel = 'llava:7b';
    this.vectorStore = null;
    this.lastVectorStoreUpdate = null;
    this.vectorStorePath = path.join(__dirname, '../../vector_store');
    this.updateInterval = 3600000;
    this.isInitializing = false;
    this.isUpdatingVectorStore = false;
  }
  async initialize() {
    try {
      if (this.isInitializing) return;
      this.isInitializing = true;
      try {
        await this.loadVectorStore();
        console.log('ChatbotService initialized successfully');
      } catch (error) {
        console.log('No existing vector store found, will create when needed');
      } finally {
        this.isInitializing = false;
      }
    } catch (error) {
      this.isInitializing = false;
      console.error('ChatbotService initialization failed:', error);
      throw error;
    }
  }
  async ensureVectorStore() {
    if (!this.vectorStore) {
      try {
        await this.loadVectorStore();
      } catch (error) {
        await this.updateVectorStore();
      }
    }
    if (this.vectorStore) {
      const currentTime = new Date().getTime();
      if (!this.lastVectorStoreUpdate || 
          currentTime - this.lastVectorStoreUpdate > this.updateInterval) {
        await this.updateVectorStore();
      }
    }
  }
  async updateVectorStore() {
    if (this.isUpdatingVectorStore) {
      console.log('Vector store update already in progress, skipping...');
      return;
    }
    this.isUpdatingVectorStore = true;
    try {
      console.log('Updating vector store with latest events...');
      const events = await Event.find()
        .populate('organization', 'name')
        .limit(100)
        .lean();
      if (events.length === 0) {
        console.warn('No events found in the database');
        this.isUpdatingVectorStore = false;
        return;
      }
      console.log(`Processing ${events.length} events for vector store...`);
      const documents = events.map(event => {
        const content = `
          Event ID: ${event.eventId}
          Title: ${event.title || 'No title'}
          Organization: ${event.organization?.name || event.organization || 'No organization'}
          Type: ${event.type || 'No type'}
          Date: ${event.date || 'No date'} 
          Location: ${event.location || 'No location'}
          Summary: ${event.summary || 'No summary'}
        `;
        return new Document({
          pageContent: content,
          metadata: { 
            eventId: event.eventId,
            title: event.title,
            date: event.date,
            type: event.type,
            subtype: event.subtype
          }
        });
      });
      console.log('Creating vector embeddings with nomic-embed-text...');
      this.vectorStore = await HNSWLib.fromDocuments(
        documents,
        this.embeddings
      );
      const directory = path.dirname(this.vectorStorePath);
      await fs.mkdir(directory, { recursive: true });
      await this.vectorStore.save(this.vectorStorePath);
      this.lastVectorStoreUpdate = new Date().getTime();
      console.log(`Vector store updated with ${documents.length} events`);
    } catch (error) {
      console.error('Error updating vector store:', error);
      throw error;
    } finally {
      this.isUpdatingVectorStore = false;
    }
  }
  async loadVectorStore() {
    try {
      if (this.vectorStore) return;
      this.vectorStore = await HNSWLib.load(
        this.vectorStorePath,
        this.embeddings
      );
      this.lastVectorStoreUpdate = new Date().getTime();
      console.log('Loaded vector store from disk');
    } catch (error) {
      console.log('No existing vector store found, need to create a new one');
      throw error;
    }
  }
  async getChatResponse(message, imagePath = null) {
    try {
      if (imagePath) {
        return await this.processImageQuery(message, imagePath);
      }
      const isEventQuery = this.isEventRelatedQuery(message);
      if (isEventQuery) {
        if (!this.vectorStore) {
          try {
            await this.ensureVectorStore();
          } catch (error) {
            console.log("Couldn't initialize vector store for event query, falling back to general query");
            return await this.handleGeneralQueryWithEventContext(message);
          }
        }
        if (this.vectorStore) {
          return await this.handleEventQuery(message);
        } else {
          return await this.handleGeneralQueryWithEventContext(message);
        }
      } else {
        return await this.handleGeneralQuery(message);
      }
    } catch (error) {
      console.error('Error getting chat response:', error);
      return "I'm sorry, I encountered an error processing your request. Please try again later.";
    }
  }
  isEventRelatedQuery(query) {
    const eventKeywords = [
      'event', 'events', 'activity', 'activities', 'happening', 
      'schedule', 'upcoming', 'attend', 'register', 'join',
      'volunteer', 'volunteering', 'society', 'societies',
      'workshop', 'seminar', 'talk', 'discussion', 'meeting',
      'concert', 'exhibition', 'fair', 'festival',
      'networking', 'community'
    ];
    const eventQuestionPatterns = [
      'when is', 'where is', 'what time', 'who is organizing',
      'how do I get to', 'how can I join', 'how much is',
      'is there an event', 'are there any events'
    ];
    const queryLower = query.toLowerCase();
    if (eventKeywords.some(keyword => queryLower.includes(keyword))) {
      return true;
    }
    if (eventQuestionPatterns.some(pattern => queryLower.includes(pattern))) {
      return true;
    }
    if ((queryLower.includes('tomorrow') || 
         queryLower.includes('next week') ||
         queryLower.includes('weekend') ||
         queryLower.includes('this month')) && 
        (queryLower.includes('what') || queryLower.includes('happening'))) {
      return true;
    }
    return false;
  }
  async handleEventQuery(message) {
    try {
      if (!this.vectorStore) {
        console.log("Vector store not available for event query, using fallback");
        return await this.handleGeneralQueryWithEventContext(message);
      }
      const retriever = this.vectorStore.asRetriever({
        k: 3,
      });
      const docs = await retriever.invoke(message);
      const formattedDocs = docs.map(doc => {
        return `EVENT INFORMATION:\n${doc.pageContent}\n`;
      }).join('\n');
      const promptText = `You are a helpful assistant for a university campus event app. 
      Use the following event information to answer the user's question.
      If the information is not in the provided events, say you don't have that information.
      ${formattedDocs}
      User Question: ${message}
      Answer:`;
      const response = await this.ollamaGenerate(promptText);
      return response;
    } catch (error) {
      console.error('Error handling event query:', error);
      return await this.handleGeneralQueryWithEventContext(message);
    }
  }
  async handleGeneralQueryWithEventContext(query) {
    try {
      const response = await axios.post(`${this.ollamaBaseUrl}/api/generate`, {
        model: this.llmModel,
        prompt: `You are a helpful assistant for a university campus event app. The user is asking about events, but I don't have specific event information available right now. Please provide a general response to the query: "${query}"`,
        stream: false
      });
      return response.data.response;
    } catch (error) {
      console.error('Error handling fallback event query:', error);
      return "I'm sorry, I don't have detailed event information available right now. Please try again later or contact the event organizer directly for more information.";
    }
  }
  async handleGeneralQuery(query) {
    try {
      const prompt = `You are a helpful assistant for a university campus app. The following is a general knowledge question not related to campus events. Please provide a helpful and accurate response:
User: ${query}
Assistant:`;
      const response = await axios.post(`${this.ollamaBaseUrl}/api/generate`, {
        model: this.llmModel,
        prompt: prompt,
        stream: false
      });
      return response.data.response;
    } catch (error) {
      console.error('Error handling general query:', error);
      return "I'm sorry, I'm having trouble processing your request. Please try again later.";
    }
  }
  isTextExtractionQuery(query) {
    const textExtractionKeywords = [
      'read', 'extract', 'transcribe', 'text', 'ocr', 'recognize', 
      'scan', 'convert', 'what does it say', 'tell me what', 'document',
      'slide', 'presentation', 'content', 'written', 'says',
      'explain this slide', 'explain the slide', 'explain this document',
      'what is in this slide', 'what does this slide show', 'interpret'
    ];
    const queryLower = query.toLowerCase();
    return textExtractionKeywords.some(keyword => queryLower.includes(keyword));
  }
  async extractTextFromImage(imagePath) {
    try {
      const worker = await createWorker({
        logger: progress => {
          if (progress.status === 'recognizing text') {
            console.log(`OCR Progress: ${progress.progress * 100}%`);
          }
        }
      });
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      await worker.setParameters({
        tessedit_pageseg_mode: '6',
        preserve_interword_spaces: '1',
      });
      const { data } = await worker.recognize(imagePath);
      await worker.terminate();
      return data.text;
    } catch (error) {
      console.error('Tesseract OCR error:', error);
      throw new Error('Text extraction failed: ' + error.message);
    }
  }
  async processImageQuery(query, imagePath) {
    try {
      const isReadingRequest = this.isTextExtractionQuery(query);
      if (isReadingRequest) {
        console.log("Detected text extraction request, using OCR...");
        const extractedText = await this.extractTextFromImage(imagePath);
        if (!extractedText || extractedText.trim() === '') {
          return "I couldn't extract any text from this image. The image might not contain readable text or the quality might be too low.";
        }
        console.log("Successfully extracted text with OCR:", extractedText.substring(0, 100) + "...");
        const prompt = `You are a helpful assistant for a university campus app.
The following text was extracted from an image using OCR. 
Please analyze, explain, or answer questions about this text based on the user's query: "${query}"
Extracted text:
${extractedText}
Your response:`;
        return await this.ollamaGenerate(prompt);
      } else {
        console.log("Using LLaVa for general image understanding...");
        const imageBuffer = await fs.readFile(imagePath);
        const base64Image = imageBuffer.toString('base64');
        const response = await axios.post(`${this.ollamaBaseUrl}/api/generate`, {
          model: this.imageModel,
          prompt: query,
          images: [base64Image],
          stream: false
        });
        return response.data.response;
      }
    } catch (error) {
      console.error('Error processing image query:', error);
      return "I'm sorry, I couldn't process the image. Please try again with a different image or question.";
    }
  }
  async ollamaGenerate(prompt) {
    try {
      let promptText = prompt;
      if (typeof prompt === 'object') {
        if (prompt.kwargs && prompt.kwargs.value) {
          promptText = prompt.kwargs.value;
        } else if (prompt.value) {
          promptText = prompt.value;
        } else {
          promptText = JSON.stringify(prompt);
        }
      }
      const response = await axios.post(`${this.ollamaBaseUrl}/api/generate`, {
        model: this.llmModel,
        prompt: promptText,
        stream: false
      });
      return response.data.response;
    } catch (error) {
      console.error('Error generating from Ollama:', error);
      if (error.response && error.response.data) {
        console.error('Ollama error details:', error.response.data);
      }
      return "I'm sorry, I encountered an error generating a response. Please try again later.";
    }
  }
  async getAvailableModels() {
    try {
      const response = await axios.get(`${this.ollamaBaseUrl}/api/tags`);
      return response.data.models;
    } catch (error) {
      console.error('Error getting available models:', error);
      return [];
    }
  }
}
module.exports = new ChatbotService();