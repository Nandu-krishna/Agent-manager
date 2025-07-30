# 🧑‍💼 Agent Manager – MERN Stack Application

A full-stack application built with the MERN (MongoDB, Express.js, React.js, Node.js) stack that allows admin users to log in, manage agents, and upload & distribute CSV data equally among agents.

---

## 🧠 Project Objective

To implement a role-based management system with the following core features:

- Admin user login with authentication
- Agent creation and management
- CSV file upload with validation
- Automatic and equal distribution of list entries among agents
- View distributed data per agent

---

## ✨ Features

### ✅ User Login (Admin)
- Secure login using JWT-based authentication
- Email and password-based validation
- Redirects to dashboard on successful login
- Displays relevant error messages on failure

### 🧾 Agent Management
- Admin can add new agents with:
  - Name
  - Email
  - Mobile number (with country code)
  - Password
- Agent data is securely stored in MongoDB

### 📤 CSV Upload and List Distribution
- Upload files in `.csv`, `.xlsx`, or `.xls` formats
- Validates the uploaded file structure:
  - `FirstName` – Text
  - `Phone` – Number
  - `Notes` – Text
- Distributes data equally among 5 agents
- Handles non-divisible entries gracefully (extra items are assigned sequentially)
- Displays distributed lists for each agent

---

## 🛠️ Tech Stack

| Layer       | Technology       |
|-------------|------------------|
| Frontend    | React.js / Next.js |
| Backend     | Node.js, Express.js |
| Database    | MongoDB (via Mongoose) |
| Auth        | JWT (JSON Web Tokens) |
| File Parsing| `csv-parser`, `xlsx` npm packages |

---

## ⚙️ Getting Started

### 📦 Prerequisites
Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [npm](https://www.npmjs.com/)
- Git

### 🔐 Environment Variables
Create a `.env` file in the root of your backend directory with the following content:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

###👤 Author
Nandu Krishna
GitHub: @Nandu-krishna



