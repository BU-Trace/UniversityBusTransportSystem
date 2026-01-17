# ubts-server

## Database schema (MongoDB)

The server uses four Mongoose models. Route documents link buses and stopages; other models are standalone.

### Collections and fields
- **User**
  - `email` (unique, required), `password` (hashed), `name`
  - `role` (required enum: `superadmin` | `admin` | `student` | `driver`)
  - `clientITInfo` (device stored as `pc` | `mobile` | `tablet` in Mongo; TypeScript interface currently only allows `pc` | `mobile`—a discrepancy to fix), plus browser, ipAddress, pcName, os, userAgent
  - `clientInfo` (bio, department, rollNumber, licenseNumber)
  - `lastLogin`, `isActive`, `otpToken`, `otpExpires`, `needPasswordChange`, `resetPasswordExpires`, `resetPasswordToken`, `profileImage`
  - Automatic `createdAt`/`updatedAt`

- **Stopage**
  - `stopage_id` (unique, required), `name` (required), `latitude` (required), `longitude` (required), `isActive` (default `true`)
  - Automatic `createdAt`/`updatedAt`

- **Bus**
  - `name` (required), `type` (required; enum: `single-decker` | `double-decker`)
  - Automatic `createdAt`/`updatedAt`

- **Route**
  - `route_id` (unique, required), `name` (required)
  - `stopages`: array of `ObjectId` references to **Stopage** (required)
  - `bus`: array of `ObjectId` references to **Bus** (required)
  - `isActive` (default `true`)
  - Automatic `createdAt`/`updatedAt`

### Relationship diagram
```mermaid
erDiagram
  User {
    ObjectId _id
    string email
    string password (hashed)
    string role
  }
  Stopage {
    ObjectId _id
    string stopage_id
    string name
    number latitude
    number longitude
    boolean isActive
  }
  Bus {
    ObjectId _id
    string name
    string type
  }
  Route {
    ObjectId _id
    string route_id
    string name
    boolean isActive
  }
  Route ||--o{ Stopage : "stopages[]"
  Route ||--o{ Bus : "bus[]"
```

Passwords are hashed by a Mongoose pre-save hook before persisting.
