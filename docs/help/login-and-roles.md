# Login and User Roles

This document explains in detail how authentication works in the system,
how roles are assigned,
what each role can and cannot do,
and how to solve all possible login or permission-related problems.

This Bus Tracking and Management System is role-based.
Access to features depends strictly on your assigned role.

---

# 1. Authentication System Overview

The system uses:

- Email and password authentication
- Role-based authorization
- Token-based session management
- Protected routes
- Approval and activation checks

Every request made after login is verified using an access token.

---

# 2. Account Lifecycle

Every user account goes through the following stages:

1. Registration (created by admin or self-registration)
2. Email verification (if required)
3. Admin approval (for certain roles)
4. Activation
5. Login
6. Session creation
7. System access

An account may be blocked if:
- It is inactive
- It is not approved
- It violates system rules

---

# 3. How Login Works (Technical Flow)

When you login:

1. You submit email and password
2. Backend checks:
   - Does the email exist?
   - Is the password correct?
   - Is the account active?
   - Is the account approved?
3. If valid:
   - Password is compared with hashed password
   - Access token is generated
   - Refresh token may be generated
4. Session is created
5. You are redirected to dashboard based on your role

If any step fails, login is rejected.

---

# 4. Step-by-Step Login Instructions

1. Open the website
2. Click Login
3. Enter registered email
4. Enter password
5. Click Login
6. Wait for authentication
7. You will be redirected to your dashboard

If login fails, an error message will appear.

---

# 5. Login Requirements

To successfully login, you must:

- Use a registered email
- Use the correct password
- Have an active account
- Be approved (if required)
- Have internet connection
- Use a supported browser

---

# 6. Session Behavior

After login:

- A secure session is created
- Access token is stored
- All protected routes check your token
- If token expires, you must login again

If session expires:
- You will be redirected to login page

---

# 7. Role System Overview

There are three primary roles:

1. Student
2. Driver
3. Admin (including Super Admin)

Each role has different access permissions.

The backend enforces role-based authorization.
Even if someone manually enters a URL, unauthorized pages are blocked.

---

# 8. Student Role

Students are read-only users.

Students can:

- View available bus routes
- See live bus tracking map
- Check bus status (Running, Waiting, Arrived)
- View route stops
- See nearest stops (if feature enabled)
- Read notices
- Access help system

Students cannot:

- Modify buses
- Create routes
- Delete routes
- Assign buses
- Publish notices
- Access admin dashboard
- Manage users

Students mainly use the system to:
- Track buses
- Plan travel
- Read announcements

---

# 9. Driver Role

Drivers are responsible for live location updates.

Drivers can:

- View assigned bus
- View assigned route
- See list of route stops
- Share live GPS location
- Update bus status
- View notices
- Access driver dashboard

Drivers cannot:

- Create new buses
- Delete routes
- Manage users
- Publish notices
- Assign drivers
- Modify other routes

Drivers must keep GPS enabled for accurate tracking.

---

# 10. Admin Role

Admins have full management access.

Admins can:

- Add new buses
- Edit buses
- Delete buses
- Create routes
- Edit routes
- Delete routes
- Assign buses to routes
- Assign drivers to buses
- Publish notices
- Delete notices
- Approve users
- Activate/deactivate accounts
- Monitor system activity

Super Admin may also:

- Manage other admins
- Override system-level settings
- Control security configurations

Admins are responsible for system integrity.

---

# 11. Role Permission Matrix

Student:
- Read-only access

Driver:
- Read access
- Update own location

Admin:
- Full read/write access

Super Admin:
- Full system-level control

Unauthorized access attempts are automatically blocked.

---

# 12. Common Login Problems and Solutions

## Problem: Incorrect email or password

Reasons:
- Typing mistake
- Caps lock on
- Wrong email

Solution:
- Re-enter credentials carefully
- Reset password if available

---

## Problem: Account not approved

Reason:
- Admin has not approved account yet

Solution:
- Contact admin
- Wait for approval

---

## Problem: Account inactive

Reason:
- Email not verified
- Account disabled

Solution:
- Contact admin
- Complete verification process

---

## Problem: Token expired

Reason:
- Session timeout

Solution:
- Login again

---

## Problem: Redirect loop after login

Reason:
- Token mismatch
- Role conflict
- Corrupted session

Solution:
- Logout
- Clear browser cache
- Login again

---

## Problem: Page says "Not Authorized"

Reason:
- Accessing restricted page

Solution:
- Use only allowed dashboard sections
- Confirm your role

---

## Problem: Cannot access dashboard

Reason:
- Backend server down
- API not responding
- Network issue

Solution:
- Check internet
- Refresh page
- Try later

---

# 13. Security Measures

The system uses:

- Hashed passwords (bcrypt)
- Role validation
- Token validation
- Route protection
- Permission checking
- Server-side verification

Passwords are never stored in plain text.

---

# 14. Account Lock Conditions

Your account may be restricted if:

- Multiple failed login attempts
- Admin deactivated account
- Policy violation
- Suspicious activity detected

In such cases, contact administrator.

---

# 15. Browser Requirements

For best performance:

- Use latest Chrome, Edge, or Firefox
- Enable JavaScript
- Enable cookies
- Allow location services

Avoid using outdated browsers.

---

# 16. Logout Process

To logout:

1. Click Logout
2. Session token is removed
3. Access to protected pages is blocked
4. You are redirected to home page

Always logout from shared computers.

---

# 17. Best Practices

- Keep password secure
- Do not share login credentials
- Report suspicious behavior
- Use strong passwords
- Update profile information correctly

---

# 18. If You Still Have Problems

If login or access issues continue:

- Contact admin
- Provide your email
- Describe your role
- Explain the issue clearly
- Provide screenshot if possible

The support team will review logs and assist you.

---

# 19. Summary

This system is fully role-based.

Students: Track buses and read information.
Drivers: Share live location and view assignments.
Admins: Manage the entire system.

Login works only when:
- Credentials are correct
- Account is active
- Account is approved
- Role permissions are valid
