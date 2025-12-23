# Deployment Guide

## Prerequisites
- Java 17+
- Maven 3.6+
- MySQL 8.0+
- Node.js 16+
- React Native CLI

## Backend Deployment
1. Configure `backend/src/main/resources/application.properties`
2. Build: `mvn clean package`
3. Run: `java -jar target/attendance-1.0.0.jar`

## Frontend Deployment
1. Navigate to `frontend/`
2. Install: `npm install`
3. Build APK: `cd android && ./gradlew assembleRelease`

## Database Setup
Run scripts in order:
1. `database/database-setup.sql`
2. `database/create-admin.sql`

See other docs for detailed instructions.
