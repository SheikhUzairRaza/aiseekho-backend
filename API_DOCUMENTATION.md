# API Documentation

This project is Node.js + Express backend for an AI-driven service marketplace. It uses:

- `Express` for the HTTP API
- `MongoDB` with `Mongoose` for persistence
- `JWT` for authentication
- `Google Gemini` for intent parsing, provider matching, pricing, and dispute handling

## How To Run The Project

## Prerequisites

- `Node.js` 18+ recommended
- `npm`
- `MongoDB` running locally or a remote MongoDB connection string
- `GEMINI_API_KEY`

## Install Dependencies

```bash
npm install
```

## Create `.env`

This repository does not include a confirmed `.env.example`, so create a `.env` file in the project root with:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ai-seekho
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MAX_TOKENS=1500
```

## Start MongoDB

If you are using local MongoDB, make sure it is running before starting the server.

## Optional: Seed Provider Data

This project includes a seed script:

```bash
node seed.js
```

That script:

- connects to `MONGODB_URI`
- deletes existing provider users and provider profiles
- inserts providers from `data/providers.json`

## Start The Server

Development mode:

```bash
npm run dev
```

Production-style run:

```bash
npm start
```

The API will start on:

```txt
http://localhost:3000
```
unless `PORT` is overridden.

## Access Swagger UI

After starting the server, open:

```txt
http://localhost:3000/api-docs
```

Raw OpenAPI JSON:

```txt
http://localhost:3000/api-docs.json
```

## Authentication

Most endpoints require a bearer token.

Header format:

```http
Authorization: Bearer <jwt_token>
```

Public endpoints:

- `POST /api/auth/signup`
- `POST /api/auth/login`

Protected endpoints:

- `GET /api/user/me`
- `POST /api/user/location`
- `POST /api/chat`
- `GET /api/chat/traces`
- `GET /api/history`
- `POST /api/confirm`
- `POST /api/complete`
- `POST /api/dispute`
- `POST /api/simulate-cancel`
- `GET /api/provider-analytics/:id`

## API Base URL

```txt
http://localhost:3000/api
```

---

## Swagger-Style API Reference

```yaml
openapi: 3.0.3
info:
  title: AI Seekho Orchestrator Backend API
  version: 1.0.0
  description: >
    Express backend for authentication, user management, AI chat orchestration,
    booking lifecycle handling, dispute processing, and provider analytics.
servers:
  - url: http://localhost:3000
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
security:
  - bearerAuth: []
paths:
  /api/auth/signup:
    post:
      summary: Register a new user
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password, role, name]
              properties:
                email:
                  type: string
                  example: user@example.com
                password:
                  type: string
                  example: password123
                role:
                  type: string
                  enum: [customer, provider]
                  example: customer
                name:
                  type: string
                  example: Ali Khan
      responses:
        '201':
          description: User created successfully
        '400':
          description: User already exists
        '500':
          description: Server error

  /api/auth/login:
    post:
      summary: Login user
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  example: user@example.com
                password:
                  type: string
                  example: password123
      responses:
        '200':
          description: Login successful
        '401':
          description: Invalid credentials
        '500':
          description: Server error

  /api/user/me:
    get:
      summary: Get current authenticated user
      responses:
        '200':
          description: Authenticated user profile
        '401':
          description: Unauthorized
        '500':
          description: Server error

  /api/user/location:
    post:
      summary: Update current user location
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [location]
              properties:
                location:
                  type: object
                  properties:
                    latitude:
                      type: number
                      example: 33.6844
                    longitude:
                      type: number
                      example: 73.0479
                    address:
                      type: string
                      example: F-8 Markaz, Islamabad
      responses:
        '200':
          description: Location updated
        '401':
          description: Unauthorized
        '500':
          description: Server error

  /api/chat:
    post:
      summary: Process a natural-language service request
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [message]
              properties:
                message:
                  type: string
                  example: AC kharab hai, kisi technician ko bhej do
                city:
                  type: string
                  example: Islamabad
                location:
                  type: object
                  description: Optional user coordinates used for provider distance scoring
                  properties:
                    lat:
                      type: number
                      example: 33.6844
                    lng:
                      type: number
                      example: 73.0479
      responses:
        '200':
          description: AI workflow completed
        '400':
          description: Message missing
        '401':
          description: Unauthorized
        '500':
          description: Server error

  /api/chat/traces:
    get:
      summary: Get recent AI agent traces
      responses:
        '200':
          description: Trace list
        '401':
          description: Unauthorized
        '500':
          description: Server error

  /api/history:
    get:
      summary: Get booking history for authenticated customer or provider
      responses:
        '200':
          description: Booking history returned
        '401':
          description: Unauthorized
        '500':
          description: Server error

  /api/confirm:
    post:
      summary: Confirm a booking
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [providerId, serviceType, amount, scheduledWindow, startTime]
              properties:
                providerId:
                  type: string
                  example: 682b6d5e8b8c4d0012345678
                serviceType:
                  type: string
                  example: ac_technician
                amount:
                  type: number
                  example: 3500
                scheduledWindow:
                  type: string
                  example: Today, 02:00 PM - 03:00 PM
                startTime:
                  type: string
                  format: date-time
                  example: 2026-05-20T14:00:00.000Z
      responses:
        '200':
          description: Booking confirmed
        '401':
          description: Unauthorized
        '500':
          description: Server error

  /api/complete:
    post:
      summary: Complete a booking and submit feedback
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [bookingId, feedback, rating]
              properties:
                bookingId:
                  type: string
                  example: BKG-123456
                feedback:
                  type: string
                  example: Technician arrived on time and fixed the issue
                rating:
                  type: number
                  example: 5
      responses:
        '200':
          description: Completion processed
        '401':
          description: Unauthorized
        '500':
          description: Server error

  /api/dispute:
    post:
      summary: File a dispute for a booking
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [booking, complaint]
              properties:
                booking:
                  type: object
                  description: Booking context sent to the dispute agent
                  example:
                    booking_id: BKG-123456
                    provider_name: Ahmed Electrician
                    total_amount: 2800
                    status: completed
                complaint:
                  type: string
                  example: The provider charged extra and did not complete the work
      responses:
        '200':
          description: Dispute processed
        '401':
          description: Unauthorized
        '500':
          description: Server error

  /api/simulate-cancel:
    post:
      summary: Simulate provider cancellation and rematch another provider
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [intent, currentProviderId]
              properties:
                intent:
                  type: object
                  example:
                    service_type: ac_technician
                    urgency: medium
                    budget_preference: standard
                    preferred_time: evening
                currentProviderId:
                  type: string
                  example: 682b6d5e8b8c4d0012345678
      responses:
        '200':
          description: Reroute successful
        '404':
          description: No alternative provider found
        '401':
          description: Unauthorized
        '500':
          description: Server error

  /api/provider-analytics/{id}:
    get:
      summary: Get provider analytics summary
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Analytics returned
        '401':
          description: Unauthorized
        '500':
          description: Server error
