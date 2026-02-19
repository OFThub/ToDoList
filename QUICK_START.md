# 🚀 Quick Start & Deployment Checklist

## ✅ What's Been Configured

- [x] **Netlify Configuration** (`netlify.toml`)
  - Build command configured for frontend
  - SPA rewrites for React Router
  - Cache headers for optimization
  - Development server settings

- [x] **Environment Variables Support**
  - Frontend: `VITE_API_BASE_URL` for API endpoint
  - Backend: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `PORT`
  - Example files created (`.env.example`)

- [x] **NPM Scripts**
  - Root: `npm run dev` - Runs both frontend & backend
  - Root: `npm run build` - Builds both for production
  - Backend: `npm run dev` - Runs with nodemon
  - Backend: `npm start` - Production start

- [x] **Documentation**
  - `DEPLOYMENT_GUIDE.md` - Complete deployment walkthrough
  - `.env.example` files - Environment variable examples

---

## 🔧 Local Development Setup

### First Time Setup
```bash
# Install all dependencies
npm run install:all

# Or manually:
npm install
cd backend && npm install && cd ../
cd frontend && npm install && cd ../
```

### Start Development Servers
```bash
# Terminal 1 - Start both frontend and backend
npm run dev

# OR start separately:

# Terminal 1 - Backend (runs on http://localhost:5000)
cd backend
npm run dev

# Terminal 2 - Frontend (runs on http://localhost:5173)
cd frontend
npm run dev
```

---

## 🌍 Deployment Steps

### Step 1: Prepare Your Code
```bash
# Make sure everything is committed
git status
git add .
git commit -m "Configure for Netlify deployment"
git push origin main
```

### Step 2: Deploy Frontend to Netlify

1. **Create Netlify Account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login

2. **Connect GitHub Repository**
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository
   - Netlify auto-detects `netlify.toml` ✓

3. **Configure Environment Variables**
   - Go to: **Site Settings** → **Build & Deploy** → **Environment**
   - Add these variables:
     ```
     VITE_API_BASE_URL = https://your-backend-domain.com/api/v1
     ```

4. **Trigger Deploy**
   - Click "Deploy site" or push to GitHub to auto-deploy

### Step 3: Deploy Backend

Choose ONE option below:

#### Option A: Railway (Recommended - 🎯 Easiest)
```bash
# 1. Go to railway.app and sign up with GitHub
# 2. Create new project → Select your repo
# 3. Railway auto-detects Node.js
# 4. Add environment variables:
#    - MONGO_URI: your_mongodb_connection_string
#    - JWT_SECRET: generate_a_random_secret
#    - CLIENT_URL: https://your-netlify-site.netlify.app
#    - NODE_ENV: production
# 5. Railway deploys automatically!
```

#### Option B: Render (🎯 Simple Alternative)
```bash
# 1. Go to render.com
# 2. Create new → Web Service
# 3. Connect GitHub repo
# 4. Set build command: npm install
# 5. Set start command: npm start
# 6. Add environment variables (same as above)
# 7. Deploy!
```

#### Option C: Heroku
```bash
npm install -g heroku
heroku login
heroku create your-app-name
heroku config:set MONGO_URI=your_uri
heroku config:set JWT_SECRET=your_secret
heroku config:set CLIENT_URL=https://your-netlify-site.netlify.app
git push heroku main
```

### Step 4: Update Frontend with Backend URL
After backend is deployed, update Netlify environment:
- Get your backend URL from Railway/Render/Heroku
- Go to Netlify: **Site Settings** → **Build & Deploy** → **Environment**
- Update `VITE_API_BASE_URL` to your backend URL
- Trigger a redeploy in Netlify

---

## 🗄️ Database: MongoDB Setup

### Option A: MongoDB Atlas (Cloud - Recommended ☁️)
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Sign up (free tier available)
3. Create a cluster
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/todolist`
5. Use as `MONGO_URI` in backend

### Option B: Local MongoDB
1. Install MongoDB
2. Start MongoDB service
3. Connection string: `mongodb://localhost:27017/todolist`

