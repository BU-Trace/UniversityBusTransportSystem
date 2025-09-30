# UBTS Monorepo

This project contains a full-stack web application with a Next.js client and an Express/MongoDB server.

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/mdimamhosen/UBTS.git
cd UBTS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
- Copy `.env.example` from `server/` to `server/.env` and update `mongoUri` with your MongoDB connection string.

```bash
cp server/.env server/.env
# Edit server/.env and set mongoUri
```

### 4. Run the Development Servers
```bash
npm run dev
```
- This will start both the client (Next.js) and server (Express) concurrently.
- Client: http://localhost:3000
- Server: http://localhost:5000

### 5. Build for Production
```bash
npm run build
```

### 6. Start the Server (Production)
```bash
npm run start
```

## Docker Usage

You can run the entire stack using Docker. This will automatically install all dependencies, so you don't need Node.js or npm installed on your machine.

### 1. Build and Start All Services
```bash
npm run docker:up
```

### 2. Stop All Services
```bash
npm run docker:down
```

- The Dockerfiles in `client/` and `server/` ensure dependencies are installed inside containers.
- If your system does not have Node.js, npm, or any dependencies, Docker will handle everything for you.
- You only need Docker and Docker Compose installed on your machine.

## Folder Structure
- `client/` — Next.js frontend
- `server/` — Express backend with MongoDB

## Coding & Contribution
- Edit frontend code in `client/src/app/`
- Edit backend code in `server/`
- Use TypeScript for both client and server

## Useful Commands
- `npm run lint` — Lint both client and server
- `npm run typecheck` — Type-check both client and server
- `npm run dev` — Start both servers in development
- `npm run build` — Build both client and server
- `npm run start` — Start server in production

---

For any issues, please open an issue on GitHub.
