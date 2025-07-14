# 📆 Subscription Tracker API

A backend API for managing and tracking user subscriptions, built with **Node.js**, **Express.js**, and **MongoDB**. The project is inspired by the [Complete Backend Course](https://youtu.be/rOpEN1JDaD0) and further improved using **ChatGPT** for cleaner code and inline documentation.

---

## 🚀 Features

* JWT Authentication (Sign-Up, Sign-In, Sign-Out)
* CRUD operations for Users and Subscriptions
* Cancel & bulk delete subscriptions
* View upcoming subscription renewals
* Clean, modular project structure
* Informative error handling and middleware

---

## 🏗️ Project Structure

```
backend/
│
├── config/
│   ├── arcjet.js
│   ├── env.js
│   ├── nodemailer.js
│   └── upstash.js
│
├── controllers/
│   ├── auth.controllers.js
│   ├── subscription.controller.js
│   ├── user.controller.js
│   └── workflow.controller.js
│
├── database/
│   └── mongodb.js
│
├── middleware/
│   ├── arcjet.middleware.js
│   ├── auth.middleware.js
│   └── error.middleware.js
│
├── models/
│   ├── subscription.model.js
│   └── user.model.js
│
├── routes/
│   ├── auth.routes.js
│   ├── subscription.routes.js
│   ├── user.routes.js
│   └── workflow.routes.js
│
├── utils/
│   ├── email.template.js
│   └── send-email.js
│
├── server.js
└── app.js
```

---

## 🔐 Authentication Routes

### 1. Sign-Up

* **POST** `/api/v1/auth/sign-up/`

```json
{
  "name": "Michael Yahoo",
  "email": "michaelgetuk@yahoo.com",
  "password": "123123123"
}
```

### 2. Sign-In

* **POST** `/api/v1/auth/sign-in/`

```json
{
  "email": "michaelgetuk@yahoo.com",
  "password": "123123123"
}
```

### 3. Sign-Out

* **POST** `/api/v1/auth/sign-out/:id`

---

## 👤 User Routes

### 1. Get All Users

* **GET** `/api/v1/users/`

### 2. Get a User

* **GET** `/api/v1/users/:id`

### 3. Update a User

* **PUT** `/api/v1/users/:id`

```json
{
  "name": "Michael Yahoo",
  "email": "michaelgetuk@yahoo.com"
}
```

### 4. Delete a User

* **DELETE** `/api/v1/users/:id`

---

## 💳 Subscription Routes

### 1. Get All Subscriptions

* **GET** `/api/v1/subscriptions/`

### 2. Get a Subscription

* **GET** `/api/v1/subscriptions/:id`

### 3. Get a User's Subscriptions

* **GET** `/api/v1/subscriptions/user/:id`

### 4. Create a Subscription

* **POST** `/api/v1/subscriptions/`

```json
{
  "name": "Netflix Premium",
  "price": 15.99,
  "currency": "USD",
  "frequency": "monthly",
  "category": "entertainment",
  "startDate": "2025-06-18T00:00:00.0002",
  "payment": "Credit Card"
}
```

### 5. Update a Subscription

* **PUT** `/api/v1/subscriptions/:id`

```json
{
  "name": "Youtube Premium",
  "price": 15.99,
  "currency": "USD",
  "frequency": "monthly",
  "category": "entertainment",
  "startDate": "2025-06-18T00:00:00.0002",
  "payment": "Credit Card"
}
```

### 6. Delete a Subscription

* **DELETE** `/api/v1/subscriptions/:id`

### 7. Delete ALL Subscriptions

* **DELETE** `/api/v1/subscriptions/`

### 8. Cancel a Subscription

* **PUT** `/api/v1/subscriptions/cancel/:id`

### 9. Upcoming User Renewals

* **GET** `/api/v1/subscriptions/upcoming-user-renewals/:id`

---

## 📦 Installation & Setup

### Prerequisites

* Node.js & npm
* MongoDB (local or Atlas)

### Steps

1. Clone the repository:

```bash
git clone https://github.com/your-username/subscription-tracker.git
```

2. Navigate to project:

```bash
cd subscription-tracker/backend
```

3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file:

```env
PORT=5500
MONGODB_URI=mongodb://localhost:27017/subscription_tracker
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

5. Start the server:

```bash
npm run dev
```

6. Start QStash worker (for scheduled tasks):

```bash
npx @upstash/qstash-cli dev
```

---

## 📬 Testing the API

Use Postman or any HTTP client to test the endpoints. Ensure MongoDB is running and environment variables are configured.

---

## 🙏 Acknowledgements

* 📘 [Complete Backend Course](https://youtu.be/rOpEN1JDaD0) by @codeWithMarish
* ✨ Codebase structured and commented with help from ChatGPT

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
