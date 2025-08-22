# Deployment Guide - Vercel Serverless Functions

This guide explains how to deploy your Subscription Tracker application to Vercel using serverless functions.

## 🏗️ New Architecture

The application has been converted from Express.js to Vercel serverless functions:

### Backend Structure
```
/api/
├── _lib/
│   ├── database.js          # Optimized MongoDB connection
│   └── middleware.js        # Shared middleware functions
├── auth/
│   ├── sign-up.js          # POST /api/auth/sign-up
│   ├── sign-in.js          # POST /api/auth/sign-in
│   └── sign-out/[id].js    # POST /api/auth/sign-out/[id]
├── users/
│   ├── index.js            # GET /api/users
│   └── [id].js             # GET/PUT/DELETE /api/users/[id]
├── subscriptions/
│   ├── index.js            # GET/POST/DELETE /api/subscriptions
│   ├── [id].js             # GET/PUT/DELETE /api/subscriptions/[id]
│   ├── user/[id].js        # GET /api/subscriptions/user/[id]
│   ├── cancel/[id].js      # PUT /api/subscriptions/cancel/[id]
│   └── upcoming-user-renewals/[id].js  # GET renewals
├── workflows/
│   └── subscription/
│       └── reminder.js     # POST /api/workflows/subscription/reminder
└── index.js                # GET /api (API documentation)
```

## 🚀 Deployment Steps

### 1. Prerequisites
- Vercel account
- MongoDB Atlas database
- GitHub repository (optional but recommended)

### 2. Environment Variables

Create a `.env` file or set these in Vercel dashboard:

```bash
# Required
DB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
JWT_SECRET=your_super_secret_jwt_key
JWT_Expires_IN=7d
SERVER_URL=https://your-app.vercel.app
NODE_ENV=production

# Optional (for enhanced features)
QSTASH_URL=https://qstash.upstash.io
QSTASH_TOKEN=your_qstash_token
ARCJET_KEY=your_arcjet_key
EMAIL_PASSWORD=your_email_password
```

### 3. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option B: GitHub Integration
1. Push code to GitHub
2. Import repository in Vercel dashboard
3. Set environment variables in Vercel project settings
4. Deploy

### 4. Configure Environment Variables in Vercel

In your Vercel project dashboard:
1. Go to Settings → Environment Variables
2. Add each variable from the list above
3. Make sure to set them for "Production" environment

## 📝 API Endpoints

### Authentication
- `POST /api/auth/sign-up` - Register new user
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-out/[id]` - User logout

### Users
- `GET /api/users` - Get all users
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions/[id]` - Get subscription by ID
- `PUT /api/subscriptions/[id]` - Update subscription
- `DELETE /api/subscriptions/[id]` - Delete subscription
- `DELETE /api/subscriptions` - Delete all subscriptions
- `GET /api/subscriptions/user/[id]` - Get user's subscriptions
- `PUT /api/subscriptions/cancel/[id]` - Cancel subscription
- `GET /api/subscriptions/upcoming-user-renewals/[id]` - Get upcoming renewals

### Workflows
- `POST /api/workflows/subscription/reminder` - Trigger reminder workflow

## 🔧 Key Changes from Express.js

1. **Database Connection**: Optimized for serverless with connection caching
2. **Middleware**: Applied per-function instead of globally
3. **Routes**: Converted to individual serverless functions
4. **Error Handling**: Adapted for serverless environment
5. **CORS**: Handled in middleware for each function

## 🛠️ Development

### Local Development
```bash
# Install dependencies
yarn install

# Start Vercel dev server
vercel dev
```

### Frontend Configuration
The frontend automatically uses:
- `process.env.REACT_APP_BACKEND_URL` for API calls
- Defaults to `/api` for same-domain deployment

## 🔒 Security Features

- JWT authentication maintained
- CORS properly configured
- Input validation preserved
- Rate limiting can be added with Vercel Edge Functions
- Arcjet integration ready (optional)

## 📊 Performance Optimizations

1. **Cold Start Mitigation**: Connection caching for MongoDB
2. **Function Size**: Minimal dependencies per function
3. **Timeout Configuration**: 30s max duration for complex operations
4. **Memory Allocation**: 1024MB for database operations

## 🐛 Troubleshooting

### Common Issues:

1. **Database Connection Timeouts**
   - Ensure MongoDB URI is correct
   - Check network access in MongoDB Atlas

2. **CORS Errors**
   - Verify frontend URL in CORS configuration
   - Check environment variables

3. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token format in frontend

4. **Function Timeouts**
   - Optimize database queries
   - Consider increasing function timeout

### Monitoring
- Use Vercel Analytics for performance monitoring
- Check Vercel Function Logs for debugging
- Monitor MongoDB Atlas for database performance

## 📈 Scaling Considerations

- Vercel automatically scales serverless functions
- MongoDB connection pooling handled by Mongoose
- Consider Redis for session storage if needed
- Implement caching strategies for frequently accessed data

## 🔄 Migration from Express.js

If migrating from the original Express.js version:
1. Update frontend API calls to use new endpoints
2. Set up environment variables in Vercel
3. Test all functionality in development
4. Gradually migrate traffic to new deployment