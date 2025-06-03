# Create Sample Gigs for Testing

Use these curl commands to create various types of gigs for testing the QuickLister platform.

## Prerequisites
1. Backend server running on http://localhost:5000
2. Frontend server running on http://localhost:5173
3. Valid JWT token from registration/login

## Step 1: Register and Get Token
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"9876543210","password":"password123"}'
```

Copy the `accessToken` from the response and use it in the commands below.

## Step 2: Create Sample Gigs

### Gig 1: Web Development (Tech Services)
```bash
curl -X POST http://localhost:5000/api/gigs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Build Responsive E-commerce Website",
    "description": "Looking for an experienced web developer to create a modern, responsive e-commerce website. Must include shopping cart, payment integration, and admin panel.",
    "category": "tech_services",
    "urgency": "medium",
    "location": {
      "type": "Point",
      "coordinates": [77.209, 28.6139],
      "address": "Connaught Place, New Delhi, India",
      "city": "New Delhi",
      "state": "Delhi"
    },
    "skills": [{
      "name": "React",
      "category": "programming", 
      "proficiency": "advanced", 
      "isRequired": true
    }, {
      "name": "Node.js",
      "category": "programming", 
      "proficiency": "intermediate", 
      "isRequired": true
    }],
    "payment": {
      "rate": 2000, 
      "currency": "INR", 
      "paymentType": "hourly", 
      "paymentMethod": "bank_transfer"
    },
    "timeline": {
      "duration": 80,
      "isFlexible": true,
      "preferredTime": "anytime"
    },
    "experienceLevel": "experienced",
    "allowsRemote": true,
    "status": "posted"
  }'
```

### Gig 2: House Cleaning (Home Services)
```bash
curl -X POST http://localhost:5000/api/gigs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Deep House Cleaning Service",
    "description": "Need professional deep cleaning for a 3BHK apartment. Includes kitchen, bathrooms, living areas, and balconies. All cleaning supplies will be provided.",
    "category": "cleaning",
    "urgency": "high",
    "location": {
      "type": "Point",
      "coordinates": [77.225, 28.625],
      "address": "Lajpat Nagar, New Delhi, India",
      "city": "New Delhi",
      "state": "Delhi"
    },
    "skills": [{
      "name": "House Cleaning",
      "category": "cleaning", 
      "proficiency": "intermediate", 
      "isRequired": true
    }],
    "payment": {
      "rate": 2500, 
      "currency": "INR", 
      "paymentType": "fixed", 
      "totalBudget": 2500,
      "paymentMethod": "cash"
    },
    "timeline": {
      "duration": 6,
      "isFlexible": false,
      "preferredTime": "morning",
      "deadline": "2025-01-08T10:00:00.000Z"
    },
    "experienceLevel": "intermediate",
    "materialsProvided": true,
    "status": "posted"
  }'
```

### Gig 3: Plumbing Repair (Repair & Maintenance)
```bash
curl -X POST http://localhost:5000/api/gigs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Fix Kitchen Sink and Bathroom Pipes",
    "description": "Kitchen sink is leaking and bathroom pipes need repair. Experienced plumber needed ASAP. Emergency repair required.",
    "category": "plumbing",
    "urgency": "urgent",
    "location": {
      "type": "Point",
      "coordinates": [77.19, 28.65],
      "address": "Karol Bagh, New Delhi, India",
      "city": "New Delhi",
      "state": "Delhi"
    },
    "skills": [{
      "name": "Plumbing",
      "category": "repair", 
      "proficiency": "expert", 
      "isRequired": true
    }],
    "payment": {
      "rate": 800, 
      "currency": "INR", 
      "paymentType": "hourly", 
      "paymentMethod": "upi"
    },
    "timeline": {
      "duration": 3,
      "isFlexible": false,
      "preferredTime": "anytime",
      "deadline": "2025-01-07T18:00:00.000Z"
    },
    "experienceLevel": "experienced",
    "toolsRequired": ["Pipe wrench", "Plumbing tape"],
    "status": "posted"
  }'
