# BPC - Badou & Balde Performance Coach

## 🛠 Setup

### Prerequisites

- **Node.js** v22.12.0
- **MySQL Database**
- **NPM installed**

### Installation

#### 1️⃣ Clone the repository:
```sh
git clone https://github.com/your-repo/BPC.git
```

#### 2️⃣ Navigate to the project folder:
```sh
cd BPC
```

#### 3️⃣ Install dependencies:
```sh
npm install
```

#### 4️⃣ Setup environment variables in `.env` file.

#### 5️⃣ Inside the `config` folder create a `config.json` file with the following content:
```json
{
    "development": {
      "username": "root",
      "password": "null", 
      "database": "database_development", 
      "host": "127.0.0.1", 
      "dialect": "mysql"
    },
    "test": {
      "username": "root",
      "password": null,
      "database": "database_test",
      "host": "127.0.0.1",
      "dialect": "mysql"
    },
    "production": {
      "username": "root",
      "password": null,
      "database": "database_production",
      "host": "127.0.0.1",
      "dialect": "mysql"
    }
}
```

#### 6️⃣ Start the server:
```sh
npm start
```

---

## 📌 Overview

**BPC (Badou & Balde Performance Coach)** is a fitness and sports coaching platform designed for:
- **Fitness Enthusiasts**
- **Footballers**
- **Dual-Focus Athletes** (Both Fitness Enthusiast & Footballer)
- **Coaches**

This platform provides personalized workouts, fitness goal tracking, and seamless communication between users and coaches.

---

## 🚀 Technologies Used

- **Backend:** Node.js with Express.js
- **Database:** MySQL (Sequelize ORM)
- **Authentication:** JWT
- **Notifications:** Firebase Cloud Messaging (FCM)
- **Chat System:** Socket.io

---

## 👥 User Types

1. **Fitness Enthusiast**
2. **Footballers**
3. **Dual Focus** (Both Fitness Enthusiast & Footballer)
4. **Coach**

---

## 🔥 Features

### 📌 For Fitness Enthusiast, Footballers, and Dual-Focus Users:

- ✅ **Follow & Message Coaches**
- ✅ **View Daily Workouts**
- ✅ **Track Heart Rate & Calories Burned**
- ✅ **View Meal Plans**
- ✅ **Select Workout Type:**
  - General Fitness Workouts
  - Football-Specific Workouts
  - Workout Logging
- ✅ **Browse Exercises & Descriptions** (Exercise types: Abs, Legs, etc.)
- ✅ **Receive Notifications**
- ✅ **Profile Management:**
  - Edit Profile
  - Change Fitness Goals
  - Change Password
- ✅ **View Legal Information:**
  - Terms & Conditions
  - Privacy Policy
  - About Us
- ✅ **Customer Support:**
  - Submit Name, Email, and Message

### 📌 For Coaches:

- ✅ **Manage Follow Requests** (Accept/Decline)
- ✅ **Manage Workout Sessions:**
  - Accept/Decline Requests
  - Edit & Delete Sessions
  - View Completed & Upcoming Sessions
- ✅ **Chat Features:**
  - Chat with Users
  - Users Can Report or Clear Chats
  - View Message List
- ✅ **Profile Management:**
  - Edit Profile
  - Manage FAQs
  - Delete Account
  - Logout

---

---

## 📜 License

This project is licensed under the **MIT License**.

---

### 👨‍💻 Developed by **CQLSYS TECHNOLOGIES**
