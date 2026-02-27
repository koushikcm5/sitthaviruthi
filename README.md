# Sitthaviruthi Yoga Application

Welcome to the Sitthaviruthi Yoga project! This is a full-stack application designed to manage yoga sessions, attendance, workshops, and user progress. It consists of a Spring Boot backend and a React Native Expo frontend.

## 🚀 Technology Stack

### Backend
- **Framework:** Spring Boot 3.2.0
- **Language:** Java 17
- **Database:** MySQL 8.0
- **Caching:** Redis
- **Authentication:** JWT (JSON Web Tokens)
- **Push Notifications:** Firebase Admin SDK
- **API Documentation:** OpenAPI / Swagger UI
- **Build Tool:** Maven

### Frontend
- **Framework:** React Native (0.81.5)
- **Platform:** Expo (SDK 54)
- **Navigation:** React Navigation
- **Media:** Expo Video, Expo AV
- **UI:** Custom components with vanilla styles

## 📂 Project Structure

```
sittha-main/
├── backend/            # Spring Boot Backend code
├── frontend/           # React Native Expo Frontend code
├── database/           # Database scripts and migrations
├── docs/               # Project documentation and guides
├── scripts/            # Utility scripts
└── README.md           # This file
```

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- **Java Development Kit (JDK) 17**
- **Maven** (for building the backend)
- **Node.js** and **npm** (for the frontend)
- **MySQL Server** (running locally or remotely)
- **Redis Server** (optional, but recommended for caching)

## 🏃‍♂️ Getting Started

### 1. Backend Setup
Navigate to the `backend` directory and run the application using Maven.

```bash
cd backend
# Configure your application.properties or .env file with your database credentials
mvn spring-boot:run
```
The backend server usually starts at `http://localhost:8080`.
API Documentation should be available at `http://localhost:8080/swagger-ui.html` (or similar).

### 2. Frontend Setup
Navigate to the `frontend` directory, install dependencies, and start the Expo development server.

```bash
cd frontend
npm install
npm start
# OR
npx expo start
```
- Press `a` to run on an Android Emulator.
- Press `i` to run on an iOS Simulator.
- Press `w` to run on the Web.
- Scan the QR code with the **Expo Go** app on your physical device.

## 📚 Documentation

For more detailed guides, check the `docs/` directory:
- [File Upload Guide](docs/FILE_UPLOAD_GUIDE.md)
- [Technical and Deployment](docs/TECHNICAL_AND_DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