```

### Gig 4: Photography (Event Services)
```bash
curl -X POST http://localhost:5000/api/gigs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Wedding Photography & Videography",
    "description": "Looking for professional photographer for wedding ceremony. Need both photography and videography services. Event duration 8 hours with edited photos and video delivery.",
    "category": "photography",
    "urgency": "low",
    "location": {
      "type": "Point",
      "coordinates": [77.23, 28.61],
      "address": "India Gate, New Delhi, India",
      "city": "New Delhi",
      "state": "Delhi"
    },
    "skills": [{
      "name": "Wedding Photography",
      "category": "photography", 
      "proficiency": "expert", 
      "isRequired": true
    }, {
      "name": "Video Editing",
      "category": "media", 
      "proficiency": "advanced", 
      "isRequired": false
    }],
    "payment": {
      "rate": 15000, 
      "currency": "INR", 
      "paymentType": "fixed", 
      "totalBudget": 15000,
      "advancePayment": 5000,
      "paymentMethod": "bank_transfer"
    },
    "timeline": {
      "duration": 8,
      "startDate": "2025-01-15T10:00:00.000Z",
      "endDate": "2025-01-15T18:00:00.000Z",
      "isFlexible": false,
      "preferredTime": "morning"
    },
    "experienceLevel": "expert",
    "status": "posted"
  }'
```

### Gig 5: Tutoring (Education)
```bash
curl -X POST http://localhost:5000/api/gigs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Math Tutor for Class 10 Student",
    "description": "Need experienced math tutor for Class 10 CBSE student. Focus on algebra, geometry, and trigonometry. Flexible timing preferred.",
    "category": "tutoring",
    "urgency": "medium",
    "location": {
      "type": "Point",
      "coordinates": [77.24, 28.57],
      "address": "Greater Kailash, New Delhi, India",
      "city": "New Delhi",
      "state": "Delhi"
    },
    "skills": [{
      "name": "Mathematics",
      "category": "education", 
      "proficiency": "expert", 
      "isRequired": true
    }, {
      "name": "CBSE Curriculum",
      "category": "education", 
      "proficiency": "advanced", 
      "isRequired": true
    }],
    "payment": {
      "rate": 800, 
      "currency": "INR", 
      "paymentType": "hourly", 
      "paymentMethod": "cash"
    },
    "timeline": {
      "duration": 2,
      "isFlexible": true,
      "preferredTime": "evening"
    },
    "experienceLevel": "experienced",
    "allowsRemote": true,
    "isRecurring": true,
    "recurringPattern": "weekly",
    "status": "posted"
  }'
```

## Step 3: Verify Gigs Created

### Check via API:
```bash
curl -X GET http://localhost:5000/api/gigs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Check in Frontend:
1. Go to http://localhost:5173
2. Login with your test account
3. You should see 5 gig markers on the map
4. Click on markers to see gig details
5. Test search by typing "web", "cleaning", etc.
6. Test filters if available

## Expected Results

After creating these gigs, you should see:
- **5 gig markers** on the map at different locations in Delhi
- **"5 gigs found"** counter in bottom-left of map
- **Different colored markers** for different urgency levels
- **Clickable markers** showing gig titles
- **Working search** - try searching for "web", "cleaning", "plumbing"
- **Location-based results** when you change your location

## Valid Categories for More Gigs

If you want to create more test gigs, use these valid categories:
- `home_services`, `repair_maintenance`, `cleaning`, `gardening`
- `tech_services`, `tutoring`, `photography`, `event_services`
- `delivery`, `personal_care`, `pet_services`, `automotive`
- `construction`, `electrical`, `plumbing`, `painting`
- `moving`, `handyman`, `security`, `other`

## Troubleshooting

### If gigs don't appear on map:
1. Check browser console for errors
2. Verify API calls in Network tab
3. Ensure coordinates are valid [longitude, latitude]
4. Check if gig status is "posted"

### If authentication fails:
1. Use a fresh token (tokens expire in 15 minutes)
2. Ensure backend server is running
3. Check token format in Authorization header

### Common Validation Errors:
- **Category**: Must be from the valid enum list
- **Coordinates**: Must be [longitude, latitude] format
- **Description**: Minimum 20 characters required
- **Payment rate**: Must be a positive number
- **Timeline**: startDate must be before endDate
