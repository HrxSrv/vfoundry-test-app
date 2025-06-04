# Google One Tap Authentication Demo

This is a Next.js frontend that tests the FastAPI backend with Google OAuth One Tap sign-in and MongoDB integration.

## Setup

1. **Environment Variables**
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`
   Add your Google Client ID to `.env.local`

2. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Run Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Make sure your FastAPI backend is running on `http://localhost:8000`**

## Features

- ✅ Google One Tap sign-in
- ✅ JWT token management
- ✅ User profile display
- ✅ Automatic authentication check
- ✅ Sign out functionality
- ✅ Backend status monitoring

## Backend Requirements

Your FastAPI backend should have:
- `/api/v1/auth/google` - POST endpoint for Google authentication
- `/api/v1/auth/validate` - GET endpoint for token validation
- `/api/v1/auth/logout` - POST endpoint for logout
- `/api/v1/users/me` - GET endpoint for user profile

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000` to authorized origins
6. Copy the Client ID to your `.env.local` file
