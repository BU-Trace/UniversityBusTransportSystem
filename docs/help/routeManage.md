# Route Management

The Route Management system is one of the core components of the Bus Tracking and Management System.

Routes define how buses travel from the University to different destinations and back.  
Without routes, buses cannot operate inside the system.

This document explains in full detail how routes work, how they are created, how they are used by students and drivers, and how to manage them properly in a production environment.

---

# 1. What is a Route?

A route is a structured travel path that includes:

- Route Name
- Route Type (Regular or Occasional)
- Ordered List of Stops
- Map Path (Polyline or coordinates)
- Assigned Buses
- Assigned Drivers
- Route Status (Active / Inactive)

A route defines the exact order in which stops are visited.

Routes are directional and structured.

---

# 2. Types of Routes

There are two route types in the system:

## 2.1 Regular Routes

Regular routes:
- Operate daily
- Have fixed schedule
- Always visible to students
- Always assigned buses

Example:
- Nathullabad - University
- Bangla Bazar - University

Regular routes should always remain active unless maintenance is needed.

---

## 2.2 Occasional Routes

Occasional routes:
- Operate on special days
- Used for events, exams, holidays
- May not run daily
- May require manual activation

Example:
- Exam Special Route
- Festival Route
- Temporary Semester Route

Occasional routes should clearly mention:
- Active dates
- Special conditions

---

# 3. Total Route Structure

Each route contains:

- Route Name
- Route Type
- Stops array (ordered)
- Map coordinates for each stop
- Route polyline
- Created date
- Updated date
- Active status

Routes must always maintain stop order integrity.

---

# 4. Stop Structure

Each stop must contain:

- Stop Name
- Latitude
- Longitude
- Stop Order (index)
- Optional description

Stops are strictly ordered.

Example order:
1. University
2. Stop A
3. Stop B
4. Stop C
5. Destination

The order determines:
- Which stop comes next
- Which stop has already been passed
- Nearest upcoming stop logic

---

# 5. Route Lifecycle

A route goes through:

1. Creation
2. Stop assignment
3. Map path definition
4. Bus assignment
5. Driver assignment
6. Activation
7. Operation
8. Optional modification
9. Deactivation (if needed)

---

# 6. Admin Workflow: Creating a Route

Step-by-step:

1. Login as Admin
2. Go to Route Management
3. Click Add Route
4. Enter Route Name
5. Select Route Type
6. Add Stops (minimum 2 stops required)
7. Enter Google Map location for each stop
8. Define map path (if supported)
9. Save Route

After saving:
- Route is stored in database
- Route becomes visible in system
- Route appears in route list
- Route is ready for bus assignment

---

# 7. Validation Rules During Route Creation

The system should validate:

- Route name cannot be empty
- Route name must be unique
- Route type must be valid
- Minimum 2 stops required
- Stops cannot have duplicate names
- Stop order must be sequential
- Latitude and longitude must be valid numbers

If validation fails, route should not be saved.

---

# 8. Editing a Route

Admins can edit:

- Route name
- Route type
- Stops
- Stop order
- Map coordinates
- Active status

Important rules:

- Editing stop order affects nearest-stop calculations
- Removing stops may affect buses already operating
- If a route is edited, drivers should refresh dashboard

Recommended practice:
Avoid editing routes while buses are actively running unless necessary.

---

# 9. Deleting a Route

Admins can delete routes.

Before deleting:
- Ensure no buses are assigned
- Ensure no drivers are assigned
- Confirm deletion

After deletion:
- Route removed from database
- Route removed from dashboard
- Students cannot see it anymore

Deletion should be confirmed to prevent data loss.

---

# 10. Activating and Deactivating Routes

Instead of deleting, sometimes it is better to deactivate a route.

Inactive routes:
- Not visible to students
- Not assignable to buses
- Stored for future use

Occasional routes should often use activation/deactivation instead of deletion.

---

# 11. Assigning Buses to Routes

After route creation:

1. Go to Bus Management
2. Assign bus to route
3. Save assignment

Each bus should:
- Be assigned to one route at a time
- Have a defined direction

If no bus is assigned:
Students will see the route but no active buses.

---

# 12. Driver Interaction With Routes

Drivers see:

- Assigned route
- Stop list
- Map path
- Next stop

Drivers should:

- Follow stop order strictly
- Keep GPS enabled
- Update bus status accordingly

If driver deviates from route:
Tracking accuracy decreases.

---

# 13. Student Interaction With Routes

Students can:

- View route list
- Click a route
- View stop list
- View active buses on route
- Track buses in real-time

Students cannot:
- Edit stops
- Modify route details

Routes should be simple and clear for students.

---

# 14. Nearest Stop Logic

Routes are used for:

- Determining nearest upcoming stop
- Determining passed stops
- Calculating bus progress
- Predicting arrival

The system should:

- Track bus current location
- Compare location with stop coordinates
- Mark stops as passed once bus crosses them
- Show next unreached stop

Nearest stop must:
- Not be already passed
- Be next in order

---

# 15. Map Integration

Routes should integrate with:

- Google Maps
- Map polyline
- Stop markers
- Live bus marker

Map should:
- Display stop sequence
- Show bus direction
- Highlight current segment

---

# 16. Common Route Problems and Solutions

## Problem: Route not appearing

Possible reasons:
- Route inactive
- Route not saved properly
- Database error

Solution:
- Check route status
- Refresh dashboard
- Check backend logs

---

## Problem: Stops appear in wrong order

Reason:
- Stop index not updated correctly

Solution:
- Edit route
- Reorder stops
- Save properly

---

## Problem: Students cannot see route

Possible reasons:
- Role restriction
- Route inactive
- No assigned buses

Solution:
- Activate route
- Assign bus
- Check role permissions

---

## Problem: Nearest stop calculation wrong

Possible reasons:
- Wrong stop coordinates
- Wrong stop order
- GPS delay
- Bus skipping stops

Solution:
- Verify latitude/longitude
- Check stop order
- Confirm bus GPS accuracy

---

## Problem: Map not displaying route

Possible reasons:
- Missing polyline data
- Google Maps API issue
- Invalid coordinates

Solution:
- Re-save route
- Validate coordinates
- Check API key

---

## Problem: Bus assigned but not showing under route

Possible reasons:
- Assignment not saved
- Backend route mismatch
- Wrong route ID

Solution:
- Reassign bus
- Verify route ID
- Refresh dashboard

---

# 17. Performance Considerations

For production systems:

- Limit number of stops per route
- Use indexing for route lookup
- Avoid loading all routes at once
- Use caching for route lists
- Keep route documents lightweight

---

# 18. Safety and Best Practices

- Keep route names clear and short
- Avoid duplicate route names
- Maintain consistent naming format
- Always verify stop coordinates
- Avoid editing routes during live bus operation
- Deactivate instead of deleting when possible

---

# 19. Recommended Naming Convention

Example format:

- Nathullabad - University
- Bangla Bazar - University
- Natun Bazar - University
- University - Nathullabad

Consistency improves clarity.

---

# 20. Summary

Route Management controls:

- How buses travel
- Which stops are included
- How nearest stop is calculated
- How students plan travel
- How drivers operate

Routes must be:

- Accurate
- Ordered
- Properly validated
- Correctly assigned

Incorrect route data directly affects:
- Tracking accuracy
- Nearest stop logic
- Student experience
- Operational safety
