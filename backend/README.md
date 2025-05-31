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
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# DigiLocker Configuration
DIGILOCKER_CLIENT_ID=your-digilocker-client-id
DIGILOCKER_CLIENT_SECRET=your-digilocker-client-secret
DIGILOCKER_REDIRECT_URI=http://localhost:5173/auth/digilocker/callback

# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Email Configuration
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
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

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=your-mongodb-uri

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# DigiLocker Configuration
DIGILOCKER_CLIENT_ID=your-digilocker-client-id
DIGILOCKER_CLIENT_SECRET=your-digilocker-client-secret
DIGILOCKER_REDIRECT_URI=http://localhost:5173/auth/digilocker/callback

# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Email Configuration
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

3. Configure DigiLocker:
   - Register as a DigiLocker partner at https://digitallocker.gov.in/
   - Get your client ID and secret
   - Set up your redirect URI in the DigiLocker dashboard
   - Add the credentials to your `.env` file

4. Start the development server:
```bash
npm run dev
```

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### DigiLocker Authentication
```http
GET /api/auth/digilocker/authorize
```

#### DigiLocker Callback
```http
GET /api/auth/digilocker/callback
```

### User Endpoints

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "location": {
    "type": "Point",
    "coordinates": [72.8777, 19.0760]
  }
}
```

## Development

### Project Structure
```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── utils/          # Utility functions
└── server.ts       # Entry point
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Security

- JWT-based authentication
- Rate limiting
- Input validation with Zod
- Secure password hashing
- CORS protection
- Helmet security headers

## Error Handling

The API uses a global error handler that returns consistent error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // Optional additional error details
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
