# ByteLearn Study Tracker

A comprehensive study tracking web application designed specifically for Sri Lankan O/L students to monitor and optimize their study habits.

## Overview

ByteLearn helps students track their study sessions, set goals, visualize progress, and stay motivated through gamification features. The application supports all Sri Lankan O/L curriculum subjects and provides personalized insights to improve study efficiency.

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **State Management**: Redux
- **UI Framework**: Tailwind CSS
- **Charts**: Chart.js
- **Authentication**: JWT
- **Offline Support**: LocalStorage/IndexedDB

## Features

- User authentication and profile management
- Subject management with color-coding
- Customizable dashboard with drag-and-drop widgets
- Study timer and session tracking
- Progress visualization and analytics
- Gamification (streaks, badges, credit ratings)
- Social features (friends, leaderboards)
- Privacy controls

## Setup Instructions

### Prerequisites

- Node.js (v18.x or higher)
- npm (v8.x or higher)
- MongoDB (v6.x or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/bytelearn-study-tracker.git
   cd bytelearn-study-tracker
   ```

2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. Environment setup:
   - Create a `.env` file in the server directory based on `.env.example`
   - Configure your MongoDB connection string and JWT secret

4. Start development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev
   
   # In another terminal, start frontend
   cd client
   npm start
   ```

5. Access the application at `http://localhost:3000`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or feedback, please reach out to [contact@bytelearn.com](mailto:contact@bytelearn.com).