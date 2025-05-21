// src/services/gemini-client.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if API key is defined
if (!process.env.VITE_GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

// Initialize the API with your API key
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

export default genAI;