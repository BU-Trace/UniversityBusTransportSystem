# Bus Management Documentation

The Bus Management section is used by Admin and SuperAdmin to control all buses in the UBTS (University Bus Tracking System).

This module allows full control over:

- Adding buses
- Editing buses
- Deleting buses
- Assigning buses to drivers
- Monitoring active/inactive status
- Tracking route assignments
- Managing bus records

Only **Admin and SuperAdmin** can access this section.

---

# 1️⃣ Overview of Bus Management

The Bus Management page contains:

- List of all buses
- Search bar
- Add Bus button
- Edit / Delete options
- Bus status indicators
- Assigned driver information
- Assigned route information

This section ensures that all buses are properly registered and managed.

---

# 2️⃣ Adding a New Bus

## Steps to Add a Bus

1. Go to Dashboard
2. Click **Bus Management**
3. Click **Add Bus**
4. Fill required information:
   - Bus Name
   - Plate Number
   - Route Assignment (optional at creation)
   - Status (Active / Inactive)
5. Click Save

---

## Required Fields

- Bus Name (Unique recommended)
- Plate Number (Must be unique)

---

## Optional Fields

- Route
- Driver
- Status

---

## What Happens After Adding?

- Bus is saved in MongoDB database
- Bus appears in bus list instantly
- Bus becomes available for driver assignment
- Admin can edit or delete it later

---

# 3️⃣ Editing a Bus

Admin can modify:

- Bus Name
- Plate Number
- Assigned Route
- Assigned Driver
- Status

## Steps

1. Click Edit icon
2. Update required fields
3. Click Save

Changes apply immediately.

---

# 4️⃣ Deleting a Bus

Admin can permanently delete a bus.

## Important Rules

- If a driver is assigned → must unassign first
- If route is assigned → remove route link
- Deleting removes bus from:
  - Dashboard
  - Driver assignment
  - Route list

## Steps

1. Click Delete
2. Confirm deletion
3. Bus removed permanently

---

# 5️⃣ Assigning Bus to Driver

Each driver must be assigned one bus.

## Steps

1. Go to Bus Management
2. Select bus
3. Click Assign Driver
4. Select available driver
5. Save

After assignment:

- Driver dashboard shows bus info
- Bus appears active under driver control

---

# 6️⃣ Bus Status System

Each bus has a status:

- Running
- Waiting
- Arrived
- Inactive

Status updates automatically when:

- Driver shares location
- Admin manually changes it

---

# 7️⃣ Regular vs Occasional Routes

UBTS supports:

- 3 Regular Routes
- 3 Occasional Routes

Buses can be assigned accordingly.

Occasional route buses may:

- Only run certain days
- Have special schedules

---

# 8️⃣ Searching for a Bus

Admin can search by:

- Bus Name
- Plate Number
- Driver Name
- Route Name

Search helps quickly manage large bus lists.

---

# 9️⃣ Common Bus Management Problems & Solutions

---

## 🚨 Problem: Cannot Add Bus

Possible Causes:
- Missing required field
- Duplicate plate number
- Backend API not responding
- Database connection issue

Solutions:
- Check required fields
- Ensure plate number is unique
- Check server logs
- Restart backend server

---

## 🚨 Problem: API Not Found

Cause:
- Incorrect backend route
- Route not mounted in `index.ts`
- Wrong BASE_URL in frontend

Solution:
- Verify `/api/v1/bus/...` exists
- Check route mounting
- Confirm server is running on correct port

---

## 🚨 Problem: Bus Not Showing in List

Possible Causes:
- Failed database save
- Filter active
- Role restriction
- API returning empty array

Solutions:
- Check MongoDB `buses` collection
- Refresh page
- Verify user role
- Check network tab in browser

---

## 🚨 Problem: Cannot Assign Driver

Possible Causes:
- Driver already assigned
- Driver not approved
- Invalid driver ID
- Role mismatch

Solutions:
- Check driver status
- Approve driver first
- Verify ObjectId
- Reload page

---

## 🚨 Problem: Driver Cannot See Assigned Bus

Possible Causes:
- Session not refreshed
- Assignment not saved
- Driver not approved
- Token expired

Solutions:
- Logout & login again
- Refresh session
- Check backend save response
- Verify JWT token

---

## 🚨 Problem: Duplicate Plate Number Error

Cause:
- Unique index on plateNumber

Solution:
- Use different plate number
- Check database for existing record

---

## 🚨 Problem: Deleting Bus Causes Error

Possible Causes:
- Driver still assigned
- Route dependency
- Foreign key constraint
- Server validation error

Solutions:
- Unassign driver first
- Remove route link
- Check backend error message

---

## 🚨 Problem: Bus Status Not Updating

Possible Causes:
- Driver location disabled
- Internet issue
- WebSocket/SSE failure
- Server offline

Solutions:
- Enable GPS
- Check internet
- Restart backend
- Inspect SSE connection

---

## 🚨 Problem: Bus Appears Twice

Possible Causes:
- Duplicate insert
- UI state duplication
- Backend returning multiple responses

Solutions:
- Check MongoDB collection
- Remove duplicate manually
- Restart frontend state

---

## 🚨 Problem: Bus Not Appearing in Route Page

Possible Causes:
- Route not linked
- Incorrect ObjectId reference
- Data population error

Solutions:
- Check `assignedRoute`
- Verify populate() in backend
- Reassign route

---

# 🔟 Security & Validation Rules

- Only Admin/SuperAdmin can manage buses
- Plate number should be unique
- Driver must be approved
- Route must exist before linking

---

# 1️⃣1️⃣ Database Structure (Example)

Collection: `buses`

Fields:
- _id
- name
- plateNumber
- assignedDriver
- assignedRoute
- status
- createdAt
- updatedAt

---

# 1️⃣2️⃣ Advanced Best Practices

For Admins:

- Keep bus data updated regularly
- Remove inactive buses
- Verify driver assignments weekly
- Avoid duplicate naming
- Maintain proper route mapping

---

# 1️⃣3️⃣ Performance Considerations

If system grows:

- Use pagination for bus list
- Use indexed search fields
- Use lean() queries in backend
- Avoid large population chains

---

# 1️⃣4️⃣ Real-Time Behavior

When bus is active:

- Driver location updates every few seconds
- Student dashboard refreshes status
- Nearest stop system updates automatically

---

# 1️⃣5️⃣ Emergency Scenarios

If bus breaks down:

1. Admin sets status to Inactive
2. Publish notice
3. Assign backup bus
4. Notify students

---

# 1️⃣6️⃣ Future Improvements (Optional)

- Bus maintenance logs
- Fuel tracking
- Attendance tracking
- Delay prediction
- GPS route optimization
- Smart ETA system

---

# Conclusion

The Bus Management module is a core part of UBTS.

It ensures:

- Smooth transportation control
- Accurate driver assignment
- Reliable route management
- Real-time bus tracking

Proper management of this section keeps the whole system stable and efficient.
