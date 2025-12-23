# User Approval System

## Overview
New users must be approved by an admin before they can log in to the application.

## How It Works

### For New Users
1. User registers with their details
2. Account is created but marked as `approved = false`
3. User sees message: "Your account has been created successfully. Please wait for admin approval before you can sign in."
4. If user tries to login before approval, they see: "Your account is pending admin approval. Please wait for approval before logging in."

### For Admins
1. Login to admin dashboard
2. Click on the "Pending" tab
3. View list of users awaiting approval
4. Click the green checkmark icon to approve a user
5. User can now log in

## Database Changes

### New Column
- `approved` (BOOLEAN, default: FALSE) added to `users` table

### Migration
Run the migration script:
```bash
scripts\add-approval-system.bat
```

Or manually run:
```sql
ALTER TABLE users ADD COLUMN approved BOOLEAN DEFAULT FALSE;
UPDATE users SET approved = TRUE WHERE role = 'ADMIN';
UPDATE users SET approved = TRUE WHERE role = 'USER';
```

## Backend Changes

### User Entity
- Added `approved` field (Boolean, default: false)

### AuthService
- `login()`: Checks if user is approved, throws `PENDING_APPROVAL` error if not
- `register()`: Sets `approved = false` for new users
- `getPendingUsers()`: Returns list of unapproved users
- `approveUser()`: Sets `approved = true` for a user

### AuthController
- `GET /api/auth/pending-users`: Get all pending users
- `POST /api/auth/approve-user/{username}`: Approve a user

## Frontend Changes

### LoginScreen
- Handles `PENDING_APPROVAL` error
- Shows user-friendly message about waiting for approval

### RegisterScreen
- Updated success message to inform about approval requirement

### AdminDashboard
- New "Pending" tab showing users awaiting approval
- Approve button for each pending user
- Real-time count of pending approvals

## Testing

1. Register a new user
2. Try to login → Should see pending approval message
3. Login as admin
4. Go to "Pending" tab
5. Approve the user
6. User can now login successfully

## Notes

- Existing users are automatically approved during migration
- Admin accounts are always approved
- Only admins can approve users
- Approval is instant (no email notification)
