# QuickLister Codebase Documentation

## 1. Project Structure Overview

```
QuickLister/
├── backend/                    # Node.js/Express.js server
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic & external services
│   │   ├── middleware/        # Auth & validation middleware
│   │   ├── config/            # Database & environment config
│   │   ├── utils/             # Utility functions
│   │   └── server.ts          # Main server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React.js client
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Auth/          # Authentication components
│   │   │   ├── Gig/           # Gig-related components
│   │   │   ├── Dashboard/     # User dashboard
│   │   │   ├── Admin/         # Admin panel
│   │   │   ├── Profile/       # User profile
│   │   │   ├── Layout/        # Layout components
│   │   │   ├── Map/           # Map functionality
│   │   │   ├── Pages/         # Page components
│   │   │   └── UI/            # Reusable UI components
│   │   ├── services/          # API service layer
│   │   ├── stores/            # Zustand state management
│   │   ├── types/             # TypeScript definitions
│   │   ├── utils/             # Utility functions
│   │   ├── config/            # Frontend configuration
│   │   └── App.tsx            # Main app component
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── shared/                     # Shared TypeScript types
    └── types/
        ├── user.ts            # User-related types
        ├── gig.ts             # Gig-related types
        └── index.ts           # Type exports
```

## 2. Existing API Endpoints

### Authentication Endpoints (`/api/auth`)
```
POST   /api/auth/register      # User registration
POST   /api/auth/login         # User login
POST   /api/auth/refresh       # Refresh JWT token
POST   /api/auth/logout        # Logout (requires auth)
GET    /api/auth/me            # Get current user profile (requires auth)
```

### Gig Management (`/api/gigs`)
```
# Public Routes
GET    /api/gigs               # Get all gigs with filters
GET    /api/gigs/:id           # Get specific gig by ID

# Protected Routes (require authentication)
POST   /api/gigs               # Create new gig
PUT    /api/gigs/:id           # Update gig
DELETE /api/gigs/:id           # Delete gig

# Application Management
POST   /api/gigs/:id/apply                                    # Apply to gig
PUT    /api/gigs/:gigId/applications/:applicationId/accept    # Accept application
PUT    /api/gigs/:gigId/applications/:applicationId/reject    # Reject application

# User-specific
GET    /api/gigs/user/posted        # Get user's posted gigs
GET    /api/gigs/user/applications  # Get user's applications
```

### Application Management (`/api/applications`)
```
GET    /api/applications/:id              # Get application by ID
PUT    /api/applications/:id              # Update application
DELETE /api/applications/:id              # Delete application
GET    /api/applications/gig/:gigId       # Get applications for specific gig
GET    /api/applications/user             # Get current user's applications
```

### User Profile (`/api/profile`)
```
GET    /api/profile                    # Get current user profile
PUT    /api/profile                    # Update user profile
DELETE /api/profile                    # Delete user account
POST   /api/profile/avatar             # Update profile avatar
GET    /api/profile/avatar/suggestions # Get avatar suggestions
```

### Chat System (`/api/chat`)
```
POST   /api/chat                    # Start new chat session
GET    /api/chat                    # Get user's chats
GET    /api/chat/:chatId/messages   # Get chat messages
PATCH  /api/chat/:chatId/ai         # Toggle AI assistant
DELETE /api/chat/:chatId            # Delete chat session
```

### Dashboard (`/api/dashboard`)
```
GET    /api/dashboard/stats         # Get dashboard statistics
```

### Admin Panel (`/api/admin`)
```
# Authentication
POST   /api/admin/login             # Admin login

# Dashboard
GET    /api/admin/dashboard/stats   # Get admin dashboard stats

# User Management
GET    /api/admin/users             # Get all users
PATCH  /api/admin/users/:userId/status    # Update user status
DELETE /api/admin/users/:userId     # Delete user

# Gig Management
GET    /api/admin/gigs              # Get all gigs (admin view)
PATCH  /api/admin/gigs/:gigId/status      # Update gig status
DELETE /api/admin/gigs/:gigId       # Delete gig
```

### Health Check Endpoints
```
GET    /health                      # Server health check
GET    /api/ai/health               # AI service health check
```

## 3. Database Schema

