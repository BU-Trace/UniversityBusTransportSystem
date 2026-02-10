# Notice System

The Notice System is the official way to publish important information to all users of the Bus Tracking and Management System.  
It is designed to make sure **students, drivers, and admins** get updates quickly and clearly, without missing critical announcements.

This document explains:
- What notices are
- How notices are created and stored
- How users receive them (popup + list)
- Text vs PDF notices
- Who can publish and manage notices
- Common problems and exact solutions
- Best practices for writing notices
- What happens in the system when a notice is published

---

## 1. What is the Notice System?

The Notice System is a broadcast feature.  
Admins use it to send messages to everyone using the platform.

A notice can be:
- A **Text notice** (written message)
- A **PDF notice** (file upload, shown as a link/openable file)

Notices are used for:
- Bus cancellations or delays
- Route changes
- Schedule updates (temporary or permanent)
- Emergency announcements
- Holiday or exam-time service notices
- Special bus days for occasional routes
- System maintenance announcements
- Policy rules (registration approval, photo rules, etc.)

---

## 2. Where Notices Appear for Users

Students and drivers can see notices in two main ways:

### A. Popup Alert
When a new notice is published:
- A popup appears on the user’s screen (if they are currently using the site)
- It shows the newest notice immediately
- It may show notice title + preview text, and a button to open full notice

### B. Notice Board / Notice List
Notices are also stored in the system and visible in a notice list page/section.
Users can:
- Read the notice text fully
- Open the PDF if it is a PDF notice
- See a history of older notices (if your UI supports showing multiple)

---

## 3. Notice Types

### 3.1 Text Notice
A text notice contains:
- Title (required)
- Body text (required)
- Created time
- Published time

Text notices are good for:
- Short updates
- Quick instructions
- Small announcements

Example:
Title: "Bus Route Update"
Body: "Today the Nothullabad route bus will start at 9:30 AM instead of 9:00 AM."

---

### 3.2 PDF Notice
A PDF notice contains:
- Title (required)
- File link (required)
- Created time
- Published time

PDF notices are good for:
- Official documents
- Long instructions
- Schedules and timetables
- Policy documents
- Forms

Example:
Title: "New Semester Bus Schedule"
PDF: "semester_schedule.pdf"

---

## 4. Who Can Create and Publish Notices

### Students
Students:
- Can only read notices
- Cannot create, edit, publish, or delete notices

### Drivers
Drivers:
- Can only read notices
- Cannot create, edit, publish, or delete notices

### Admin / Super Admin
Admins can:
- Create notices
- Publish notices
- Update notices (if edit is enabled)
- Delete notices

Super Admin can do everything an admin can, plus system-level control (if enabled in your app).

---

## 5. Admin Workflow: Creating a Notice (Text)

1. Go to **Admin Dashboard**
2. Open **Notice Publish / Notice Management**
3. Click **New Notice**
4. Select **Notice Type = Text**
5. Enter **Title**
6. Enter **Notice Text**
7. Click **Publish Notice**

After publishing:
- Notice is saved in the database
- Notice appears in admin notice list
- Notice is visible for students and drivers
- A live notification is sent to active users (popup)

---

## 6. Admin Workflow: Creating a Notice (PDF)

1. Go to **Admin Dashboard**
2. Open **Notice Publish / Notice Management**
3. Click **New Notice**
4. Select **Notice Type = PDF**
5. Enter **Title**
6. Upload PDF file (or attach PDF link, based on your implementation)
7. Click **Publish Notice**

After publishing:
- Notice is saved in database with PDF URL
- Notice is visible to all users in the notice board/list
- Popup notification triggers for active users

Important:
- Only PDF files should be accepted in the PDF upload field
- If a non-PDF is uploaded, the UI should block it

---

## 7. Editing / Updating a Notice

If your system supports editing:

Admins can update:
- Title
- Text body (for text notices)
- PDF link (for PDF notices)

Important behavior rules:
- If a notice was already published, editing it should update the notice history
- If your system re-sends popup alerts on update, users may see the notice again
- If you do NOT want alerts on updates, only notify on new notices, not edits

Recommended rule:
- Updates should not spam popups unless the update is critical

---

## 8. Deleting Notices

Admins can delete notices to:
- Remove outdated information
- Fix incorrect announcements
- Clear the notice list

What delete should do:
- Remove notice from database
- Remove it from notice list for all users
- It should no longer appear in popup history

Recommended:
- Ask for confirmation before delete
- If deleted by mistake, it is not recoverable unless your system has backups