```

---

## Endpoint Details

## 1. `POST /api/auth/signup`

Creates a new user account.

Example request:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "customer",
  "name": "Ali Khan"
}
```

Example response:

```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "682b6d5e8b8c4d0012345678",
    "email": "user@example.com",
    "name": "Ali Khan",
    "role": "customer"
  }
}
```

## 2. `POST /api/auth/login`

Authenticates a user and returns a JWT.

Example request:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Example response:

```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "682b6d5e8b8c4d0012345678",
    "email": "user@example.com",
    "name": "Ali Khan",
    "role": "customer",
    "location": {
      "latitude": 33.6844,
      "longitude": 73.0479,
      "address": "Islamabad"
    }
  }
}
```

## 3. `GET /api/user/me`

Returns the currently authenticated user.

## 4. `POST /api/user/location`

Updates the authenticated user's location.

Example request:

```json
{
  "location": {
    "latitude": 33.6844,
    "longitude": 73.0479,
    "address": "F-8 Markaz, Islamabad"
  }
}
```

## 5. `POST /api/chat`

Main AI workflow endpoint. It:

- parses user intent
- matches providers
- generates dynamic pricing
- returns a simulated booking receipt

Example request:

```json
{
  "message": "Mujhe kal subah plumber chahiye",
  "city": "Islamabad",
  "location": {
    "lat": 33.6844,
    "lng": 73.0479
  }
}
```

Typical response fields:

- `intent`
- `recommendations`
- `quote`
- `receipt`
- `traces`

## 6. `GET /api/chat/traces`

Returns the latest 50 stored agent traces from MongoDB.

## 7. `GET /api/history`

Returns bookings where the authenticated user is either:

- `customerId`
- `providerId`

## 8. `POST /api/confirm`

Confirms a booking and creates a booking record. If the provider has an overlapping booking window, the code may automatically reschedule by one hour.

## 9. `POST /api/complete`

Completes the service workflow and records feedback through the workflow agent.

Example request:

```json
{
  "bookingId": "BKG-123456",
  "feedback": "Work completed successfully",
  "rating": 5
}
```

## 10. `POST /api/dispute`

Sends booking context and complaint text to the dispute agent for automated resolution.

Typical response fields:

- `success`
- `resolution`
- `reasoning`
- `action_details`
- `confidence_score`

## 11. `POST /api/simulate-cancel`

Simulates provider cancellation and attempts rerouting to the next best provider.

Typical response fields:

- `provider`
- `quote`
- `receipt`

## 12. `GET /api/provider-analytics/:id`

Returns a simulated provider analytics summary with:

- `workload`
- `fair_earning_index`
- `demand_forecast`
- `recommended_slots`
- `growth_tip`

---

## Notes And Observations

- Route mounting is defined in `index.js`.
- Booking routes are mounted at `/api`, not `/api/bookings`.
- `JWT_SECRET` falls back to `antigravity_secret` if not provided, but this should be overridden in production.
- `MONGODB_URI` falls back to `mongodb://localhost:27017/ai-seekho`.
- `POST /api/chat` and several booking-related responses are partly AI-generated, so exact response content can vary.
- Gemini-backed functionality will fail or degrade if `GEMINI_API_KEY` is missing.

## Source Files Used

- `index.js`
- `package.json`
- `config/db.js`
- `config/gemini.js`
- `middleware/auth.js`
- `routes/*.js`
- `controllers/*.js`
- `services/*.js`
- `models/*.js`
- `seed.js`
