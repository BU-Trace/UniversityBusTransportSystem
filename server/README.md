# UBTS Server API

All endpoints are served under the base path `/api/v1`. Unless noted, responses follow the shape:

```
{
	"success": boolean,
	"message": string,
	"data": any
}
```

Authentication uses `Authorization: Bearer <accessToken>` from the login response. Role guards are enforced by middleware where noted.

## Auth

- POST `/api/v1/auth/login` — Login. Body: `email` (string, required), `password` (string, required), `role` (student|driver|admin|superadmin, optional). `clientInfoParser` adds `clientInfo` with device, browser, ipAddress, pcName?, os?, userAgent.
- POST `/api/v1/auth/change-password` — Change password. Body: `email` (string), `oldPassword` (string), `newPassword` (string).
- POST `/api/v1/auth/forget-password` — Request reset link. Body: `email` (string).
- POST `/api/v1/auth/reset-password` — Reset password using emailed token. Body: `token` (string), `newPassword` (string).
- GET `/api/v1/auth/get-pending-registrations` — List pending users. Auth roles: ADMIN, SUPERADMIN.
- POST `/api/v1/auth/approve-registration/:id` — Approve a user. Auth roles: ADMIN, SUPERADMIN. Body: `assignedBusId` (string, required when approving a driver; otherwise omit).
- DELETE `/api/v1/auth/reject-registration/:id` — Reject and delete a pending user. Auth roles: ADMIN, SUPERADMIN.

## Users

- POST `/api/v1/user` — Self registration. Body depends on `role`:
	- Student: `role: "student"`, `email`, `password`, `name`, `clientInfo` { `department`, `rollNumber`, `bio?` }, `clientITInfo` { `device` (pc|mobile), `browser`, `ipAddress`, `pcName?`, `os?`, `userAgent` }.
	- Driver: `role: "driver"`, `email`, `password`, `name`, `clientInfo` { `licenseNumber`, `bio?` }, `clientITInfo` as above, `profileImage` (url), `approvalLetter` (url), `assignedBus?`, `assignedBusName?`.
	- Admin/Superadmin: `role: "admin"|"superadmin"`, `email`, `password`, `name`, `clientInfo?` { `bio?` }, `clientITInfo` as above, `profileImage` (url), `approvalLetter` (url).
- POST `/api/v1/user/verfy-email` — Verify OTP emailed during registration. Body: `email`, `otpToken`.
- GET `/api/v1/user/get-all-users` — List users. Auth roles: ADMIN, SUPERADMIN.
- POST `/api/v1/user/add-user` — Admin creates a user. Auth roles: ADMIN, SUPERADMIN. Body (discriminated by `role`):
	- Student: `role: "student"`, `name`, `email`, `clientInfo` { `rollNumber`, `department?`, `bio?` }, `profileImage?` (url).
	- Driver: `role: "driver"`, `name`, `email`, `clientInfo` { `licenseNumber`, `bio?` }, `profileImage` (url), `approvalLetter` (url), `assignedBus` (string), `assignedBusName?`.
	- Admin/Superadmin: `role: "admin"|"superadmin"`, `name`, `email`, `clientInfo?` { `bio?` }, `profileImage` (url), `approvalLetter` (url).
- PUT `/api/v1/user/update-user/:id` — Admin updates a user. Auth roles: ADMIN, SUPERADMIN. Body matches the create schema but all fields optional; `role` is still required to select the discriminator.
- DELETE `/api/v1/user/delete-user/:id` — Admin deletes a user. Auth roles: ADMIN, SUPERADMIN.
- PATCH `/api/v1/user/admin/:id` — Update admin profile. Auth roles: ADMIN, SUPERADMIN. Multipart form with optional `profileImage` file and JSON fields `name?`, `clientInfo?` { `bio?` }.
- PATCH `/api/v1/user/student/:id` — Update student profile. Auth role: STUDENT. Multipart form with optional `profileImage` file and JSON fields `name?`, `clientInfo?` { `bio?`, `department?`, `rollNumber?` }.
- PATCH `/api/v1/user/driver/:id` — Update driver profile. Auth role: DRIVER. Multipart form with optional `profileImage` file and JSON fields `name?`, `clientInfo?` { `bio?`, `licenseNumber?` }.

