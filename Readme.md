# 🌍 Travel Planner - Smart Trip Management Platform

> **Odoo Hackathon 2025 Submission**  
> A comprehensive travel planning and management platform that transforms how users organize, plan, and experience their journeys.

## 🚀 Project Overview

Travel Planner is a full-stack web application designed to simplify and enhance the travel planning experience. From initial inspiration to detailed itinerary management, our platform provides travelers with all the tools they need to create memorable journeys.

### ✨ Key Features

- **🔐 User Authentication & Profiles** - Secure registration/login with customizable profiles and role-based access
- **🗺️ Smart Trip Planning** - Create trips with dates, destinations, group size, and descriptions
- **📅 Interactive Calendar** - Visual calendar view of all planned trips with conflict detection
- **🎯 Advanced Search & Filtering** - Find trips by location, dates, group size, and status
- **📋 Detailed Itinerary Management** - Day-by-day planning with activities, budgets, and logistics
- **🌟 Curated Destinations** - Admin-managed suggested places with rich media content
- **👥 Community Features** - Share travel experiences and inspire other travelers
- **📊 Admin Dashboard** - Comprehensive analytics and user management for administrators
- **📱 Responsive Design** - Seamless experience across desktop, tablet, and mobile devices

## 🛠️ Technical Stack

### Frontend

- **React 18** - Modern component-based UI framework
- **React Router DOM** - Client-side routing for single-page application
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Vite** - Fast build tool and development server

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Minimal and flexible web application framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - ODM library for MongoDB and Node.js

## 🏗️ Project Structure

```
Travel-Planner/
├── Backend/
│   ├── Controllers/          # Business logic and request handlers
│   ├── Db/                  # Database models and schemas
│   ├── Routes/              # API route definitions
│   ├── Middleware/          # Custom middleware functions
│   └── Index.js             # Server entry point
├── Frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   └── assets/         # Static assets (images, icons)
│   ├── public/             # Public static files
│   └── package.json        # Frontend dependencies
├── Api Documentation.txt    # Complete API documentation
└── README.md               # Project documentation
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Travel-Planner
   ```

2. **Backend Setup**

   ```bash
   cd Backend
   npm install
   npm start
   ```

   Server will start on `http://localhost:3000`

3. **Frontend Setup**

   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

   Application will be available on `http://localhost:5173`

4. **Database Configuration**
   - Ensure MongoDB is running locally or configure connection string
   - Database will be created automatically on first run

## 📖 API Documentation

Our RESTful API provides comprehensive endpoints for all application features:

- **Authentication**: User registration, login, and session management
- **Trip Management**: CRUD operations with advanced filtering and search
- **Itinerary Planning**: Detailed day-by-day activity and budget management
- **User Profiles**: Profile management with upcoming/past trip categorization
- **Community Features**: Social sharing of travel experiences
- **Admin Dashboard**: Analytics, user management, and content curation

📄 **Complete API documentation available in `Api Documentation.txt`**

## 🎯 Core Functionalities

### For Travelers

- **Trip Creation**: Set destinations, dates, group size, and descriptions
- **Itinerary Builder**: Plan daily activities with budget tracking
- **Calendar Overview**: Visual representation of all planned trips
- **Search & Discovery**: Find trips by various criteria with smart filtering
- **Profile Management**: Update personal information and view trip history
- **Community Engagement**: Share experiences and get inspired by others

### For Administrators

- **User Management**: Monitor and manage registered users
- **Content Curation**: Add suggested destinations with rich media
- **Analytics Dashboard**: View platform usage and popular destinations
- **System Oversight**: Monitor platform health and user activity

## 🔒 Security Features

- Role-based access control (User/Admin)
- Input validation and sanitization
- Secure password handling
- Protected admin routes and functionalities
- Profile picture upload with file validation

## 🎨 User Experience

- **Intuitive Navigation**: Clean, modern interface with logical flow
- **Visual Feedback**: Loading states, hover effects, and status indicators
- **Responsive Design**: Optimized for all device sizes
- **Professional Aesthetics**: Purple-themed design with clean typography
- **Error Handling**: Graceful error messages and fallback states

## 📈 Scalability & Performance

- **Modular Architecture**: Separation of concerns with reusable components
- **Database Optimization**: Efficient queries with proper indexing
- **Fast Build Process**: Vite for rapid development and optimized production builds
- **Component-Based Design**: Maintainable and scalable React architecture

## 🌟 Innovation Highlights

1. **Smart Trip Categorization**: Automatic classification of trips as upcoming, ongoing, or completed
2. **Advanced Filtering System**: Multi-criteria search with real-time updates
3. **Interactive Calendar Integration**: Visual trip planning with conflict detection
4. **Community-Driven Content**: Social features to inspire and connect travelers
5. **Admin Analytics**: Data-driven insights for platform optimization
6. **File Upload Integration**: Direct image uploads with base64 conversion

## 🤝 Contributing

This project was developed for the Odoo Hackathon 2025. The codebase follows best practices for maintainability and scalability, making it ready for future enhancements and community contributions.

## 🏆 Hackathon Submission

**Team**: Vision X
**Event**: Odoo Hackathon 2025  



