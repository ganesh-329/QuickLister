# QuickLister
limit user created
QuickLister is a modern web application for local micro-jobs, built with React, TypeScript, and Node.js. It helps users find and post local jobs quickly and efficiently.

## 🚀 Features

- Interactive job map with real-time location search
- User authentication and profile management
- Job posting and application system
- Real-time chat and notifications
- Responsive design for all devices
- Built-in AI assistant for smart help

## 🛠 Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Google Maps API
- Socket.io Client

### Backend
- Node.js
- Express
- MongoDB
- Socket.io
- JWT Authentication

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB
- Google Maps API key

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/ganesh-329/QuickLister.git
cd QuickLister
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Environment Setup:

Create `.env` files in both frontend and backend directories:

Frontend (.env):
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_API_URL=http://localhost:5000
```

Backend (.env):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quicklister
JWT_SECRET=your_jwt_secret
```

4. Start the development servers:

```bash
# Start backend server (from backend directory)
npm run dev

# Start frontend server (from frontend directory)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📁 Project Structure

```
QuickLister/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Layout/
│   │   │   ├── Map/
│   │   │   └── UI/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
│
└── README.md
```

## 🔑 API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user

### Jobs
- GET /api/jobs - Get all jobs
- POST /api/jobs - Create new job
- GET /api/jobs/:id - Get job details
- PUT /api/jobs/:id - Update job
- DELETE /api/jobs/:id - Delete job

### Applications
- POST /api/applications - Submit application
- GET /api/applications - Get user applications
- PUT /api/applications/:id - Update application status

## 🧪 Testing

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test
```

## 📦 Production Build

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Ganesh - Initial work - [GitHub](https://github.com/ganesh-329)

## 🙏 Acknowledgments

- Google Maps API for location services
- Tailwind CSS for styling
- React community for amazing tools and libraries

## 📞 Support

For support, email support@quicklister.com or open an issue in the GitHub repository.
