# Lions Club Recruitment System

A full-stack, modern recruitment system for university clubs.

## 🚀 Features

- **Multi-Step Form**: 6 steps with real-time validation and progress tracking.
- **Glassmorphism UI**: High-end, modern design with Framer Motion animations.
- **Admin Dashboard**: Secure portal to manage candidates with charts and filters.
- **Dark Mode**: Fully supported across the application.
- **Auto-save**: Form data is automatically saved in localStorage.
- **Export**: Export candidate data to CSV.

## 🛠 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, React Hook Form, Zod, Axios, Lucide React, Recharts.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Nodemailer.

## 🏃 Getting Started

### Prerequisites

- Node.js installed.
- MongoDB running locally (default: `mongodb://localhost:27017/leoclub`).

### Installation

1. Clone the repository.
2. Install Backend dependencies:
   ```bash
   cd server
   npm install
   ```
3. Install Frontend dependencies:
   ```bash
   cd client
   npm install
   ```

### Running Locally

1. Start the Backend server:
   ```bash
   cd server
   node server.js
   ```
2. Start the Frontend development server:
   ```bash
   cd client
   npm run dev
   ```

### Admin Credentials

- **Email**: `admin@leoclub.com`
- **Password**: `admin123`

## 📁 Structure

- `client/`: React application (Vite).
- `server/`: Express API and MongoDB models.
