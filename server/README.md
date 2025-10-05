# Mood Spectrum Studio - Backend API

A comprehensive backend API for the Mood Spectrum Studio wellness application, built with Node.js, Express, TypeScript, and MongoDB Atlas.

## Features

- **Authentication & Authorization**: JWT-based auth with user roles (user/admin)
- **Journal Management**: CRUD operations for mood journaling
- **Dashboard Analytics**: Mood trends, distribution, and insights
- **Playlist Management**: Mood-based music playlists
- **Wellness Tips**: Daily tips with admin management
- **Real-time Chat**: WebSocket support for peer support chat
- **Security**: Rate limiting, CORS, helmet, input validation

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Journal
- `GET /api/journal` - Get journal entries (paginated)
- `GET /api/journal/:id` - Get specific entry
- `POST /api/journal` - Create new entry
- `PUT /api/journal/:id` - Update entry
- `DELETE /api/journal/:id` - Delete entry

### Dashboard
- `GET /api/dashboard/summary` - Dashboard summary data
- `GET /api/dashboard/trends` - Mood trends over time
- `GET /api/dashboard/mood-distribution` - Mood distribution charts
- `GET /api/dashboard/insights` - Personalized insights

### Playlists
- `GET /api/playlist` - Get user playlists
- `GET /api/playlist/:id` - Get specific playlist
- `POST /api/playlist` - Create playlist
- `PUT /api/playlist/:id` - Update playlist
- `DELETE /api/playlist/:id` - Delete playlist
- `GET /api/playlist/category/:category` - Get by category

### Tips
- `GET /api/tips` - Get all tips (public)
- `GET /api/tips/:id` - Get specific tip
- `POST /api/tips` - Create tip (admin)
- `PUT /api/tips/:id` - Update tip (admin)
- `DELETE /api/tips/:id` - Delete tip (admin)
- `GET /api/tips/category/:category` - Get by category
- `GET /api/tips/random` - Get random tips

### WebSocket
- `WS /ws` - Real-time chat and notifications

## Setup Instructions

### 1. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp env.example .env
```

Update the `.env` file with your configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mood-spectrum-studio?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Install Dependencies

```bash
npm install
```

### 3. MongoDB Atlas Setup

1. Create a MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address
5. Get your connection string and update `MONGODB_URI` in `.env`

### 4. Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### 5. Production Deployment

The server is ready for deployment on platforms like:
- Heroku
- Railway
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Google Cloud Run

Make sure to set all environment variables in your deployment platform.

## Database Models

### User
- Email, password, role, preferences
- Authentication and profile management

### Journal
- User journal entries with mood tracking
- Tags, privacy settings, timestamps

### Playlist
- Mood-based music playlists
- Songs with metadata, categories

### Tip
- Wellness tips with categories and tags
- Admin management, active/inactive status

### Chat
- Real-time messaging system
- Room-based chat with reactions

## Security Features

- JWT authentication with configurable expiration
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- CORS configuration
- Input validation and sanitization
- Helmet for security headers
- MongoDB injection protection

## WebSocket Events

### Client to Server
- `room.join` - Join a chat room
- `chat.message` - Send a message
- `room.leave` - Leave current room

### Server to Client
- `welcome` - Connection confirmation
- `room.joined` - Room join confirmation
- `room.count` - Room member count
- `chat.message` - New message
- `tip.created` - New tip notification
- `tip.updated` - Tip update notification
- `tip.deleted` - Tip deletion notification

## Error Handling

The API includes comprehensive error handling:
- Validation errors with detailed messages
- Authentication and authorization errors
- Database connection errors
- Rate limiting responses
- WebSocket connection errors

## API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50,
    "limit": 10
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ]
}
```

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Write descriptive commit messages
5. Test all endpoints before submitting

## License

MIT License - see LICENSE file for details
