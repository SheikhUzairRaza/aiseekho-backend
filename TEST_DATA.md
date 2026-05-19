# API Test Data

This file contains ready-to-use test data for all APIs in this project.

Base URL:

```txt
http://localhost:3000
```

Swagger UI:

```txt
http://localhost:3000/api-docs
```

## Before Testing

Start the project:

```bash
npm install
npm run dev
```

Make sure `.env` contains:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ai-seekho
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MAX_TOKENS=1500
```

Optional provider seed:

```bash
node seed.js
```

## Test Flow Order

Use this order for best results:

1. `POST /api/auth/signup`
2. `POST /api/auth/login`
3. `GET /api/user/me`
4. `POST /api/user/location`
5. `POST /api/chat`
6. `GET /api/chat/traces`
7. `POST /api/confirm`
8. `GET /api/history`
9. `POST /api/complete`
10. `POST /api/dispute`
11. `POST /api/simulate-cancel`
12. `GET /api/provider-analytics/:id`

## Reusable Test Values

Customer signup/login:

```json
{
  "email": "customer1@example.com",
  "password": "password123",
  "role": "customer",
  "name": "Ali Khan"
}
```

Provider signup/login:

```json
{
  "email": "provider1@example.com",
  "password": "password123",
  "role": "provider",
  "name": "Ahmed Repair"
}
```

Location payload:

```json
{
  "location": {
    "latitude": 33.6844,
    "longitude": 73.0479,
    "address": "F-8 Markaz, Islamabad"
  }
}
```

Bearer token placeholder:

```txt
Bearer <PASTE_JWT_TOKEN_HERE>
```

Provider ID placeholder:

```txt
<PASTE_PROVIDER_ID_HERE>
```

Booking ID placeholder:

```txt
<PASTE_BOOKING_ID_HERE>
```

---

## 1. `POST /api/auth/signup`

Purpose:

- creates a new user
- returns JWT token

Customer test body:

```json
{
  "email": "customer1@example.com",
  "password": "password123",
  "role": "customer",
  "name": "Ali Khan"
}
```

Provider test body:

```json
{
  "email": "provider1@example.com",
  "password": "password123",
  "role": "provider",
  "name": "Ahmed Repair"
}
```

Example curl:

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"customer1@example.com\",\"password\":\"password123\",\"role\":\"customer\",\"name\":\"Ali Khan\"}"
```

Expected result:

- `success: true`
- `token`
- `user.id`

## 2. `POST /api/auth/login`

Purpose:

- logs user in
- returns JWT token for protected APIs

Test body:

```json
{
  "email": "customer1@example.com",
  "password": "password123"
}
```

Example curl:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"customer1@example.com\",\"password\":\"password123\"}"
```

Expected result:

- `success: true`
- `token`
- `user.role`

## 3. `GET /api/user/me`

Purpose:

- fetches currently authenticated user

Headers:

```http
Authorization: Bearer <token>
```

Example curl:

```bash
curl http://localhost:3000/api/user/me \
  -H "Authorization: Bearer <PASTE_JWT_TOKEN_HERE>"
```

Expected result:

- `success: true`
- `user.email`
- `user.role`

## 4. `POST /api/user/location`

Purpose:

- updates current user location

Test body:

```json
{
  "location": {
    "latitude": 33.6844,
    "longitude": 73.0479,
    "address": "F-8 Markaz, Islamabad"
  }
}
```

Example curl:

```bash
curl -X POST http://localhost:3000/api/user/location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PASTE_JWT_TOKEN_HERE>" \
  -d "{\"location\":{\"latitude\":33.6844,\"longitude\":73.0479,\"address\":\"F-8 Markaz, Islamabad\"}}"
```

Expected result:

- `success: true`
- `location.address`

## 5. `POST /api/chat`

Purpose:

- parses service request
- matches providers
- returns pricing and simulated receipt

Test body 1:

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

Test body 2:

```json
{
  "message": "AC kharab hai, technician bhej do",
  "city": "Lahore",
  "location": {
    "lat": 31.5204,
    "lng": 74.3587
  }
}
```

Test body 3:

```json
{
  "message": "Mujhe sham ko electrician chahiye, budget thora kam hai",
  "city": "Karachi",
  "location": {
    "lat": 24.8607,
    "lng": 67.0011
  }
}
```

Example curl:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PASTE_JWT_TOKEN_HERE>" \
  -d "{\"message\":\"Mujhe kal subah plumber chahiye\",\"city\":\"Islamabad\",\"location\":{\"lat\":33.6844,\"lng\":73.0479}}"
```

