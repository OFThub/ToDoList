# Deployment Guide for ToDoList Application

## Overview
This is a full-stack MERN (MongoDB, Express, React, Node.js) application with separate frontend and backend. This guide covers how to deploy both.

## Part 1: Frontend Deployment (Netlify)

Your frontend is already configured for Netlify! Here's what to do:

### Steps:
1. **Push your code to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up or log in
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Netlify will auto-detect the `netlify.toml` configuration

3. **Set Environment Variables in Netlify**
   - In your Netlify Site Settings → Build & Deploy → Environment
   - Add: `VITE_API_BASE_URL` = `https://your-backend-url.com/api/v1`
   - Replace `your-backend-url` with your actual backend deployment URL

4. **Deploy**
   - Push changes to GitHub and Netlify will auto-deploy
   - Or manually trigger a deploy in Netlify dashboard

---

## Part 2: Backend Deployment

Since your backend is a traditional Express.js server (not serverless functions), you'll need to deploy it separately. Here are recommended options:

### Option A: Railway (Recommended - Simple)
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project → GitHub repo
4. Railway will detect Node.js and build automatically
5. Set environment variables in Railway dashboard:
   - `MONGODB_URI` - your MongoDB connection string
   - `JWT_SECRET` - secret key for JWT tokens
   - Any other required env vars from your `.env`
6. Your backend URL will be like: `https://your-project.railway.app`

### Option B: Render (Also Simple)
1. Go to [render.com](https://render.com)
2. Create new service → GitHub repo
3. Set build command: `npm install`
4. Set start command: `node server.js` (or whatever your entry point is)
5. Add environment variables
6. Your backend URL will be like: `https://your-project.onrender.com`

### Option C: Heroku (Classic Choice)
1. Install Heroku CLI
2. Run: `heroku create your-app-name`
3. Set config vars: `heroku config:set MONGODB_URI=...`
4. Deploy: `git push heroku main`

---

## Configuration Checklist

### Frontend (.env in Netlify)
- [ ] `VITE_API_BASE_URL` set to your backend URL

### Backend Environment Variables (required)
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - Any random secret string for JWT
- [ ] `PORT` - (optional, defaults to 5000)
- [ ] `NODE_ENV` - Set to `production`

### CORS Setup
Make sure your backend Express server has CORS configured to accept requests from your Netlify frontend URL:

In your `server.js` or `app.js`:
```javascript
const cors = require('cors');
app.use(cors({
  origin: [
    'http://localhost:3000', // local dev
    'https://your-netlify-site.netlify.app' // your actual domain
  ]
}));
```

### Database
- [ ] MongoDB is set up and connection string is available
- [ ] Connection string includes credentials and is secure

---

## MongoDB Setup

If you don't have MongoDB set up:

### Option A: MongoDB Atlas (Cloud - Recommended)
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster (free tier)
4. Get connection string
5. Use this as `MONGODB_URI` in your backend deployment

### Option B: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Connection string: `mongodb://localhost:27017/todolist`

---

## After Deployment

1. **Update Frontend API URL**
   - Set `VITE_API_BASE_URL` in Netlify environment variables
   - Rebuild/redeploy frontend

2. **Test Your Application**
   - Visit your Netlify frontend URL
   - Try logging in/registering
   - Test creating projects and tasks

3. **Monitor**
   - Check Netlify deployment logs
   - Check backend service logs for errors
   - Monitor MongoDB for connection issues

---

## Troubleshooting

### CORS Errors
- Make sure backend allows requests from your Netlify domain
- Check that `VITE_API_BASE_URL` is set correctly

### API 404 Errors
- Verify backend is running and accessible
- Check API endpoints match between frontend and backend
- Verify URL path structure (e.g., `/api/v1/...`)

### Database Connection Fails
- Verify `MONGODB_URI` is correct
- Check network access rules in MongoDB (if using Atlas)
- Ensure credentials are valid

### Build Fails on Netlify
- Check build logs in Netlify dashboard
- Verify all dependencies are in `package.json`
- Ensure `.env` variables are set in Netlify dashboard

---

## Local Development

To run locally before deploying:

### Terminal 1 - Backend
```bash
cd backend
npm install
# Set .env variables or use defaults
node server.js
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Domain Setup (Optional)

To use a custom domain:

1. **Netlify Frontend**
   - In Netlify Sites → Your Site → Domain Settings
   - Add custom domain
   - Update DNS records as shown

2. **Backend Custom Domain**
   - Configure through your backend hosting provider
   - Update `VITE_API_BASE_URL` accordingly
