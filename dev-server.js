import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { glob } from 'glob';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://172.20.10.4:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Function to load serverless functions dynamically
const loadServerlessFunction = async (filePath) => {
  try {
    const module = await import(filePath);
    return module.default;
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error.message);
    return null;
  }
};

// Function to convert file path to API route
const filePathToRoute = (filePath) => {
  // Remove /app/api prefix and .js extension
  let route = filePath.replace('/app/api', '').replace('.js', '');
  
  // Convert [param] to :param for Express
  route = route.replace(/\[([^\]]+)\]/g, ':$1');
  
  // Handle index.js files
  if (route.endsWith('/index')) {
    route = route.replace('/index', '');
  }
  
  return route || '/';
};

// Load all API functions
const loadApiRoutes = async () => {
  try {
    // Find all .js files in the api directory
    const apiFiles = await glob('/app/api/**/*.js');
    
    for (const filePath of apiFiles) {
      // Skip _lib directory
      if (filePath.includes('/_lib/')) continue;
      
      const route = filePathToRoute(filePath);
      const handler = await loadServerlessFunction(filePath);
      
      if (handler) {
        console.log(`Loading route: ${route} from ${filePath}`);
        
        // Handle all HTTP methods
        app.all(`/api${route}`, async (req, res) => {
          try {
            await handler(req, res);
          } catch (error) {
            console.error(`Error in route ${route}:`, error);
            res.status(500).json({
              success: false,
              message: 'Internal Server Error',
              error: error.message
            });
          }
        });
      }
    }
  } catch (error) {
    console.error('Error loading API routes:', error);
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
const startServer = async () => {
  await loadApiRoutes();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Development server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  });
};

startServer();