Expected result:

- `success: true`
- `intent.service_type`
- `recommendations`
- `quote.final_price`
- `receipt.booking_id`

Important:

- save `recommendations[0].id` as provider ID for booking tests
- save `receipt.booking_id` if you want to reuse it in later tests

## 6. `GET /api/chat/traces`

Purpose:

- returns latest 50 workflow traces

Example curl:

```bash
curl http://localhost:3000/api/chat/traces \
  -H "Authorization: Bearer <PASTE_JWT_TOKEN_HERE>"
```

Expected result:

- `success: true`
- `traces`

## 7. `POST /api/confirm`

Purpose:

- confirms booking
- creates booking record
- may auto-reschedule if provider is already booked

Test body:

```json
{
  "providerId": "<PASTE_PROVIDER_ID_HERE>",
  "serviceType": "plumber",
  "amount": 2500,
  "scheduledWindow": "Today, 02:00 PM - 03:00 PM",
  "startTime": "2026-05-20T14:00:00.000Z"
}
```

Alternative AC body:

```json
{
  "providerId": "<PASTE_PROVIDER_ID_HERE>",
  "serviceType": "ac_technician",
  "amount": 3500,
  "scheduledWindow": "Today, 04:00 PM - 05:00 PM",
  "startTime": "2026-05-20T16:00:00.000Z"
}
```

Example curl:

```bash
curl -X POST http://localhost:3000/api/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PASTE_JWT_TOKEN_HERE>" \
  -d "{\"providerId\":\"<PASTE_PROVIDER_ID_HERE>\",\"serviceType\":\"plumber\",\"amount\":2500,\"scheduledWindow\":\"Today, 02:00 PM - 03:00 PM\",\"startTime\":\"2026-05-20T14:00:00.000Z\"}"
```

Expected result:

- `success: true`
- `receipt.booking_id`
- `receipt.status`
- `rescheduled`

## 8. `GET /api/history`

Purpose:

- returns authenticated user booking history

Example curl:

```bash
curl http://localhost:3000/api/history \
  -H "Authorization: Bearer <PASTE_JWT_TOKEN_HERE>"
```

Expected result:

- `success: true`
- `bookings`

## 9. `POST /api/complete`

Purpose:

- completes booking flow
- submits feedback and rating

Test body:

```json
{
  "bookingId": "<PASTE_BOOKING_ID_HERE>",
  "feedback": "Technician arrived on time and fixed the issue properly.",
  "rating": 5
}
```

Negative-quality test body:

```json
{
  "bookingId": "<PASTE_BOOKING_ID_HERE>",
  "feedback": "Provider came late but work was eventually completed.",
  "rating": 3
}
```

Example curl:

```bash
curl -X POST http://localhost:3000/api/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PASTE_JWT_TOKEN_HERE>" \
  -d "{\"bookingId\":\"<PASTE_BOOKING_ID_HERE>\",\"feedback\":\"Technician arrived on time and fixed the issue properly.\",\"rating\":5}"
```

Expected result:

- `success: true`
- `message`
- `checklist`
- `impact`

## 10. `POST /api/dispute`

Purpose:

- sends dispute to dispute agent

Test body 1:

```json
{
  "booking": {
    "booking_id": "<PASTE_BOOKING_ID_HERE>",
    "provider_name": "Ahmed Electrician",
    "service": "electrician",
    "total_amount": 2800,
    "status": "completed"
  },
  "complaint": "The provider charged extra and did not fully complete the work."
}
```

Test body 2:

```json
{
  "booking": {
    "booking_id": "<PASTE_BOOKING_ID_HERE>",
    "provider_name": "Ali Plumber",
    "service": "plumber",
    "total_amount": 2500,
    "status": "completed"
  },
  "complaint": "Provider arrived very late and the leakage returned after two hours."
}
```

Example curl:

