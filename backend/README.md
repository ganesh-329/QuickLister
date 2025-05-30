# MJob Platform Backend

A robust Node.js/Express backend for the MJob platform with authentication, phone verification, and database integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
cd backend
npm install
```

2. **Environment Setup**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

3. **Required Environment Variables**
```env
# Minimum required for development
MONGODB_URI=mongodb://localhost:27017/mjob
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-at-least-32-characters-long
```

4. **Start the Server**
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/request-otp` - Request SMS OTP
- `POST /api/auth/verify-phone` - Verify phone number
- `GET /api/auth/profile` - Get user profile (Protected)

### Health Check
- `GET /health` - Server health status

## 🛡️ Security Features

- **JWT Authentication** - Access & refresh token rotation
- **Password Security** - bcrypt with salt rounds
- **Rate Limiting** - API and SMS request throttling  
- **Input Validation** - Zod schema validation
- **CORS Protection** - Configurable origins
- **Helmet.js** - Security headers
- **Audit Logging** - Security event tracking

## 📱 SMS Integration

Configure Twilio for phone verification:

```env
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**Development Mode**: Use phone number `+919999999999` to see OTP in console logs.

## 🗄️ Database Models

### User Model
- Personal information (name, email, phone)
- Location data (GeoJSON coordinates)
- Skills and experience
- Verification status
- Trust scores and ratings
- Account settings

### Gig Model  
- Job details and requirements
- Location and budget
- Application management
- Timeline tracking

### VerificationLog Model
- Security audit trail
- Login/logout events
- Phone verification logs

## 🔧 Development

### Project Structure
```
backend/
├── src/
│   ├── config/         # Environment & database config
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Authentication & security
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── utils/          # Utilities (SMS, validation)
│   └── server.ts       # Express app setup
├── .env.example        # Environment template
└── package.json
```

### Adding New Features

1. **Create Model** (if needed) in `src/models/`
2. **Add Controller** in `src/controllers/`
3. **Create Routes** in `src/routes/`
4. **Update Server** to include new routes
5. **Add Validation** schemas in `src/utils/validation.ts`

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 📊 Monitoring

### Health Check Response
```json
{
  "status": "ok",
  "timestamp": "2025-01-27T14:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "database": {
    "status": "connected",
    "name": "mjob"
  },
  "memory": {
    "used": 45.67,
    "total": 128.45
  }
}
```

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2025-01-27T14:30:00.000Z"
}
```

## 🔄 Next Steps

1. **Frontend Integration** - Connect React components to API
2. **Gig Management** - CRUD operations for gigs
3. **Search & Discovery** - Geospatial search implementation
4. **Real-time Features** - Socket.io for messaging
5. **Payment Integration** - Razorpay payment processing

## 📝 License

MIT License - See LICENSE file for details.

---

**Status**: ✅ Authentication system complete and ready for frontend integration!