---

## 9. How Notifications Reach Users (Real-Time)

When a notice is published, the system should broadcast it to users.

Common approaches:
- Server-Sent Events (SSE)
- WebSocket
- Push notifications (advanced)
- Polling (simple fallback)

In your system design, the recommended behavior is:
- Users connected to the site receive notice instantly (popup)
- Users offline will see it later in the notice list when they open the site

---

## 10. What Users Should Do When a Notice Pops Up

When users see the notice popup:
- Read title carefully
- Open the notice if needed
- If it is a PDF notice, open/download it
- Follow instructions (route change, bus cancellation, timing update)

Users should not ignore notices because notices may contain:
- Cancellation warnings
- Schedule changes
- Emergency instructions

---

## 11. Suggested Notice Writing Rules (Best Practices)

Admins should follow these rules to keep notices clear:

### Keep the title short and specific
Bad: "Important Notice"
Good: "Nothullabad Bus Delayed Today (9:30 AM)"

### Always include time and date if schedule changes
Bad: "Bus will come late"
Good: "Today (Feb 10) Barishal Club bus will start 30 minutes late."

### Mention affected route clearly
Example:
"This notice is for Natun Bazar - University route."

### Mention who it affects
Example:
"Students only" or "Drivers only" if needed

### Avoid long confusing paragraphs
Use small sentences.

---

## 12. Common Problems and Solutions (Notice System)

### Problem: Admin sees “API not found”
Possible reasons:
- Backend route not created
- Wrong URL path in frontend
- Base URL not correct in `.env`
- Backend server not running

Solutions:
- Confirm backend endpoints exist (GET/POST/DELETE)
- Confirm `NEXT_PUBLIC_API_BASE_URL` matches backend
- Restart backend server
- Check route prefix (example: `/api/v1/notice/...`)

---

### Problem: Notice saves but does not show in database
Possible reasons:
- Wrong database connection string
- Notice model not registered
- Controller not using `Notice.create(...)`
- Server crashed before saving

Solutions:
- Check DB connection logs (Mongo connected or not)
- Confirm Notice model is imported correctly
- Confirm controller returns success after creating
- Check MongoDB collection name (usually `notices`)

---

### Problem: Text notice is empty in database
Possible reasons:
- Frontend is sending wrong field name
- Backend expects `body` but frontend sends `text`
- Validation removes it

Solutions:
- Ensure frontend payload sends `body` for text notices
- Ensure backend reads `req.body.body`

---

### Problem: PDF notice link is missing
Possible reasons:
- Upload failed
- Frontend did not set `fileUrl`
- Backend validation rejected fileUrl

Solutions:
- Confirm Cloudinary upload is working
- Confirm PDF url is returned and assigned
- Confirm payload sends `fileUrl`

---

### Problem: Users do not receive popup notification
Possible reasons:
- Notification channel not connected (SSE/WebSocket not running)
- Client not subscribed
- Users are offline
- Popup logic disabled

Solutions:
- Confirm user client is connected to SSE endpoint
- Confirm broadcast function runs after publishing
- Confirm popup component is mounted globally

---

### Problem: Notice list does not update after publishing
Possible reasons:
- State not updated in UI
- API caching
- Missing reload after create

Solutions:
- Update notice state after successful create
- Or call refresh/loadNotices after publish
- Use `cache: 'no-store'` if needed

---

### Problem: PDF cannot open
Possible reasons:
- URL invalid
- File removed from hosting
- Browser blocked popups

Solutions:
- Ensure `fileUrl` is valid https URL
- Try opening in new tab
- Re-upload PDF if deleted

---

## 13. Recommended Notice System Behavior (Production Standard)

A strong notice system should support:
- Pagination or limit (avoid loading 2000 notices at once)
- Sorting newest first
- Role check (only admin can create)
- Validation (title + body or title + pdf)
- Safe delete confirmation
- Reliable broadcast to connected clients
- Fallback: Users can still see notices in list even if broadcast fails

---

## 14. User Guide Summary

Students:
- Read popup
- Check notice board
- Follow instructions

Drivers:
- Read popup
- Follow route/schedule instructions
- Keep tracking consistent

Admins:
- Publish notices carefully
- Use clear titles
- Avoid spam
- Delete outdated notices

---

## 15. Final Notes

Notices are part of system trust.
If notices are frequent and unclear, users will stop reading them.

Keep notices:
- Short
- Accurate
- Route-specific
- Date/time specific
- Actionable

If a notice is urgent, publish immediately and make the title very clear.
