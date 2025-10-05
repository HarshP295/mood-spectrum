# 🚀 Quick Setup Guide

## Your MongoDB Atlas Connection is Ready!

I've configured your backend with your MongoDB Atlas connection string. Here's how to get everything running:

## Step 1: Install Dependencies

```bash
cd server
npm install
```

## Step 2: Create Environment File

```bash
# This will create your .env file from the config
npm run setup
```

## Step 3: Start the Development Server

```bash
# Start with hot reload
npm run dev

# OR start with setup + dev
npm run dev:setup
```

## Step 4: Test the Connection

Once the server starts, you should see:
```
✅ Connected to MongoDB Atlas
🚀 Server running on port 3001
📊 Health check: http://localhost:3001/health
🔌 WebSocket server initialized
```

## Step 5: Test Your API

Visit: http://localhost:3001/health

You should see:
```json
{
  "status": "OK",
  "timestamp": "2024-01-XX...",
  "uptime": 1.234
}
```

## Your Configuration

- **Backend URL**: http://localhost:3001
- **WebSocket URL**: ws://localhost:3001/ws
- **Database**: mood-spectrum-studio (will be created automatically)
- **JWT Secret**: mood-spectrum-studio-super-secret-jwt-key-2024

## Frontend Configuration

Make sure your frontend is configured to use:
- API Base URL: `http://localhost:3001`
- WebSocket URL: `ws://localhost:3001/ws`

## Available Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Journal
- `GET /api/journal` - Get journal entries
- `POST /api/journal` - Create journal entry

### Dashboard
- `GET /api/dashboard/summary` - Dashboard data
- `GET /api/dashboard/trends` - Mood trends

### Playlists
- `GET /api/playlist` - Get playlists
- `POST /api/playlist` - Create playlist

### Tips
- `GET /api/tips` - Get wellness tips
- `POST /api/tips` - Create tip (admin only)

## Troubleshooting

### If MongoDB connection fails:
1. Check your IP is whitelisted in MongoDB Atlas
2. Verify the connection string is correct
3. Make sure the database user has proper permissions

### If port 3001 is busy:
1. Change PORT in your .env file
2. Update CORS_ORIGIN if needed

### If you get CORS errors:
1. Make sure CORS_ORIGIN matches your frontend URL
2. Default is set to http://localhost:5173 (Vite default)

## Production Deployment

For production, make sure to:
1. Set NODE_ENV=production
2. Use a strong JWT_SECRET
3. Configure proper CORS_ORIGIN
4. Set up proper rate limiting

## Need Help?

If you encounter any issues:
1. Check the console logs
2. Verify your MongoDB Atlas cluster is running
3. Make sure all environment variables are set correctly

Your backend is now ready to power your Mood Spectrum Studio! 🎉