---

## 🧪 Testing After Deployment

### Frontend Tests
- [ ] Visit your Netlify URL
- [ ] Page loads without errors
- [ ] Navigation works (no 404 errors)
- [ ] Check browser console for errors

### API Connection Tests
- [ ] Open Developer Tools (F12)
- [ ] Try logging in/registering
- [ ] Create a project
- [ ] Create a task
- [ ] Check Network tab - API calls should use your backend URL

### Full Flow Test
1. Register new account
2. Create project
3. Add tasks/todos
4. Edit tasks
5. Delete project
6. Verify data appears correctly

---

## 🐛 Troubleshooting

### "Cannot connect to API" / CORS Error
```
❌ Problem: API calls failing with CORS errors
✅ Solution:
   1. Check VITE_API_BASE_URL in Netlify environment
   2. Verify backend allows CORS from your frontend URL
   3. Check that backend CLIENT_URL includes your Netlify domain
```

### "Cannot find module" on Netlify
```
❌ Problem: Build fails - module not found
✅ Solution:
   1. Check Netlify build logs
   2. Verify package.json has all dependencies
   3. Check .gitignore isn't excluding required files
```

### "MongoDB connection failed"
```
❌ Problem: Backend can't connect to database
✅ Solution:
   1. Verify MONGO_URI is correct
   2. If Atlas: check IP whitelist allows your backend IP
   3. Check credentials are correct
```

### "Token Invalid" after deployment
```
❌ Problem: Can't stay logged in after refresh
✅ Solution:
   1. Usually normal - tokens are stored in localStorage
   2. If persistent: check JWT_SECRET is same on all backend instances
```

---

## 📋 Deployment Checklist

### Before Deploying Frontend
- [ ] Environment variables added to Netlify
- [ ] `netlify.toml` is correct (already configured ✓)
- [ ] Frontend builds locally: `npm run build`
- [ ] All dependencies in `package.json`

### Before Deploying Backend
- [ ] Backend starts locally: `npm run dev`
- [ ] Environment variables configured on deployment service
- [ ] MongoDB connection string works
- [ ] JWT_SECRET is set
- [ ] CORS includes frontend URL

### After Both Are Deployed
- [ ] Backend URL is set in frontend environment
- [ ] Frontend redeploy triggered after backend deployment
- [ ] Login/Register works
- [ ] Can get/create/update/delete data
- [ ] Socket.io connections work (if applicable)

---

## 📚 File Reference

- **Deployment Config**: [netlify.toml](netlify.toml)
- **Full Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Frontend Env**: [frontend/.env.example](frontend/.env.example)
- **Backend Env**: [backend/.env.example](backend/.env.example)
- **Root Scripts**: [package.json](package.json)

---

## 💡 Common Commands

```bash
# Local Development
npm run dev                    # Run frontend + backend
npm run build                  # Build for production
npm run check-types            # Check TypeScript

# Backend Only
cd backend
npm run dev                    # Start with auto-reload
npm start                      # Start production

# Frontend Only
cd frontend
npm run dev                    # Dev server
npm run build                  # Build
npm run preview                # Preview production build

# Install Everything
npm run install:all            # Install all dependencies
```

---

## 🔗 Useful Links

- **Netlify**: https://netlify.com
- **Railway**: https://railway.app (Backend hosting)
- **Render**: https://render.com (Backend hosting)
- **MongoDB Atlas**: https://mongodb.com/cloud/atlas
- **Heroku**: https://heroku.com

---

## 📞 Getting Help

If something goes wrong:
1. Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed troubleshooting
2. Check deployment service logs (Netlify/Railway/etc)
3. Verify all environment variables are set correctly
4. Check browser console for client-side errors
5. Check backend logs for server errors

Happy deploying! 🎉
