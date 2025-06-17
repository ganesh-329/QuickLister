# 📋 QuickLister Codebase Documentation

## 1. **Project Structure Overview**

```
QuickLister/
├── frontend/                    # React TypeScript frontend
│   ├── src/
│   │   ├── components/         # React components organized by feature
│   │   │   ├── Auth/          # Authentication components
│   │   │   ├── Dashboard/     # User dashboard components
│   │   │   ├── Gig/           # Gig-related components
│   │   │   ├── Layout/        # Layout components
│   │   │   ├── Map/           # Google Maps integration
│   │   │   ├── Pages/         # Main page components
│   │   │   ├── Profile/       # User profile components
│   │   │   └── UI/            # Reusable UI components
│   │   ├── services/          # API service layer
│   │   ├── stores/            # Zustand state management
│   │   ├── types/             # Frontend-specific types
│   │   └── utils/             # Utility functions
│   ├── public/                # Static assets
│   └── dist/                  # Build output
│
├── backend/                   # Node.js Express backend
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic services
│   │   ├── middleware/       # Express middleware
│   │   ├── config/           # Configuration files
│   │   ├── utils/            # Backend utilities
│   │   └── scripts/          # Database/maintenance scripts
│   └── dist/                 # Compiled TypeScript output
│
├── shared/                   # Shared TypeScript types
│   └── types/               # Common interfaces between frontend/backend
│
└── node_modules/            # Root dependencies
```

### **Key Configuration Files:**
- `package.json` (root): Manages concurrent dev/build scripts
- `frontend/vite.config.ts`: Vite build configuration
- `frontend/tailwind.config.js`: Tailwind CSS setup
- `backend/tsconfig.json`: TypeScript compiler settings
- `backend/src/server.ts`: Main server entry point

## 2. **Existing API Endpoints**

### **Authentication Routes (`/api/auth`)**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | User login | ❌ |
| POST | `/refresh` | Refresh JWT token | ❌ |
| POST | `/logout` | User logout | ✅ |
| GET | `/me` | Get current user profile | ✅ |

### **Gig Routes (`/api/gigs`)**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all gigs with filters | ❌ |
| GET | `/:id` | Get gig by ID | ❌ |
| POST | `/` | Create new gig | ✅ |
| PUT | `/:id` | Update gig | ✅ |
| DELETE | `/:id` | Delete gig | ✅ |
| POST | `/:id/apply` | Apply to gig | ✅ |
| PUT | `/:gigId/applications/:applicationId/accept` | Accept application | ✅ |
| PUT | `/:gigId/applications/:applicationId/reject` | Reject application | ✅ |
| GET | `/user/posted` | Get user's posted gigs | ✅ |
| GET | `/user/applications` | Get user's applications | ✅ |

### **Application Routes (`/api/applications`)**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/:id` | Get application by ID | ✅ |
| PUT | `/:id` | Update application | ✅ |
| DELETE | `/:id` | Delete application | ✅ |
| GET | `/gig/:gigId` | Get applications for gig | ✅ |
| GET | `/user` | Get user's applications | ✅ |

### **Profile Routes (`/api/profile`)**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get current user profile | ✅ |
| PUT | `/` | Update user profile | ✅ |
| DELETE | `/` | Delete user account | ✅ |
| POST | `/avatar` | Update profile avatar | ✅ |
| GET | `/avatar/suggestions` | Get avatar suggestions | ✅ |

### **Chat Routes (`/api/chat`)**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Start new chat session | ✅ |
| GET | `/` | Get user's chats | ✅ |
| GET | `/:chatId/messages` | Get chat messages | ✅ |
| PATCH | `/:chatId/ai` | Toggle AI assistant | ✅ |
| DELETE | `/:chatId` | Delete chat session | ✅ |

### **Health Check Routes**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Server health check | ❌ |
| GET | `/api/ai/health` | Cohere AI health check | ❌ |

## 3. **Database Schema (MongoDB)**

### **User Model**
```typescript
interface IUser {
  _id: ObjectId;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  password: string; // Hashed with bcrypt
  createdAt: Date;
  updatedAt: Date;
}
```

