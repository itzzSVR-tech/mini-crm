# MERN Mini CRM — Complete Starter

This canvas contains a full starter implementation for a Mini CRM using the MERN stack (MongoDB, Express, React, Node). It includes authentication (JWT), customer + lead models and routes, protected APIs, and a React frontend with pages for register/login, customers, leads and a dashboard.

---

## Quick overview

- Backend: Node.js, Express, MongoDB (Mongoose), bcrypt, jsonwebtoken
- Frontend: React (Create React App), axios, react-router-dom
- Auth: JWT stored in localStorage (simple approach for a starter)

---

## Project structure (suggested)

```
mini-crm/
├─ backend/
│  ├─ package.json
│  ├─ server.js
│  ├─ .env
│  ├─ config/
│  │  └─ db.js
│  ├─ models/
│  │  ├─ User.js
│  │  ├─ Customer.js
│  │  └─ Lead.js
│  ├─ middleware/
│  │  └─ auth.js
│  ├─ routes/
│  │  ├─ auth.js
│  │  ├─ customers.js
│  │  ├─ leads.js
│  │  └─ dashboard.js
│  └─ seed.js (optional sample data)

├─ frontend/
│  ├─ package.json
│  ├─ public/
│  └─ src/
│     ├─ index.js
│     ├─ App.js
│     ├─ api.js
│     ├─ contexts/AuthContext.js
│     ├─ pages/
│     │  ├─ Login.js
│     │  ├─ Register.js
│     │  ├─ Dashboard.js
│     │  ├─ Customers.js
│     │  ├─ CustomerDetail.js
│     │  └─ NotFound.js
│     ├─ components/
│     │  ├─ CustomerForm.js
│     │  ├─ LeadForm.js
│     │  └─ PrivateRoute.js
│     └─ styles.css

```

---

## Backend code

### backend/package.json

```json
{
  "name": "mini-crm-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^7.0.0"
  }
}
```

