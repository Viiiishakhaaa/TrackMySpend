TrackMySpend – The Wisdom of Athena

A Full-Stack Personal Finance Management Application

TrackMySpend is a personal finance management application designed to help users track their income and expenses, organize transactions, and gain better visibility into their financial activities.

The goal is to make personal financial management simpler through an intuitive interface, structured financial data, and intelligent insights.

---

🚀 Features

1. User Authentication

- User registration and login
- Protected application routes
- Token-based authentication

2. Dashboard

- Centralized financial overview
- Financial activity visualization foundation

3. Transaction Management

- Add income and expense transactions
- Edit existing transactions
- Delete transactions
- Assign transactions to categories
- Search transactions
- Filter by transaction type
- Filter transactions using date ranges

4. Category Management

- Create custom categories
- Edit category details
- Delete categories
- Organize income and expenses separately

---

🛠️ Tech Stack

Layer| Technologies
Frontend| React.js, Vite
Styling| CSS
Backend| Node.js, Express.js
Database| PostgreSQL
ORM| Prisma
Authentication| JWT
API Communication| Axios
Version Control| Git and GitHub

---

📁 Project Structure

TrackMySpend/
│
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── context/
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Categories.jsx
│       │   └── Transactions.jsx
│       ├── services/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── server.js
│   └── package.json
│
└── README.md

---

⚙️ Getting Started

Prerequisites

Make sure you have installed:

- Node.js
- npm
- PostgreSQL
- Git

1. Clone the repository

git clone https://github.com/Viiiishakhaaa/TrackMySpend.git
cd TrackMySpend

2. Setup the Backend

cd server
npm install

Configure your backend environment variables in a ".env" file. Use the database connection and authentication settings required by the application.

Set up your PostgreSQL database and configure Prisma according to the project's Prisma configuration.

Run the backend using the development script defined in "server/package.json".

3. Setup the Frontend

Open another terminal:

cd TrackMySpend/client
npm install
npm run dev

Open the local URL displayed by Vite in your browser.

---

🔮 Future Enhancements

The project is being developed incrementally, with plans to introduce:

- Transaction pagination
- Monthly budgeting and spending limits
- Savings goals and progress tracking
- Recurring transactions
- CSV import and export
- Advanced financial analytics and reports
- Spending trends and comparisons
- Athena AI – intelligent financial insights
- Personalized spending recommendations
- Financial anomaly detection
- Deployment and production-level optimization

---

🎯 Project Objective

TrackMySpend aims to go beyond basic expense tracking by evolving into an intelligent personal finance platform.

Through a combination of full-stack development, database management, financial analytics, and AI-driven insights, the project explores how technology can help individuals make more informed financial decisions.

---

👩‍💻 Author

Vishakha

GitHub: "@Viiiishakhaaa" (https://github.com/Viiiishakhaaa)

---

📌 Project Status

Currently under active development.

New features and improvements are being added progressively.

---

Track your money. Understand your habits. Make smarter financial decisions.