### **Gig Model**
```typescript
interface IGig {
  _id: ObjectId;
  // Basic Information
  title: string;
  description: string;
  category: string; // Enum of predefined categories
  subCategory?: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  
  // Location (GeoJSON Point)
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
    address: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    landmark?: string;
  };
  isRemote: boolean;
  allowsRemote: boolean;
  serviceRadius?: number;
  
  // Job Details
  skills: Array<{
    name: string;
    category: string;
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    isRequired: boolean;
  }>;
  experienceLevel: 'entry' | 'intermediate' | 'experienced' | 'expert';
  toolsRequired?: string[];
  materialsProvided: boolean;
  
  // Payment
  payment: {
    rate: number;
    currency: string;
    paymentType: 'hourly' | 'fixed' | 'daily' | 'weekly';
    totalBudget?: number;
    advancePayment?: number;
    paymentMethod: 'cash' | 'bank_transfer';
  };
  
  // Timeline
  timeline: {
    startDate?: Date;
    endDate?: Date;
    duration?: number;
    deadline?: Date;
    isFlexible: boolean;
    preferredTime?: string;
  };
  
  // Status & Management
  status: 'draft' | 'posted' | 'active' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  posterId: ObjectId; // Reference to User
  assignedTo?: ObjectId; // Reference to User
  applications: IApplication[];
  
  // Metadata
  views: number;
  applicationsCount: number;
  images?: string[];
  documents?: string[];
  contactPreference: 'phone' | 'message' | 'both';
  isRecurring: boolean;
  recurringPattern?: string;
  safetyRequirements?: string[];
  qualityStandards?: string[];
  
  createdAt: Date;
  updatedAt: Date;
  postedAt: Date;
  expiresAt?: Date;
  completionDate?: Date;
}
```

### **Application Schema (Embedded in Gig)**
```typescript
interface IApplication {
  _id: ObjectId;
  applicantId: ObjectId; // Reference to User
  appliedAt: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  statusChangedAt: Date;
  rejectionReason?: string;
  statusHistory: Array<{
    status: string;
    changedAt: Date;
    changedBy?: ObjectId;
    reason?: string;
  }>;
  proposedRate?: number;
  message?: string;
  portfolioLinks?: string[];
  estimatedDuration?: number;
  availability?: Date;
}
```

