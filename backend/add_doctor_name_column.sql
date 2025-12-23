-- Add doctor_name column to appointments table if it doesn't exist
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(255);