## Buses

- POST `/api/v1/bus/add-bus` — Create bus. Body: `name` (string), `plateNumber` (string), `route` (ObjectId), `photo` (string url), `activeHoursComing` (string[]), `activeHoursGoing` (string[], same length as coming), `isActive?` (boolean).
- PUT `/api/v1/bus/update-bus/:id` — Update bus. Body: any of the create fields; validation runs on provided fields.
- DELETE `/api/v1/bus/delete-bus/:id` — Delete bus by id.
- GET `/api/v1/bus/get-all-buses` — List buses (populates route).
- GET `/api/v1/bus/get-bus/:id` — Get single bus (populates route).

## Routes

- POST `/api/v1/route/` — Create route. Body: `name` (string), `stopages` (ObjectId[]), `bus` (ObjectId[], optional), `isActive?` (boolean), `activeHoursComing?` (string[]), `activeHoursGoing?` (string[]).
- PUT `/api/v1/route/:id` — Update route. Body: any of the fields above. Providing `stopages` replaces the array.
- DELETE `/api/v1/route/:id` — Delete route.
- GET `/api/v1/route/` — List routes.

## Stopages

- POST `/api/v1/stopage/add-stopage` — Create stopage. Body: `name` (string, min 2), `latitude` (number between -90 and 90), `longitude` (number between -180 and 180), `isActive?` (boolean).
- PUT `/api/v1/stopage/update-stopage/:id` — Update stopage. Body: any of the create fields.
- DELETE `/api/v1/stopage/delete-stopage/:id` — Delete stopage.
- GET `/api/v1/stopage/get-all-stopages` — List stopages.

## Notifications

- POST `/api/v1/notification/` — Create notification. Body: `title` (string), `message` (string), `category?` (system|alert|reminder), `recipient?` (ObjectId or null), `targetRole?` (superadmin|admin|student|driver|all), `isRead?` (boolean), `sentAt?` (date).
- PUT `/api/v1/notification/:id` — Update notification. Body: any of the fields above.
- DELETE `/api/v1/notification/:id` — Delete notification.
- GET `/api/v1/notification/` — List notifications.
- GET `/api/v1/notification/:id` — Get single notification.

## Issues

- POST `/api/v1/issue/` — Create issue. Body: `title` (string), `description` (string), `category?` (bug|feature|complaint|other), `status?` (open|in_progress|resolved|closed), `priority?` (low|medium|high|urgent), `reporter?` (ObjectId or null), `relatedBus?` (ObjectId or null), `relatedRoute?` (ObjectId or null), `submittedByRole?` (superadmin|admin|student|driver).
- PUT `/api/v1/issue/:id` — Update issue. Body: any of the fields above.
- DELETE `/api/v1/issue/:id` — Delete issue.
- GET `/api/v1/issue/` — List issues.
- GET `/api/v1/issue/:id` — Get single issue.

## Locations

- POST `/api/v1/location/` — Create location. Body: `bus` (ObjectId), `latitude` (number), `longitude` (number), `capturedAt?` (date).
- PUT `/api/v1/location/:id` — Update location. Body: any of the fields above.
- DELETE `/api/v1/location/:id` — Delete location.
- GET `/api/v1/location/` — List locations (populates bus).
- GET `/api/v1/location/:id` — Get single location (populates bus).
- GET `/api/v1/location/bus/:busId/latest` — Latest location for a bus.

## Notes

- Required fields are based on the actual validation in the code (`zod` schemas or interfaces). Optional fields are marked with `?`.
- For multipart profile updates, send `profileImage` as a file field and the JSON fields in a `data` part parsed by the middleware.
