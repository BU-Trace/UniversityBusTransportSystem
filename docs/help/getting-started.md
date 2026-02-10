# Getting Started

Welcome to the University Bus Tracking and Management System (UBTS).

This system is designed to help students, drivers, and administrators manage and track university buses efficiently and safely.

It is a full real-time tracking and management platform built to improve transportation reliability, communication, and safety.

---

# 1. What Is This Website?

This website is a Bus Tracking and Management System that allows users to:

- Track buses in real time
- View bus routes and stops
- Monitor bus status
- Manage buses and routes
- Publish and receive notices
- Control user access and approvals

The system currently supports:

- 6 Total Routes
  - 3 Regular Routes (Daily operation)
  - 3 Occasional Routes (Limited-time or special-purpose operation)

The platform works on desktop, tablet, and mobile devices.

---

# 2. Purpose of the System

The main goals of this system are:

- Improve transportation efficiency
- Reduce waiting time at bus stops
- Provide real-time location tracking
- Allow centralized management of routes and buses
- Deliver instant notifications to all users
- Increase safety and accountability

---

# 3. Who Can Use This Website?

The system is role-based. Each user has specific permissions.

---

## 3.1 Students

Students use the system to monitor buses and plan travel.

Students can:

- View all available routes
- Check bus availability
- Track buses in real time
- See nearest bus stops
- Read published notices
- View bus cancellation alerts
- Check departure and arrival status

Students cannot:

- Edit routes
- Add buses
- Manage drivers
- Publish notices
- Access admin dashboard

Students must have an approved account before using the system fully.

---

## 3.2 Drivers

Drivers use the system to operate assigned buses.

Drivers can:

- View assigned bus information
- View assigned route
- See stop sequence
- Share live location
- Start and stop route tracking
- View notices

Drivers cannot:

- Create routes
- Add buses
- Approve users
- Publish notices

Drivers must:

- Be approved by admin
- Be assigned to a bus
- Enable GPS location while driving

---

## 3.3 Admin

Admins control the system.

Admins can:

- Add new buses
- Edit bus information
- Delete buses
- Create routes
- Assign stops
- Assign drivers to buses
- Approve or reject users
- Publish notices
- Delete notices
- View system statistics

Admins cannot modify SuperAdmin accounts unless given permission.

---

## 3.4 SuperAdmin

SuperAdmin has full system control.

SuperAdmin can:

- Manage Admin accounts
- Access all system modules
- Control permissions
- Perform advanced system-level changes

---

# 4. Basic System Flow

1. User opens the website.
2. User logs in with credentials.
3. System verifies role and approval status.
4. User is redirected to role-specific dashboard.
5. User interacts with available features.

---

# 5. How To Register

1. Click Register.
2. Enter required information:
   - Name
   - Email
   - Password
   - Role
3. Submit form.
4. Wait for admin approval (if required).
5. Login after approval.

If registration fails:

- Check if email already exists.
- Make sure all required fields are filled.
- Ensure password meets security requirements.

---

# 6. How To Login

1. Enter email and password.
2. Click Login.
3. If credentials are correct and account is approved, you will access dashboard.

If login fails:

- Check email spelling.
- Check password.
- Make sure account is approved.
- Reset password if forgotten.
- Contact admin if issue continues.

---

# 7. Dashboard Overview

After login, users see:

- Sidebar navigation
- Main content area
- Role-based tools
- Quick action buttons

Available sections depend on your role.

---

# 8. Understanding Bus Routes

There are 6 routes in total:

Regular Routes:
- Nathullabad – University
- Bangla Bazar – University
- Notun Bazar – University

Occasional Routes:
- Special Event Routes
- Temporary Holiday Routes
- Emergency Routes

Each route contains:

- Ordered stop list
- Assigned buses
- Direction (To University / From University)
- Status (Active / Inactive)

---

# 9. Real-Time Tracking System

The system uses:

- GPS from driver device
- Internet connection
- Backend server synchronization

Tracking updates automatically.

Students can:

- View live bus location
- Estimate arrival
- Identify nearest stop

Drivers must:

- Enable location permission
- Keep internet active
- Avoid closing tracking session during route

---

# 10. Notice System

Admins can publish:

- Text notices
- PDF notices

When a notice is published:

- All active users receive notification
- Popup alert may appear
- Notice board updates automatically

Possible notice types:

- Bus cancellation
- Route delay
- Emergency alert
- Maintenance update
- Holiday schedule
- Route change announcement

---

# 11. Location Permissions

For best performance:

Students:
- Allow browser location access to use nearest stop feature.

Drivers:
- Must allow precise GPS access.
- Should avoid battery saver mode.

If location is not working:

- Refresh browser.
- Check browser permissions.
- Restart GPS.
- Check internet connection.

---

# 12. Common First-Time Issues

Account Not Approved:
- Wait for admin verification.
- Contact admin if delay is long.

Cannot See Routes:
- Make sure role is student.
- Check if routes are active.
- Refresh page.

No Bus Visible:
- Bus may not be running.
- Driver may not have started tracking.
- Route may be inactive.

---

# 13. System Requirements

Recommended:

- Modern browser (Chrome, Edge, Firefox)
- Stable internet connection
- GPS enabled device (for drivers)
- Updated browser version

---

# 14. Security

System uses:

- Role-based access control
- JWT authentication
- Protected backend APIs
- Encrypted passwords
- Approval system

Users cannot access pages outside their role permissions.

---

# 15. Best Practices For New Users

Students:

- Check bus status before leaving.
- Read notices regularly.
- Enable notifications if supported.

Drivers:

- Test GPS before starting route.
- Ensure full battery.
- Avoid unstable network zones.

Admins:

- Verify user information carefully.
- Keep route data updated.
- Publish notices immediately during emergencies.

---

# 16. Troubleshooting Guide

If page does not load:

- Refresh browser.
- Clear cache.
- Restart browser.

If data is not updating:

- Check internet.
- Logout and login again.
- Wait a few seconds for real-time sync.

If session expires:

- Login again.
- Make sure token is not expired.

If PDF notice does not open:

- Check file upload status.
- Ensure PDF was uploaded correctly.
- Check internet speed.

---

# 17. System Limitations

- Real-time tracking depends on internet.
- GPS accuracy depends on device quality.
- Occasional routes may not always be active.
- Admin approval is required for certain roles.

---

# 18. Future Expansion

The system is designed to support:

- Automatic ETA calculation
- SMS notifications
- Attendance tracking
- Bus delay prediction
- Advanced analytics
- AI-based route optimization
- Smart nearest stop prediction
- Mobile app integration

---

# 19. Summary

This system provides:

- Real-time tracking
- Route management
- Role-based access
- Notice broadcasting
- Full administrative control

Students use it to track buses.
Drivers use it to share live location.
Admins use it to manage the system.
SuperAdmins control the entire platform.

Understanding how the system works ensures smooth transportation and better planning.
