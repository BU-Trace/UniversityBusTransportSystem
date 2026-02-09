# Common Problems and Solutions

This page lists common problems users face in the Bus Tracking System and how to fix them.

---

## 1) I cannot login
**Possible reasons**
- Wrong email or password
- Account is not approved yet
- Account is disabled by admin
- Server is down / API not reachable

**Fix**
- Make sure email is correct (no spaces)
- Try resetting password (if your system supports it)
- Ask admin to approve your account (especially for driver/admin roles)
- Check if the backend is running and `NEXT_PUBLIC_API_BASE_URL` is correct
- Try again after 2–3 minutes

---

## 2) Login keeps sending me back to the login page
**Possible reasons**
- Session token expired
- Cookies blocked
- Wrong NextAuth config

**Fix**
- Logout and login again
- Allow cookies for this site
- Disable strict tracking protection for the site
- Try opening in Chrome/Edge (latest)
- Clear cookies and cache for the site

---

## 3) I see “Session expired” or “JWT expired”
**Fix**
- Login again
- If it happens too often:
  - Ask admin to check refresh-token route in backend
  - Check server time/date (wrong server time breaks tokens)

---

## 4) I registered but still cannot enter the dashboard
**Reason**
- Drivers/Admins usually require manual approval

**Fix**
- Go to admin panel → Pending Requests
- Admin/Superadmin must approve you
- Driver approval also needs a bus assignment

---

## 5) My account got rejected / not approved
**Possible reasons**
- Wrong ID / wrong license number
- Photo or approval letter missing
- Admin rejected by mistake

**Fix**
- Register again with correct data
- Upload proper photo and approval letter
- Contact admin to review your application again

---

## 6) I cannot see any buses
**Possible reasons**
- No buses are active right now
- No bus assigned to the route
- Driver has not started service
- Route schedule not for today (occasional routes)

**Fix**
- Check route list first to confirm route exists
- Try again later
- Ask admin if buses are assigned to that route
- If it is an occasional route, confirm if it runs today

---

## 7) I cannot find my route
**Fix**
- Open the Routes page and search by route name
- If you don’t see the route, it may not be created yet
- Ask admin to add the route and stops

---

## 8) Bus location is not updating
**Possible reasons**
- GPS permission not allowed
- Internet is slow/offline
- Driver device location is off
- Backend socket/SSE not connected

**Fix**
- Refresh the page
- Turn on Location permission in browser
- Turn on device GPS (for driver)
- Check if the map is blocked by browser settings
- Try a different network (mobile data)

---

## 9) Map shows blank / white screen
**Possible reasons**
- Map API key missing or blocked
- Ad blocker blocked map scripts
- Network blocked external map services

**Fix**
- Disable ad blocker for this site
- Refresh and wait 10 seconds
- Try another browser
- Try another network
- Admin should check map provider API key settings

---

## 10) Map shows wrong location
**Possible reasons**
- Browser is using old cached location
- GPS accuracy is low (indoors)

**Fix**
- Turn on “High accuracy” location (mobile)
- Go outside or near window
- Refresh and allow location again
- In Chrome: Site settings → Location → Allow

---

## 11) I did not allow location and now it never asks again
**Fix**
- Browser settings → Site settings → Location → Reset permissions
- Reload the site and allow location

---

## 12) I see “API not found”
**Meaning**
- Frontend called an endpoint that backend does not have (route mismatch)

**Fix**
- Check `NEXT_PUBLIC_API_BASE_URL` in frontend `.env`
- Make sure backend is running at that URL
- Check backend route prefix (example: `/api/v1`)
- Verify the exact endpoint names in your server routes
- Restart both client and server after changes

---

## 13) “Network Error” or “Failed to fetch”
**Fix**
- Backend is down → start server
- CORS issue → allow frontend origin in backend
- Wrong URL → fix env variable
- Try opening API URL directly in browser to see if server is reachable

---

## 14) I cannot upload files (PDF/photo)
**Possible reasons**
- File is too large
- Upload preset / Cloudinary config wrong
- Internet issue

**Fix**
- Try a smaller file (under 2–5MB)
- Rename file to simple name like `notice.pdf`
- Check Cloudinary `CLOUD_NAME` and `UPLOAD_PRESET`
- Make sure upload preset allows unsigned upload (if you use unsigned)

---

## 15) Uploaded PDF opens but users cannot see it
**Possible reasons**
- PDF link is private / blocked
- Cloud storage requires login

**Fix**
- Use a public file URL (Cloudinary public link works)
- Open the link in incognito to verify it is public

---

## 16) Notice Publish page: I can’t type or submit
**Possible reasons**
- API not found
- Access token missing
- Not admin/superadmin

**Fix**
- Confirm you are logged in as Admin/Superadmin
- Confirm backend endpoints exist:
  - `GET /notice/get-all-notices`
  - `POST /notice/create-notice`
- Check console error in browser (F12)
- Check server logs for route errors

---

## 17) I published a notice but users didn’t get alert
**Possible reasons**
- Notification system not connected (SSE/websocket)
- Users didn’t open notice stream endpoint
- Browser is blocking background connections

