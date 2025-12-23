-- Create Database
CREATE DATABASE IF NOT EXISTS yoga_attendance;
USE yoga_attendance;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    level INT DEFAULT 1,
    months_completed INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved BOOLEAN DEFAULT FALSE
);

-- Videos Table (with part column for Yoga Viruthi Part 1 & 2)
CREATE TABLE IF NOT EXISTS videos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    level INT NOT NULL,
    part INT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE
);

-- User Levels Table
CREATE TABLE IF NOT EXISTS user_levels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    level INT DEFAULT 1,
    current_video_index INT DEFAULT 0
);

-- Daily Routines Table
CREATE TABLE IF NOT EXISTS daily_routines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sequence INT NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

-- Habit Tasks Table
CREATE TABLE IF NOT EXISTS habit_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE
);

-- User Progress Table
CREATE TABLE IF NOT EXISTS user_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    video_completed BOOLEAN DEFAULT FALSE,
    completed_video_id BIGINT,
    routine_completed BOOLEAN DEFAULT FALSE,
    habits_completed BOOLEAN DEFAULT FALSE,
    qa_completed BOOLEAN DEFAULT FALSE,
    all_tasks_completed BOOLEAN DEFAULT FALSE,
    UNIQUE KEY unique_user_date (username, date)
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    attended BOOLEAN NOT NULL,
    device_info VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_date (username, date)
);

-- Workshops Table
CREATE TABLE IF NOT EXISTS workshops (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    link VARCHAR(500),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manifestation Video Table
CREATE TABLE IF NOT EXISTS manifestation_videos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    requested_date DATETIME NOT NULL,
    scheduled_date DATETIME,
    admin_notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_requested_date (requested_date)
);

-- Q&A Table
CREATE TABLE IF NOT EXISTS qa (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Create Admin User (password: admin123)
INSERT INTO users (name, username, email, phone, password, role, level, months_completed, created_at)
VALUES ('Admin', 'admin', 'admin@yoga.com', '1234567890', 
        '$2a$10$rZ8qH5YvZ5YvZ5YvZ5YvZeO5YvZ5YvZ5YvZ5YvZ5YvZ5YvZ5YvZ5Y', 
        'ADMIN', 1, 0, NOW())
ON DUPLICATE KEY UPDATE username=username;

-- Note: To generate BCrypt password, use online tool or run:
-- In Spring Boot application, use: new BCryptPasswordEncoder().encode("admin123")
