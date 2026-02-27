# Backend Setup

## Structure

```
backend/
  src/
    config/
      env.js
      db.js
    controllers/
      auth.controller.js
      location.controller.js
      room.controller.js
      booking.controller.js
    middleware/
      asyncHandler.js
      notFound.js
      errorHandler.js
    routes/
      auth.routes.js
      location.routes.js
      room.routes.js
      booking.routes.js
    app.js
    server.js
  .env.example
  package.json
```

## Run

1. Copy `.env.example` to `.env` and fill DB credentials.
2. Import `database/database.sql` into MySQL.
3. Install dependencies:
   - `npm install`
4. Start API:
   - Dev: `npm run dev`
   - Prod: `npm start`

API base URL: `http://localhost:4000/api`

## Authentication (JWT)

1. Login at `POST /api/auth/login` with `email` and `password`.
2. Use the returned token as `Authorization: Bearer <token>`.
3. Booking endpoints require JWT:
   - `GET /api/bookings/upcoming`
   - `GET /api/bookings/summary`
   - `POST /api/bookings`