### **Chat Model**
```typescript
interface IChat {
  _id: ObjectId;
  participants: ObjectId[]; // Array of User IDs
  gig?: ObjectId; // Optional reference to Gig
  aiEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Message Model**
```typescript
interface IMessage {
  _id: ObjectId;
  chat: ObjectId; // Reference to Chat
  sender: ObjectId; // Reference to User
  senderType: 'user' | 'ai';
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 4. **Frontend Component Structure**

### **Routing Structure (`App.tsx`)**
```
/ (Landing) → /auth-selection → /login | /signup
                                    ↓
/main (Map View - Main App) ← Authentication Required
/dashboard (User Dashboard)
/my-gigs (Posted Gigs)
/applications (User Applications)
/profile (User Profile)
```

### **Component Hierarchy**
```
App
├── AuthProvider (Context)
├── LandingPage
├── AuthSelectionPage
├── LoginForm / SignupForm
└── AuthenticatedLayout
    ├── Header with Search
    ├── Sidebar Navigation
    └── Main Content:
        ├── MapView (Google Maps + Gig Markers)
        ├── Dashboard (Stats + Recent Activity)
        ├── MyGigs (Posted Gigs Management)
        ├── Applications (Application Management)
        └── Profile (User Profile Management)
```

### **Key Components**
- **`MapView`**: Google Maps integration with gig markers
- **`CreateGigForm`**: Multi-step gig creation form
- **`GigDetailsModal`**: Detailed gig view with application
- **`Dashboard`**: User dashboard with statistics
- **`AuthenticatedLayout`**: Main app layout with navigation

### **State Management (Zustand)**
- **`gigStore`**: Gig data, filters, search, pagination
- **`chatStore`**: Chat sessions, messages, real-time communication

## 5. **Key Files and Their Purposes**

### **Backend Entry Points**
- **`backend/src/server.ts`**: Express server setup, middleware, routes
- **`backend/src/config/database.js`**: MongoDB connection
- **`backend/src/config/env.js`**: Environment variables

### **Frontend Entry Points**
- **`frontend/src/index.tsx`**: React DOM root
- **`frontend/src/App.tsx`**: Main routing and layout

### **Service Layer**
- **Backend Services**:
  - `cohereService.ts`: AI integration with Cohere
  - `socketService.ts`: WebSocket handling for real-time chat
  
- **Frontend Services**:
  - `api.ts`: Axios configuration and interceptors
  - `authService.ts`: Authentication API calls
  - `gigService.ts`: Gig-related API calls
  - `chatService.ts`: Chat API calls
  - `profileService.ts`: Profile API calls
  - `socketService.ts`: WebSocket client
  - `searchService.ts`: Search functionality

### **Shared Types**
- **`shared/types/gig.ts`**: Complete gig-related interfaces
- **`shared/types/user.ts`**: User-related interfaces
- **`shared/types/index.ts`**: Type exports

## 6. **Data Flow Documentation**

### **Authentication Flow**
1. User registers/logs in via auth endpoints
2. JWT tokens stored in localStorage
3. Axios interceptors add tokens to requests
4. Auth middleware validates tokens on backend
5. User context provided throughout frontend

### **Gig Creation/Application Flow**
1. **Create Gig**: Form → `gigService.createGig()` → `POST /api/gigs` → MongoDB
2. **View Gigs**: Map/List → `gigService.getGigs()` → `GET /api/gigs` → Filtered results
3. **Apply to Gig**: Application → `gigService.applyToGig()` → `POST /api/gigs/:id/apply` → Update gig applications
4. **Accept/Reject**: Gig owner → `gigService.acceptApplication()` → `PUT /api/gigs/:gigId/applications/:appId/accept`

### **Chat System Flow**
1. **Start Chat**: User action → `chatService.createChat()` → `POST /api/chat`
2. **Real-time Messages**: Socket.io connection → Message events
3. **AI Integration**: AI enabled chats → Cohere service → AI responses
4. **Message History**: `chatService.getChatMessages()` → `GET /api/chat/:chatId/messages`

### **AI Integration Structure**
- **Cohere AI Service**: Backend service for AI chat assistance
- **Health Check**: `/api/ai/health` endpoint for AI service status
- **Chat Integration**: AI can be toggled per chat session

## 7. **Environment Variables Required**

### **Frontend (`.env`)**
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_API_URL=http://localhost:5000
```

### **Backend (`.env`)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quicklister
JWT_SECRET=your_jwt_secret
COHERE_API_KEY=your_cohere_api_key
CORS_ORIGIN=http://localhost:5173
```

## 8. **Technology Stack Summary**

### **Frontend Technologies**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + PostCSS
- React Router DOM v6
- Zustand (state management)
- Axios (HTTP client)
- Google Maps API
- Socket.io Client
- Lucide React Icons

### **Backend Technologies**
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs (password hashing)
- Socket.io (WebSocket)
- Cohere AI
- Winston (logging)
- Helmet, CORS, Rate Limiting

## 9. **Current Gig Categories**
Based on the backend model, the following gig categories are supported:
- `home_services`
- `repair_maintenance`
- `cleaning`
- `gardening`
- `tech_services`
- `tutoring`
- `photography`
- `event_services`
- `delivery`
- `personal_care`
- `pet_services`
- `automotive`
- `construction`
- `electrical`
- `plumbing`
- `painting`
- `moving`
- `handyman`
- `security`
- `other`

## 10. **Search Functionality (Existing)**
Current search is implemented in:
- **Backend**: Basic query filtering in gig controller
- **Frontend**: Search bar in authenticated layout
- **Store**: Search query state in gigStore
- **Service**: searchService.ts for search operations

---

This documentation provides a complete overview of your QuickLister codebase structure, APIs, and data flows. The codebase is well-organized with proper TypeScript typing and modern development practices. 