```bash
curl -X POST http://localhost:3000/api/dispute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PASTE_JWT_TOKEN_HERE>" \
  -d "{\"booking\":{\"booking_id\":\"<PASTE_BOOKING_ID_HERE>\",\"provider_name\":\"Ahmed Electrician\",\"service\":\"electrician\",\"total_amount\":2800,\"status\":\"completed\"},\"complaint\":\"The provider charged extra and did not fully complete the work.\"}"
```

Expected result:

- `success: true`
- `resolution`
- `reasoning`
- `action_details`
- `confidence_score`

## 11. `POST /api/simulate-cancel`

Purpose:

- simulates provider cancellation
- reroutes to next best provider

Test body:

```json
{
  "intent": {
    "service_type": "plumber",
    "urgency": "medium",
    "budget_preference": "standard",
    "preferred_time": "morning"
  },
  "currentProviderId": "<PASTE_PROVIDER_ID_HERE>"
}
```

Alternative body:

```json
{
  "intent": {
    "service_type": "ac_technician",
    "urgency": "high",
    "budget_preference": "low",
    "preferred_time": "evening"
  },
  "currentProviderId": "<PASTE_PROVIDER_ID_HERE>"
}
```

Example curl:

```bash
curl -X POST http://localhost:3000/api/simulate-cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PASTE_JWT_TOKEN_HERE>" \
  -d "{\"intent\":{\"service_type\":\"plumber\",\"urgency\":\"medium\",\"budget_preference\":\"standard\",\"preferred_time\":\"morning\"},\"currentProviderId\":\"<PASTE_PROVIDER_ID_HERE>\"}"
```

Expected result:

- `success: true`
- `provider`
- `quote`
- `receipt`

## 12. `GET /api/provider-analytics/:id`

Purpose:

- returns provider analytics summary

Example curl:

```bash
curl http://localhost:3000/api/provider-analytics/<PASTE_PROVIDER_ID_HERE> \
  -H "Authorization: Bearer <PASTE_JWT_TOKEN_HERE>"
```

Expected result:

- `providerId`
- `workload`
- `fair_earning_index`
- `demand_forecast`
- `recommended_slots`
- `growth_tip`

---

## Postman Testing Tips

- First call `signup` or `login`.
- Copy the returned `token`.
- Add it to protected requests as `Bearer <token>`.
- Use `/api/chat` first to discover a realistic provider.
- Copy `recommendations[0].id` into `/api/confirm`.
- Copy `receipt.booking_id` into `/api/complete` and `/api/dispute`.

## Common Failure Cases

- `401 Not authorized, no token`: missing bearer token
- `401 Not authorized, token failed`: invalid or expired token
- `400 Message is required`: missing `message` in `/api/chat`
- `404 No alternative provider found`: no reroute candidate in `/api/simulate-cancel`
- `500`: MongoDB, Gemini, or malformed input issue

## Quick Minimal End-To-End Data Set

Use these values for one simple test run:

```json
{
  "signup": {
    "email": "customer1@example.com",
    "password": "password123",
    "role": "customer",
    "name": "Ali Khan"
  },
  "login": {
    "email": "customer1@example.com",
    "password": "password123"
  },
  "location": {
    "location": {
      "latitude": 33.6844,
      "longitude": 73.0479,
      "address": "F-8 Markaz, Islamabad"
    }
  },
  "chat": {
    "message": "Mujhe kal subah plumber chahiye",
    "city": "Islamabad",
    "location": {
      "lat": 33.6844,
      "lng": 73.0479
    }
  },
  "confirm": {
    "providerId": "<provider id from chat>",
    "serviceType": "plumber",
    "amount": 2500,
    "scheduledWindow": "Today, 02:00 PM - 03:00 PM",
    "startTime": "2026-05-20T14:00:00.000Z"
  },
  "complete": {
    "bookingId": "<booking id from confirm>",
    "feedback": "Technician arrived on time and fixed the issue properly.",
    "rating": 5
  },
  "dispute": {
    "booking": {
      "booking_id": "<booking id from confirm>",
      "provider_name": "Ali Plumber",
      "service": "plumber",
      "total_amount": 2500,
      "status": "completed"
    },
    "complaint": "Provider arrived late and left some work unfinished."
  },
  "simulateCancel": {
    "intent": {
      "service_type": "plumber",
      "urgency": "medium",
      "budget_preference": "standard",
      "preferred_time": "morning"
    },
    "currentProviderId": "<provider id from chat>"
  }
}
```
