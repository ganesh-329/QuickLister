# 🚀 QuickLister Deployment Guide

Complete guide for deploying QuickLister to Vercel for production use.

## 📋 **Quick Start (Automated)**

Run the automated deployment script:

```bash
./deploy.sh
```

This script will:
- ✅ Check prerequisites
- ✅ Install dependencies  
- ✅ Test builds locally
- ✅ Guide you through deployment
- ✅ Provide environment variable setup

## 🛠️ **Manual Deployment Steps**

### 1. **Prerequisites**

```bash
# Check Node.js version (requires 18+)
node --version

# Install Vercel CLI globally
npm install -g vercel

# Install dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### 2. **Environment Variables Setup**

#### **MongoDB Atlas Setup**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free tier cluster
3. Create a database user
4. Add IP address `0.0.0.0/0` to whitelist (for production)
5. Copy connection string

#### **Required Environment Variables for Vercel**

Set these in your Vercel dashboard (`Settings > Environment Variables`):

```env
# Backend Variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quicklister
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-at-least-32-characters
COHERE_API_KEY=your-cohere-api-key-for-ai-chat
CORS_ORIGIN=https://your-app-domain.vercel.app
NODE_ENV=production

# Frontend Variables  
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
VITE_API_URL=/api
```

### 3. **API Keys Setup**

#### **Cohere AI (for Chat)**
1. Go to [Cohere](https://cohere.ai/)
2. Sign up for free account
3. Generate API key
4. Add to `COHERE_API_KEY` environment variable

#### **Google Maps (Optional)**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API
3. Create API key
4. Add to `VITE_GOOGLE_MAPS_API_KEY`

### 4. **Deploy to Vercel**

#### **Option A: Via CLI**
```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### **Option B: Via Dashboard**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Import Project"
3. Connect GitHub repository
4. Configure build settings:
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install`
5. Add environment variables
6. Deploy!

## 🔧 **Configuration Files Explained**

### **`vercel.json`**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "frontend/dist" }
    },
    {
      "src": "backend/src/server.ts",
      "use": "@vercel/node",
      "config": { "maxDuration": 30 }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/backend/src/server.ts" },
    { "src": "/health", "dest": "/backend/src/server.ts" },
    { "src": "/(.*)", "dest": "/frontend/dist/$1" }
  ]
}
```

**Key Points:**
- Frontend deployed as static site
- Backend deployed as serverless functions
- API routes proxied to backend
- 30-second timeout for functions

## ⚠️ **Important Limitations on Vercel**

### **Socket.io Real-time Chat**
- Vercel serverless functions don't support persistent WebSocket connections
- Chat may fall back to polling mode
- Real-time features will be limited
- Consider using Vercel's Edge Functions or external service for real-time features

### **Serverless Function Limits**
- 30-second execution timeout
- Memory limits apply
- Cold start delays possible

## 🧪 **Testing After Deployment**

### **Automated Testing Checklist**

Test these URLs after deployment:

```bash
# Replace YOUR_DOMAIN with your actual Vercel domain

# Health Check
curl https://YOUR_DOMAIN.vercel.app/health

# API Health
curl https://YOUR_DOMAIN.vercel.app/api

# AI Health (if Cohere is configured)
curl https://YOUR_DOMAIN.vercel.app/api/ai/health
```

### **Manual Testing Checklist**

- [ ] Landing page loads correctly
- [ ] User registration works
- [ ] User login works  
- [ ] Dashboard displays
- [ ] Gig creation form works
- [ ] Map view displays (if Google Maps configured)
- [ ] Search functionality works
- [ ] Admin panel accessible
- [ ] API endpoints respond
- [ ] Database operations work
- [ ] Chat system functions (with limitations)

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Build Failures**
```bash
# Test builds locally first
npm run build:frontend
npm run build:backend

# Check for TypeScript errors
cd frontend && npm run lint
cd backend && npm run lint
```

#### **Environment Variable Issues**
- Ensure all required variables are set in Vercel dashboard
- Check variable names match exactly (case-sensitive)
- Restart deployment after adding variables

#### **Database Connection Issues**
- Verify MongoDB Atlas whitelist includes `0.0.0.0/0`
- Check connection string format
- Ensure database user has read/write permissions

#### **CORS Issues**
- Update `CORS_ORIGIN` to match your Vercel domain
- Format: `https://your-app-name.vercel.app` (no trailing slash)

#### **API Not Working**
- Check API routes are accessible: `https://your-domain.vercel.app/api`
- Verify backend build completed successfully
- Check Vercel function logs for errors

### **Debug Commands**
```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs

# Check environment variables
vercel env ls
```

## 📊 **Performance Optimization**

### **Frontend Optimizations**
- Code splitting implemented in `vite.config.ts`
- Bundle analysis: `cd frontend && npm run build -- --analyze`
- Image optimization: Use Vercel's image optimization

### **Backend Optimizations**
- Database connection pooling enabled
- Rate limiting configured
- Compression middleware enabled
- Proper error handling

## 🔐 **Security Considerations**

### **Production Security**
- JWT secrets are properly configured
- CORS is restricted to your domain
- Rate limiting is active
- Helmet security headers enabled
- Input validation with Zod schemas

### **Environment Security**
- Never commit API keys to git
- Use Vercel's encrypted environment variables
- Rotate secrets regularly
- Monitor usage and logs

## 📈 **Monitoring & Analytics**

### **Vercel Analytics**
- Enable Vercel Analytics in dashboard
- Monitor performance metrics
- Track user interactions

### **Error Monitoring**
- Check Vercel function logs regularly
- Monitor API response times
- Set up alerts for failures

## 🚀 **Post-Deployment**

### **Domain Setup**
1. Add custom domain in Vercel dashboard
2. Update `CORS_ORIGIN` environment variable
3. Update any hardcoded URLs

### **SSL Certificate**
- Vercel provides automatic SSL
- Verify HTTPS is working
- Update any HTTP references

### **Performance Testing**
- Test from different locations
- Check mobile responsiveness
- Verify all features work

## 🎯 **For S6 BTech Evaluation**

Your deployed QuickLister will demonstrate:

### **Fullstack Development**
- ✅ React.js frontend with TypeScript
- ✅ Node.js/Express backend with TypeScript
- ✅ MongoDB database integration
- ✅ Real-time chat system
- ✅ Authentication & authorization

### **Modern Web Technologies**
- ✅ Responsive design with Tailwind CSS
- ✅ State management with Zustand
- ✅ API integration with Axios
- ✅ Map integration with Google Maps
- ✅ AI integration with Cohere

### **Production Deployment**
- ✅ Live application URL to share
- ✅ Production database
- ✅ Environment configuration
- ✅ Security implementations
- ✅ Performance optimizations

## 📞 **Support**

If you encounter issues:

1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Test locally first with `npm run dev`
4. Verify all environment variables are set

**Happy Deploying! 🎉**

Your QuickLister app will be live and ready to showcase your fullstack development skills! 