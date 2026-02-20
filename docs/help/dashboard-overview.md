# Dashboard Overview

The Dashboard is the main control center of the UBTS (University Bus Tracking System).  
After login, users will see different dashboard sections based on their role.

---

# 1️⃣ Dashboard Layout

After successful login, you will see:

- A **Sidebar Navigation Menu**
- A **Main Content Area**
- Quick access buttons (like Notice, Tracker, Support, etc.)
- Role-based features

The available sections depend on your account role.

Common sidebar sections:

- Bus Management
- Route Management
- User Management
- Notice Publish
- Logout

---

# 2️⃣ Student Dashboard

Students mainly use the system to **check buses and routes in real-time**.

## What Students Can See

- Route List (All 6 Routes: 3 Regular + 3 Occasional)
- Live Bus Tracking Map
- Current Bus Status (Running / Waiting / Arrived)
- Notice Button
- Bus Departure Time
- Assigned Stops
- Support / Help Buttons

## What Students Cannot Do

- Add or delete buses
- Edit routes
- Manage drivers
- Publish notices
- Approve registrations

---

## How Students Use the Dashboard

### 🔍 Check Bus Status
- Go to Live Tracker
- Select route
- Check if bus is Running / Waiting / Arrived

### 🗺️ Check Route Stops
- Open route list
- See stop sequence
- Identify nearest stop

### 📢 View Notices
- Click Notice section
- Read text notice OR open PDF notice
- If new notice is published, popup alert will appear automatically

---

# 3️⃣ Driver Dashboard

Drivers use the system to **share bus location and manage assigned route**.

## What Drivers Can See

- Assigned Bus Information
- Route Details
- Assigned Stops
- Live Location Status
- Notice Section
- Logout

## What Drivers Can Do

- Share live bus location
- See which route they are assigned
- View departure times
- Check assigned bus details

## What Drivers Cannot Do

- Add buses
- Edit routes
- Approve users
- Publish notices

---

## How Drivers Use the Dashboard

### 🚍 Start Route
- Login
- Check assigned bus
- Start location sharing

### 📍 Share Live Location
- Enable GPS
- Allow browser location permission
- System will update bus position automatically

### 🛑 Stop Route
- Turn off location sharing after finishing route

---

# 4️⃣ Admin Dashboard

Admins control the whole system.

## What Admins Can See

- Bus Management
- Route Management
- User Management
- Pending Approvals
- Notice Publish Section
- System Statistics
- Logout

## What Admins Can Do

### 🚌 Bus Management
- Add new bus
- Edit bus details
- Delete bus
- Assign bus to driver

### 🛣️ Route Management
- Create route
- Add stops
- Edit stop order
- Remove stops
- Assign buses to routes

### 👥 User Management
- View all students
- View all drivers
- View admins
- Approve pending registrations
- Reject registrations
- Assign driver to bus
- Delete users

### 📢 Notice Publish
- Create text notice
- Upload PDF notice
- Publish notice
- Delete notice
- Notify all users instantly

---

# 5️⃣ SuperAdmin Dashboard

SuperAdmin has full authority.

## Extra Permissions

- Approve Admin accounts
- Remove Admin accounts
- Full database-level control
- Manage system permissions

---

# 6️⃣ Dashboard Features Explained

## 🔄 Real-Time Updates
- Bus status changes every few seconds
- Notice popup appears instantly
- SSE / WebSocket used for real-time notice broadcast

## 📍 Location Tracking
- Uses GPS
- Requires browser permission
- Works best on mobile devices for drivers

## 📱 Responsive Layout
- Works on:
  - Desktop
  - Tablet
  - Mobile

---

# 7️⃣ Security & Role-Based Access

Every page is protected.

| Role | Access |
|------|--------|
| Student | View routes & buses |
| Driver | Share location |
| Admin | Manage system |
| SuperAdmin | Full control |

If a user tries to access restricted page:
- They will be redirected
- Or shown "Not Authorized"

---

# 8️⃣ Notifications System

When Admin publishes a notice:

- All active users receive:
  - Popup alert
  - Notification sound (if implemented)
  - Notice board update

Types of notices:
- Text Notice
- PDF Notice

---

# 9️⃣ Dashboard Statistics (Admin Only)

Admins can see:

- Total Buses
- Active Buses
- Total Drivers
- Active Drivers
- Registered Students
- Pending Approvals
- Active Routes
- System Alerts

---

# 🔟 Performance & System Behavior

- Routes update automatically
- Bus status refresh every few seconds
- Notices are stored in MongoDB
- User sessions managed via JWT
- Role verification handled in backend middleware

---

# 1️⃣1️⃣ Best Practices for Using Dashboard

### Students
- Check bus status before leaving home
- Enable location for nearest stop feature
- Read notices regularly

### Drivers
- Always enable GPS before starting route
- Keep internet connection stable
- Stop sharing after finishing route

### Admins
- Verify documents before approving drivers
- Keep routes updated
- Publish notices for any emergency changes

---

# 1️⃣2️⃣ System Workflow Summary

1. Student registers
2. Admin approves student
3. Driver assigned to bus
4. Driver shares location
5. Student checks bus status
6. Admin publishes notice if needed

---

# 1️⃣3️⃣ Future Expandable Sections

The dashboard is designed to support future features:

- Attendance tracking
- Bus delay prediction
- Smart ETA calculation
- Emergency alerts
- SMS notifications
- Driver performance analytics
- Route optimization

---

# Conclusion

The Dashboard is the core interface of UBTS.  
Each role has a specific responsibility:

- Students → Track buses
- Drivers → Share location
- Admins → Manage system
- SuperAdmins → Control permissions

Understanding dashboard ensures smooth and efficient use of the bus tracking system.