**Fix**
- Confirm client listens to `/notice/stream` (SSE) or websocket event
- Keep site open for live alerts
- Refresh and test again
- Admin should verify broadcast code runs after create/publish

---

## 18) Students cannot open admin pages
**Reason**
- It is correct behavior (role-based access)

**Fix**
- Use student pages only
- If you need admin features, ask admin to change your role (not recommended)

---

## 19) Driver cannot edit routes
**Reason**
- Drivers should not change routes and stops

**Fix**
- Ask admin to update routes
- Driver can only update bus position/status (as per system rules)

---

## 20) I cannot add a route / stop
**Possible reasons**
- Admin permission missing
- API route mismatch
- Validation error (missing stop name, invalid map link)

**Fix**
- Login as Admin/Superadmin
- Ensure all fields are filled
- Check the backend route exists
- Check server validation messages in response

---

## 21) I added a route but it does not show
**Possible reasons**
- Route saved but list not refreshed
- Saved to different DB environment
- Backend returned success false

**Fix**
- Press Refresh button
- Reload the page
- Check DB connection string
- Check server logs to confirm it saved

---

## 22) I added a bus but it does not appear
**Fix**
- Refresh bus list
- Confirm bus schema fields match frontend fields
- Confirm backend returns `name` and `plateNumber`

---

## 23) Driver says “Bus not assigned”
**Reason**
- Driver needs an assigned bus in database

**Fix**
- Admin → User Management → Assign bus to driver
- Approve driver with bus assignment (if pending)

---

## 24) I can’t see “Live Bus Tracker” button / floating buttons
**Possible reasons**
- Intro screen hides buttons
- CSS z-index issue
- Button component not mounted in layout

**Fix**
- Finish/close intro screen
- Check layout file includes the component
- Ensure the component is a Client Component (`'use client'`)
- Increase `z-index` if something covers it

---

## 25) Floating button clicks do nothing
**Possible reasons**
- Component rendered inside Server Component and event handlers blocked
- Wrong Next.js layout composition

**Fix**
- Move interactive button into a Client Component wrapper
- Ensure parent component is also client when passing handlers
- In Next.js App Router: don’t pass onClick from server to client

---

## 26) I see hydration error / mismatch
**Fix**
- Avoid using `window` directly on first render
- Use `mounted` state and render after mount
- Keep server/client HTML consistent

---

## 27) “Cannot find module …” in backend
**Fix**
- Run `npm install` (or `pnpm i`) in server folder
- Ensure dependencies exist in `package.json`
- If types missing, install `@types/...` where needed
- Restart server after install

---

## 28) MongoDB has no data even after adding
**Possible reasons**
- Backend connected to different database
- Save route never hit due to API not found
- Model name mismatch or collection not created yet

**Fix**
- Check server logs: “Database connected successfully”
- Check `.env` connection string
- Check correct DB name and cluster
- Confirm the POST endpoint is being called (network tab)

---

## 29) I get “Unauthorized / Forbidden”
**Fix**
- Login again
- Ensure accessToken is sent in headers
- Check your backend auth middleware
- Confirm your role is allowed for that endpoint

---

## 30) My profile photo does not show
**Possible reasons**
- Photo is missing
- Image URL broken
- Browser blocked the image

**Fix**
- Upload a real image
- If no photo, system should show first letter of name (fallback)
- Try opening image URL directly
- Use HTTPS image links

---

## 31) My photo upload works but it doesn’t save in database
**Fix**
- Make sure backend has update profile endpoint
- Ensure it updates `profileImage` field in MongoDB
- Confirm request uses `multipart/form-data` if uploading file
- Check server log for validation errors

---

## 32) I cannot logout
**Fix**
- Refresh page and try again
- If stuck, clear browser cookies for the site
- Ensure NextAuth is configured correctly

---

## 33) Page is slow / loading forever
**Possible reasons**
- Backend slow
- API calls stuck
- Too many requests

**Fix**
- Check server logs and database latency
- Reduce frequent polling
- Use caching where safe
- Check your internet connection

---

## 34) “Something went wrong” with no details
**Fix**
- Open DevTools (F12) → Console
- Check Network tab → API response body
- Admin should add clear error messages in backend responses

---

## 35) Mobile issues (buttons off-screen / layout broken)
**Fix**
- Use latest Chrome on Android
- Try landscape mode
- Report the screen size to admin
- Admin should use responsive CSS and test on common devices

---

## 36) Browser issues (works in Chrome but not in others)
**Fix**
- Update browser
- Disable strict privacy extensions
- Enable cookies and local storage
- Try Chrome/Edge for best support

---

## 37) Still facing issues?
- Contact the admin or support team
- Share screenshots of:
  - The error message
  - Browser console (F12 → Console)
  - Network tab failed request (URL + status code)
  - Server terminal logs

---

## Quick Checklist (fast debug)
- ✅ Backend running?
- ✅ Correct API base URL?
- ✅ Logged in with correct role?
- ✅ Token present in requests?
- ✅ MongoDB connected to correct DB?
- ✅ Route exists in backend?
- ✅ CORS allowed?
- ✅ Location permission allowed (for maps)?
