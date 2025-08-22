// Simple test endpoint without database connection
export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: 'Serverless API is working!',
    method: req.method,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
}