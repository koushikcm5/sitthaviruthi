# Security Configuration Guide

## ✅ Issues Fixed

### 1. Credentials Security
- ✅ Removed hardcoded database password
- ✅ Removed hardcoded email credentials
- ✅ Moved all sensitive data to environment variables
- ✅ Created .env file for local development
- ✅ Updated .gitignore to exclude sensitive files

### 2. CORS Configuration
- ✅ Restricted CORS from `*` to specific origin patterns
- ✅ Added environment variable for allowed origins
- ✅ Enabled credentials support

### 3. Rate Limiting
- ✅ Added rate limiting filter (100 requests/minute per IP)
- ✅ Automatic cleanup of old entries
- ✅ Returns 429 status for rate limit exceeded

### 4. Input Validation
- ✅ Enhanced InputSanitizer with validators
- ✅ Added email validation
- ✅ Added phone validation
- ✅ Added username validation
- ✅ Added filename sanitization

### 5. Configuration Management
- ✅ Created .env.example template
- ✅ Created production properties template
- ✅ Added environment setup script

---

## 🔧 Setup Instructions

### Local Development

1. **Copy environment template:**
   ```bash
   cd backend
   copy .env.example .env
   ```

2. **Edit .env file with your credentials:**
   ```properties
   DB_PASSWORD=your_actual_password
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=your_app_password
   JWT_SECRET=generate_a_secure_64_char_secret
   ```

3. **Start the application:**
   ```bash
   # Option 1: Using the setup script (Windows)
   start-with-env.bat
   
   # Option 2: Using Maven directly
   mvn spring-boot:run
   ```

### Production Deployment

1. **Set environment variables on your server:**
   ```bash
   export DB_URL="jdbc:mysql://your-host:3306/yoga_attendance"
   export DB_USERNAME="your_username"
   export DB_PASSWORD="your_secure_password"
   export JWT_SECRET="your_very_long_secure_secret_key"
   export MAIL_USERNAME="your_email@gmail.com"
   export MAIL_PASSWORD="your_app_password"
   export ALLOWED_ORIGINS="https://yourdomain.com"
   ```

2. **Use production profile:**
   ```bash
   java -jar -Dspring.profiles.active=prod target/attendance-1.0.0.jar
   ```

---

## 🔒 Security Best Practices

### JWT Secret Generation
Generate a secure JWT secret (64+ characters):
```bash
# Linux/Mac
openssl rand -base64 64

# Windows PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Gmail App Password
1. Enable 2-Factor Authentication on your Gmail account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate an app password for "Mail"
4. Use this password in MAIL_PASSWORD

### Database Security
- Use strong passwords (16+ characters)
- Create a dedicated database user (not root)
- Grant only necessary permissions
- Enable SSL for database connections in production

### CORS Configuration
For production, set specific origins:
```bash
export ALLOWED_ORIGINS="https://yourdomain.com,https://app.yourdomain.com"
```

---

## 🛡️ Additional Security Measures

### 1. Enable HTTPS
Update application-prod.properties:
```properties
server.ssl.enabled=true
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=${SSL_KEYSTORE_PASSWORD}
server.ssl.key-store-type=PKCS12
```

### 2. Database Connection Pooling
Already configured in production properties:
- Maximum pool size: 20
- Minimum idle: 5
- Connection timeout: 30s

### 3. File Upload Limits
Configured in production properties:
- Max file size: 10MB
- Max request size: 10MB

### 4. Rate Limiting
Current configuration:
- 100 requests per minute per IP
- Automatic cleanup every 5 minutes
- Returns 429 status when exceeded

---

## 📊 Monitoring

### Health Check Endpoint
```
GET /actuator/health
```

### Application Info
```
GET /actuator/info
```

---

## ⚠️ Important Notes

1. **Never commit .env file** - It's in .gitignore
2. **Rotate JWT secrets** regularly in production
3. **Use different secrets** for dev/staging/prod
4. **Monitor rate limit** logs for potential attacks
5. **Keep dependencies updated** for security patches

---

## 🔍 Security Checklist

- [x] Credentials moved to environment variables
- [x] CORS restricted to specific origins
- [x] Rate limiting implemented
- [x] Input validation enhanced
- [x] SQL injection prevention (JPA)
- [x] XSS protection (input sanitization)
- [x] Password hashing (BCrypt strength 12)
- [x] JWT token authentication
- [x] Refresh token rotation
- [x] Error messages sanitized
- [ ] HTTPS enabled (configure for production)
- [ ] Database SSL enabled (configure for production)
- [ ] Automated security scanning (recommended)
- [ ] Penetration testing (recommended)

---

## 📞 Support

For security concerns or questions:
1. Review this documentation
2. Check application logs
3. Consult Spring Security documentation
4. Contact development team

---

**Last Updated:** December 23, 2025
