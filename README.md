# HEYYU2 - Voice Social Platform

![HEYYU2 Logo](./frontend/public/logo.svg)

A modern, mobile-first social media platform built entirely around ultra-short voice content (12-second posts). Combines Twitter's feed experience with TikTok's engaging scroll and voice-first interaction.

## 🎯 Features

### ✅ Implemented
- **Voice Posts** - 12-second voice recordings with waveform visualization
- **Auto-Play Feed** - Infinite scroll with automatic audio playback
- **Live Subtitles** - Real-time synced subtitle display during playback
- **Authentication** - Email/password + Google OAuth login
- **Voice Reactions** - Quick reaction system with 6 emotion types
- **Reply System** - Text and voice replies (up to 6 seconds)
- **Anonymous Mode** - Post with masked identity
- **Mobile-First UI** - Touch-optimized, responsive design
- **Dark Theme** - Premium purple/pink gradient aesthetic

### 🚧 Coming Soon
- Voice recording with real-time transcription
- Speech-to-text (Web Speech API / OpenAI Whisper)
- Voice effects (robot, deep, whisper, etc.)
- Voice duet/remix features
- Mini voice rooms (live discussions)
- Trending algorithm
- AI content moderation

## 🏗️ Tech Stack

**Backend:**
- Node.js + Express
- MongoDB (Mongoose)
- JWT Authentication
- Google OAuth 2.0
- Multer (file uploads)
- bcrypt (password hashing)

**Frontend:**
- React + Vite
- @react-oauth/google
- HTML5 Audio API
- Canvas (waveforms)
- Custom CSS (no framework)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/mypost1907-cmyk/HEYYU2.git
cd HEYYU2
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your MongoDB URI and secrets

npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install

# Create .env file (for Google OAuth)
cp .env.example .env
# Edit .env and add your Google Client ID

npm run dev
```

4. **Access the app**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
HEYYU2/
├── backend/                 # Node.js API server
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth middleware
│   ├── config/             # Database config
│   └── server.js           # Express app
│
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── utils/          # Helper functions
│   │   ├── App.jsx         # Main app
│   │   └── index.css       # Design system
│   └── public/             # Static assets
│
└── docs/                   # Documentation
    ├── GOOGLE_OAUTH_SETUP.md
    └── REBRANDING.md
```

## 🔑 Environment Variables

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vibe-social
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Frontend** (`frontend/.env`):
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🔐 Google OAuth Setup

For detailed Google OAuth configuration, see [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

Quick steps:
1. Create project in Google Cloud Console
2. Configure OAuth consent screen
3. Create OAuth Client ID
4. Add credentials to `.env` files
5. Restart servers

## 📱 Features Breakdown

### Voice Posts
- Maximum 12 seconds duration
- Real-time waveform visualization
- Auto-generated avatars
- Anonymous mode option
- Listen tracking analytics

### Feed System
- Infinite scroll pagination
- Auto-play on scroll (70% visibility)
- Smooth transitions
- Loading states

### Authentication
- Traditional email/password
- Google Sign-In integration
- JWT token-based
- Secure password hashing (bcrypt)

### Voice Reactions
Available reactions:
- 🔥 Fire
- 😂 Laugh
- 👏 Applause
- 😮 Shock
- ❤️ Love
- 🤔 Thinking

## 🎨 Design System

- **Primary Colors**: Purple (#7c3aed) to Pink (#ec4899)
- **Typography**: Inter (body), Outfit (headings)
- **Effects**: Glassmorphism, neon glows, smooth animations
- **Mobile-First**: Responsive, touch-optimized (44px+ targets)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts/feed` - Get feed (paginated)
- `GET /api/posts/trending` - Get trending posts
- `POST /api/posts` - Create voice post
- `DELETE /api/posts/:id` - Delete post

### Replies & Reactions
- `POST /api/replies` - Create reply
- `GET /api/replies/post/:postId` - Get replies
- `POST /api/reactions` - Add/remove reaction
- `GET /api/reactions/:targetType/:targetId` - Get reactions

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚢 Deployment

### Backend
- Deploy to Railway, Heroku, or AWS
- Set environment variables
- Connect to MongoDB Atlas

### Frontend
- Deploy to Vercel or Netlify
- Update API URL in code
- Add production Google OAuth credentials

## 📄 License

MIT License - feel free to use for your own projects!

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and create a Pull Request

## 🔗 Links

- [GitHub Repository](https://github.com/mypost1907-cmyk/HEYYU2)
- [Google OAuth Setup Guide](./GOOGLE_OAUTH_SETUP.md)
- [Project Documentation](./docs/)

---

Built with ♥️ for voice-first social experiences

**HEYYU2** - Voice Social Platform
