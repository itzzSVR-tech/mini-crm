# 📊 Mini CRM (MERN Stack)

A simple **Customer Relationship Management (CRM)** system built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js).  
It allows users to register/login, manage customers, track leads/opportunities, and view a reporting dashboard.  

---

## 🚀 Features
- 🔐 **User Authentication** (JWT-based login & registration)
- 👥 **Customer Management** (create, update, delete, view customers)
- 📈 **Leads/Opportunities** (track leads linked to customers)
- 📊 **Dashboard Reporting** (summary of customers, leads, opportunities)
- 🌱 **Seed Script** to preload MongoDB Atlas with sample users, customers & leads

---

## 🛠️ Tech Stack

### **Frontend**
- React.js (with Vite)
- Axios (for API calls)
- TailwindCSS (styling)

### **Backend**
- Node.js & Express.js
- Mongoose (MongoDB ODM)
- JWT Authentication
- bcrypt.js (password hashing)

### **Database**
- MongoDB Atlas (Cloud-hosted MongoDB)

---

## 🎁 Bonus Features Implemented
-- 🌱 Database Seeder: quickly loads sample data into MongoDB Atlas for testing.
-- 🔒 JWT Authentication: secure API endpoints.
-- 📊 Dashboard API: aggregate stats for quick insights.
-- 🎨 TailwindCSS UI: clean and responsive design.
-- 🚀 Vite-powered Frontend: fast dev server & build optimization.

---

## ⚙️ Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/mini-crm.git
cd mini-crm
```

### 2. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure Environment Variables

Create a .env file inside backend/ with:
```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/mini_crm
JWT_SECRET=your_jwt_secret
```

Create a .env file inside frontend/ with:
```env
VITE_API_URL=http://localhost:5001/api
```

### 4. Run the Application
```bash
# Start backend
cd backend
npm run dev

# Start frontend
cd ../frontend
npm run dev
```

App will be running at:

Frontend → `http://localhost:5173/`

Backend → `http://localhost:5001/`

### 5. Seed Database (Optional)

Run the seed script to preload sample users, customers, and leads:
```bash
cd backend
npm run seed
```

---