### User Model (`User.ts`)
```typescript
interface IUser {
  _id: ObjectId;
  name: string;                     // Required, 2-100 chars
  email: string;                    // Required, unique, valid email
  phone?: string;                   // Optional, international format
  location?: string;                // Optional, max 100 chars
  bio?: string;                     // Optional, max 500 chars
  avatar?: string;                  // Optional avatar URL
  password: string;                 // Hashed, min 8 chars
  role: 'user' | 'admin';          // Default: 'user'
  status: 'active' | 'disabled';   // Default: 'active'
  createdAt: Date;
  updatedAt: Date;
}
```

### Gig Model (`Gig.ts`)
```typescript
interface IGig {
  _id: ObjectId;
  
  // Basic Information
  title: string;                    // 5-200 chars
  description: string;              // 20-2000 chars
  category: string;                 // Enum of service categories
  subCategory?: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  
  // Location (GeoJSON Point)
  location: {
    type: 'Point';
    coordinates: [number, number];  // [longitude, latitude]
    address: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    landmark?: string;
  };
  isRemote: boolean;
  allowsRemote: boolean;
  serviceRadius?: number;           // km
  
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
  
  // Payment Information
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
    duration?: number;              // hours
    deadline?: Date;
    isFlexible: boolean;
    preferredTime?: string;
  };
  
  // Status Management
  status: 'draft' | 'posted' | 'active' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  posterId: ObjectId;               // Reference to User
  assignedTo?: ObjectId;            // Reference to User
  
  // Applications
  applications: Array<{
    _id: ObjectId;
    applicantId: ObjectId;          // Reference to User
    appliedAt: Date;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    proposedRate?: number;
    message?: string;
    portfolioLinks?: string[];
    estimatedDuration?: number;
    availability?: Date;
  }>;
  
  // Metadata
  views: number;
  applicationsCount: number;
  postedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Chat Model (`Chat.ts`)
```typescript
interface IChat {
  _id: ObjectId;
  participants: ObjectId[];        // Array of User IDs
  gig?: ObjectId;                  // Optional reference to Gig
  aiEnabled: boolean;              // Default: true
  createdAt: Date;
  updatedAt: Date;
}
```

### Message Model (`Message.ts`)
```typescript
interface IMessage {
  _id: ObjectId;
  chat: ObjectId;                  // Reference to Chat
  sender: ObjectId;                // Reference to User
  senderType: 'user' | 'ai';
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 4. Frontend Component Structure

### Main App Structure
```
App.tsx
├── AuthProvider (Context)
├── Router
│   ├── Landing Pages
│   │   ├── LandingPage
│   │   ├── AuthSelectionPage
│   │   ├── LoginForm
│   │   └── SignupForm
│   ├── Authenticated Routes
│   │   ├── AuthenticatedLayout
│   │   │   ├── Header with Search
│   │   │   ├── Navigation
│   │   │   └── Main Content
│   │   ├── MapView (Main gig discovery)
│   │   ├── Dashboard
│   │   ├── MyGigs
│   │   ├── Applications
│   │   └── Profile
│   └── Admin Routes
│       └── AdminLayout
```

### Component Categories

#### Authentication (`/components/Auth/`)
- `AuthContext.tsx` - Authentication state management
- `LoginForm.tsx` - User login form
- `SignupForm.tsx` - User registration form
- `AuthSelectionPage.tsx` - Login/signup selection

#### Gig Management (`/components/Gig/`)
- `CreateGigForm.tsx` - Gig creation form
- `GigDetailsModal.tsx` - Gig detail display
- `GigLocationPicker.tsx` - Location selection component

#### Dashboard (`/components/Dashboard/`)
- `Dashboard.tsx` - Main dashboard
- `MyGigs.tsx` - User's posted gigs
- `Applications.tsx` - User's applications

#### Admin Panel (`/components/Admin/`)
- Admin management components

#### Map System (`/components/Map/`)
- `MapView.tsx` - Google Maps integration

## 5. State Management (Zustand Stores)

### Gig Store (`gigStore.ts`)
```typescript
interface GigState {
  // Data
  gigs: Gig[];
  selectedGig: Gig | null;
  userPostedGigs: Gig[];
  userApplications: any[];
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: GetGigsParams;
  searchQuery: string;
  userLocation: { lat: number; lng: number } | null;
  pagination: PaginationInfo;
  
  // Actions
  fetchGigs: (params?) => Promise<void>;
  createGig: (data) => Promise<Gig>;
  applyToGig: (gigId, data) => Promise<void>;
  // ... more actions
}
```

### Chat Store (`chatStore.ts`)
- Chat session management
- Message handling
- AI integration

### Dashboard Store (`dashboardStore.ts`)
- Dashboard statistics
- User activity tracking

## 6. Data Flow and Architecture

### Authentication Flow
```
1. User Registration/Login → AuthService
2. JWT Token stored → localStorage
3. Token attached to API requests → axios interceptor
4. User data stored → AuthContext
5. Protected routes check → useAuth hook
```

### Gig Creation Flow
```
1. User fills CreateGigForm
2. Location picked → GigLocationPicker
3. Data validated → form validation
4. Submitted → GigService.createGig()
5. API call → POST /api/gigs
6. Stored in DB → Gig model
7. State updated → gigStore
```

### Gig Discovery Flow
```
1. User opens MapView
2. Location detected → geolocation API
3. Gigs fetched → GigService.getGigs()
4. Filters applied → query parameters
5. Results displayed → Map markers + List
6. User selects gig → GigDetailsModal
```

### Application Flow
```
1. User applies → GigService.applyToGig()
2. Application stored → Gig.applications array
3. Poster notified → potential notification system
4. Poster reviews → Admin panel
5. Accept/Reject → Update application status
6. Chat initiated → Chat system
```

### Chat System Flow
```
1. Chat started → POST /api/chat
2. Real-time messages → Socket.io
3. AI assistance → Cohere API integration
4. Message persistence → Message model
```

## 7. Key Configuration Files

### Backend Configuration
- `backend/src/server.ts` - Main server setup
- `backend/src/config/database.js` - MongoDB connection
- `backend/src/config/env.js` - Environment variables
- `backend/package.json` - Dependencies and scripts

### Frontend Configuration
- `frontend/vite.config.ts` - Vite build configuration
- `frontend/tailwind.config.js` - Tailwind CSS setup
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/package.json` - Dependencies and scripts

### Shared Types
- `shared/types/user.ts` - User interfaces
- `shared/types/gig.ts` - Gig interfaces
- `shared/types/index.ts` - Type exports

## 8. Technology Stack

**Backend:**
- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose
- Socket.io (real-time)
- JWT authentication
- Cohere AI integration

**Frontend:**
- React.js + TypeScript
- Vite (build tool)
- Tailwind CSS
- Zustand (state management)
- React Router v6
- Axios (HTTP client)
- Google Maps integration

## 9. Current API Query Parameters

### Gig Search Parameters (`GET /api/gigs`)
```typescript
interface GetGigsParams {
  page?: number;              // Pagination page number
  limit?: number;             // Results per page
  category?: string;          // Service category filter
  skills?: string | string[]; // Required skills filter
  minRate?: number;           // Minimum payment rate
  maxRate?: number;           // Maximum payment rate
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  paymentType?: 'hourly' | 'fixed' | 'daily' | 'weekly';
  search?: string;            // Text search query
  lat?: number;               // Latitude for location-based search
  lng?: number;               // Longitude for location-based search
  radius?: number;            // Search radius in kilometers
}
```

## 10. Current Service Categories

Based on the gig model, the available categories are:
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

## 11. Current Search Implementation

The current search functionality is basic:
- **Text Search**: Simple keyword matching in gig titles and descriptions
- **Location Search**: Geographic search using coordinates and radius
- **Category Filtering**: Filter by service categories
- **Payment Filtering**: Filter by rate ranges and payment types
- **Skill Filtering**: Filter by required skills

## Summary

This QuickLister codebase is well-structured with:
- **Clean Architecture**: Separation of concerns with dedicated layers
- **Type Safety**: Comprehensive TypeScript usage throughout
- **Modern Stack**: React + Node.js with current best practices
- **Real-time Features**: Socket.io integration for chat
- **Geospatial Capabilities**: Location-based gig discovery
- **AI Integration**: Cohere AI for chat assistance
- **Admin Panel**: Complete administrative functionality

The system is ready for enhancement with advanced search capabilities, having a solid foundation for implementing features like:
- Advanced text search with fuzzy matching
- Elasticsearch integration
- AI-powered job matching
- Advanced filtering and sorting options
- Search analytics and recommendations 