### backend/.env (example)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/mini_crm
JWT_SECRET=your_jwt_secret_here
```

> Replace `MONGO_URI` with your MongoDB Atlas URI or local Mongo URI.

### backend/config/db.js

```js
const mongoose = require('mongoose');
const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
module.exports = connectDB;
```

### backend/models/User.js

```js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
```

### backend/models/Customer.js

```js
const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  company: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Customer', CustomerSchema);
```

### backend/models/Lead.js

```js
const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  title: { type: String, required: true },
  value: { type: Number, default: 0 },
  status: { type: String, enum: ['open', 'contacted', 'won', 'lost'], default: 'open' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Lead', LeadSchema);
```

### backend/middleware/auth.js

```js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

module.exports = function (req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
```

### backend/routes/auth.js

```js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const dotenv = require('dotenv');
dotenv.config();

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ name, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
```

### backend/routes/customers.js

```js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Customer = require('../models/Customer');

// Create customer
router.post('/', auth, async (req, res) => {
  try {
    const customer = new Customer({ ...req.body, user: req.user.id });
    await customer.save();
    res.json(customer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all customers for user
router.get('/', auth, async (req, res) => {
  try {
    const customers = await Customer.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get single customer
router.get('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, user: req.user.id });
    if (!customer) return res.status(404).json({ msg: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update customer
router.put('/:id', auth, async (req, res) => {
  try {
    let customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!customer) return res.status(404).json({ msg: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete customer
router.delete('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!customer) return res.status(404).json({ msg: 'Customer not found' });
    res.json({ msg: 'Customer removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
```

### backend/routes/leads.js

```js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Lead = require('../models/Lead');

// Create lead
router.post('/', auth, async (req, res) => {
  try {
    const lead = new Lead({ ...req.body, user: req.user.id });
    await lead.save();
    res.json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get leads for user (optionally filter by customer)
router.get('/', auth, async (req, res) => {
  try {
    const filter = { user: req.user.id };
    if (req.query.customer) filter.customer = req.query.customer;
    const leads = await Lead.find(filter).populate('customer').sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update lead
router.put('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!lead) return res.status(404).json({ msg: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete lead
router.delete('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!lead) return res.status(404).json({ msg: 'Lead not found' });
    res.json({ msg: 'Lead removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
```

### backend/routes/dashboard.js

```js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');

// Simple dashboard metrics
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const customersCount = await Customer.countDocuments({ user: userId });
    const leads = await Lead.find({ user: userId });
    const leadsCount = leads.length;
    const totalValue = leads.reduce((s, l) => s + (l.value || 0), 0);
    const statusCounts = leads.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {});

    res.json({ customersCount, leadsCount, totalValue, statusCounts });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
```

### backend/server.js

```js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

connectDB(process.env.MONGO_URI);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/dashboard', require('./routes/dashboard'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
```

---

## Frontend code (React)

### frontend/package.json (key deps)

```json
{
  "name": "mini-crm-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "axios": "^1.3.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.9.0",
    "react-scripts": "5.0.1"
  }
}
```

### frontend/src/api.js

```js
import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
```

### frontend/src/contexts/AuthContext.js

```js
import React, { createContext, useState, useEffect } from 'react';
import API from '../api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      API.get('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    const me = await API.get('/auth/me');
    setUser(me.data);
  };

  const register = async (name, email, password) => {
    const res = await API.post('/auth/register', { name, email, password });
    localStorage.setItem('token', res.data.token);
    const me = await API.get('/auth/me');
    setUser(me.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### frontend/src/index.js

```js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
```

### frontend/src/App.js

```js
import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <header className="topbar">
        <div className="container">
          <Link to="/">MiniCRM</Link>
          <nav>
            {user ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/customers">Customers</Link>
                <button onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
          <Route path="/customers/:id" element={<PrivateRoute><CustomerDetail /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
```

### frontend/src/components/PrivateRoute.js

```js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
```

### frontend/src/pages/Login.js

```js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      nav('/dashboard');
    } catch (e) {
      setErr(e?.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>
      {err && <div className="error">{err}</div>}
      <form onSubmit={onSubmit}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
```

### frontend/src/pages/Register.js

```js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function Register() {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      nav('/dashboard');
    } catch (e) {
      setErr(e?.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="card">
      <h2>Register</h2>
      {err && <div className="error">{err}</div>}
      <form onSubmit={onSubmit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
```

### frontend/src/pages/Dashboard.js

```js
import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get('/dashboard').then((res) => setStats(res.data)).catch(() => {});
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="grid">
        <div className="card">Customers: {stats.customersCount}</div>
        <div className="card">Leads: {stats.leadsCount}</div>
        <div className="card">Total Value: {stats.totalValue}</div>
      </div>
      <div className="card">
        <h3>Lead Statuses</h3>
        <ul>
          {Object.entries(stats.statusCounts || {}).map(([k, v]) => (
            <li key={k}>{k}: {v}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

### frontend/src/pages/Customers.js

```js
import React, { useEffect, useState } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';
import CustomerForm from '../components/CustomerForm';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => API.get('/customers').then((r) => setCustomers(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const onDelete = async (id) => {
    if (!window.confirm('Delete customer?')) return;
    await API.delete(`/customers/${id}`);
    load();
  };

  return (
    <div>
      <h2>Customers</h2>
      <CustomerForm onSaved={load} editing={editing} setEditing={setEditing} />
      <div className="list">
        {customers.map(c => (
          <div className="card" key={c._id}>
            <h4>{c.name}</h4>
            <div>{c.company}</div>
            <div>{c.email} {c.phone}</div>
            <div>
              <Link to={`/customers/${c._id}`}>View</Link>
              <button onClick={() => setEditing(c)}>Edit</button>
              <button onClick={() => onDelete(c._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### frontend/src/components/CustomerForm.js

```js
import React, { useEffect, useState } from 'react';
import API from '../api';

export default function CustomerForm({ onSaved, editing, setEditing }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  useEffect(() => {
    if (editing) {
      setName(editing.name || '');
      setEmail(editing.email || '');
      setPhone(editing.phone || '');
      setCompany(editing.company || '');
    }
  }, [editing]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, email, phone, company };
    if (editing) {
      await API.put(`/customers/${editing._id}`, payload);
      setEditing(null);
    } else {
      await API.post('/customers', payload);
    }
    setName(''); setEmail(''); setPhone(''); setCompany('');
    onSaved();
  };

  return (
    <form onSubmit={onSubmit} className="card form-inline">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
      <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
      <button type="submit">{editing ? 'Update' : 'Add'}</button>
    </form>
  );
}
```

### frontend/src/pages/CustomerDetail.js

```js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';
import LeadForm from '../components/LeadForm';

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [leads, setLeads] = useState([]);

  const load = async () => {
    const res = await API.get(`/customers/${id}`);
    setCustomer(res.data);
    const l = await API.get(`/leads?customer=${id}`);
    setLeads(l.data);
  };

  useEffect(() => { load(); }, [id]);

  const deleteLead = async (leadId) => {
    if (!window.confirm('Delete lead?')) return;
    await API.delete(`/leads/${leadId}`);
    load();
  };

  return (
    <div>
      {!customer ? <div>Loading...</div> : (
        <>
          <h2>{customer.name}</h2>
          <div>{customer.company} {customer.email} {customer.phone}</div>

          <LeadForm customerId={id} onSaved={load} />

          <h3>Leads</h3>
          <div className="list">
            {leads.map(l => (
              <div className="card" key={l._id}>
                <div><strong>{l.title}</strong> — {l.status}</div>
                <div>Value: {l.value}</div>
                <div>{l.notes}</div>
                <div>
                  <button onClick={() => deleteLead(l._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

### frontend/src/components/LeadForm.js

```js
import React, { useState } from 'react';
import API from '../api';

export default function LeadForm({ customerId, onSaved }) {
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('open');
  const [notes, setNotes] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    await API.post('/leads', { title, value: Number(value || 0), status, notes, customer: customerId });
    setTitle(''); setValue(''); setStatus('open'); setNotes('');
    if (onSaved) onSaved();
  };

  return (
    <form onSubmit={onSubmit} className="card form-inline">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lead title" required />
      <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="open">open</option>
        <option value="contacted">contacted</option>
        <option value="won">won</option>
        <option value="lost">lost</option>
      </select>
      <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" />
      <button type="submit">Add Lead</button>
    </form>
  );
}
```

### frontend/src/pages/NotFound.js

```js
import React from 'react';
export default function NotFound() { return <div>Page not found</div>; }
```

### frontend/src/styles.css

```css
body { font-family: Arial, sans-serif; margin:0; }
.container { max-width: 1000px; margin: 20px auto; padding: 0 16px; }
.topbar { background:#111; color:#fff; padding:12px 0; }
.topbar .container { display:flex; justify-content:space-between; align-items:center; }
.topbar a { color:#fff; margin-right:12px; text-decoration:none; }
.card { background:#fff; padding:12px; border:1px solid #eee; margin-bottom:12px; }
.grid { display:flex; gap:12px; }
.list .card { display:flex; justify-content:space-between; align-items:center; }
.form-inline input, .form-inline select { margin-right:8px; padding:6px; }
button { padding:6px 10px; }
.error { color: red; margin-bottom: 8px; }
```

---

## How to run (development)

1. Start MongoDB (local or Atlas)
2. Backend:
   - `cd backend`
   - `npm install`
   - create `.env` with `MONGO_URI`, `JWT_SECRET`, `PORT`
   - `npm run dev`
3. Frontend:
   - `cd frontend`
   - `npm install`
   - set `REACT_APP_API_URL` in `.env` if backend not at `http://localhost:5000`
   - `npm start`

Open `http://localhost:3000` for the frontend.

---

## Next steps & improvements

- Add server-side validation (express-validator)
- Use refresh tokens and httpOnly cookies for more secure auth
- Add pagination & search for customers
- Add file uploads / avatars for customers
- Improve UI with Tailwind or Material UI
- Add role-based access control, activity logs and email notifications
- Deploy backend to Heroku / Render and frontend to Vercel or Netlify

---

If you'd like, I can: 
- generate the project as a downloadable zip,
- scaffold the repo file-by-file and provide git commands,
- or convert the frontend to Next.js + Tailwind.

Tell me which one you'd like next.
