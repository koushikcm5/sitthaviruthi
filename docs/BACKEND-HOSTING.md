# Backend Hosting Guide

## Option 1: AWS EC2
1. Launch Ubuntu EC2 instance
2. Install Java 17: `sudo apt install openjdk-17-jdk`
3. Install MySQL: `sudo apt install mysql-server`
4. Upload JAR: `scp backend/target/attendance-1.0.0.jar user@server:/app/`
5. Run: `java -jar /app/attendance-1.0.0.jar`

## Option 2: Docker
1. Build: `docker build -t yoga-backend backend/`
2. Run: `docker run -p 8080:8080 yoga-backend`

## Option 3: Heroku
1. Install Heroku CLI
2. `heroku create yoga-backend`
3. `git push heroku main`

## Database Setup
1. Run `database/database-setup.sql` on production DB
2. Run `database/create-admin.sql`
3. Update `application-prod.properties` with DB credentials

## Environment Variables
- SPRING_DATASOURCE_URL
- SPRING_DATASOURCE_USERNAME
- SPRING_DATASOURCE_PASSWORD
- JWT_SECRET
- SPRING_MAIL_USERNAME
- SPRING_MAIL_PASSWORD

## Security Checklist
- [ ] Change default admin password
- [ ] Use strong JWT secret (256+ bits)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for frontend domain
- [ ] Set up database backups
- [ ] Enable firewall (port 8080, 3306)
