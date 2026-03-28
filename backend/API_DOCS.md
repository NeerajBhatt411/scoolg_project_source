# 📚 SCOOLG - API DOCUMENTATION

This file contains all the API endpoints for the Scoolg School Management Platform. Base URL for local development: `http://localhost:5001/api`

## 1. Onboarding APIs

### A. Start Onboarding (Step 1 - Email Verify)
Initializes a draft profile and sends an OTP to the school's email.
- **Endpoint:** `/onboarding/start`
- **Method:** `POST`
- **Body:**
  ```json
  { "email": "school@example.com" }
  ```
- **Response (200 OK):**
  ```json
  { 
    "message": "OTP Sent", 
    "schoolId": "172...", 
    "currentStep": 1,
    "formData": { ... } 
  }
  ```

---

### B. Verify OTP (Injected in Start for now)
Verifies the 6-digit code.
- **Endpoint:** `/onboarding/verify-otp`
- **Method:** `POST`
- **Body:**
  ```json
  { "email": "school@example.com", "otp": "123456" }
  ```
- **Response:** `200 OK` or `401 Unauthorized`.

---

### C. Update Draft (Step-by-Step Save)
Used during Steps 2 to 7 to autosave data.
- **Endpoint:** `/onboarding/update/:schoolId`
- **Method:** `PATCH`
- **Body:**
  ```json
  { 
    "formData": { "schoolName": "St. John", "city": "Noida" },
    "currentStep": 3
  }
  ```

---

### D. Get Profile (Data for Template)
Fetches fully merged data to render on the generated website.
- **Endpoint:** `/onboarding/:id`
- **Method:** `GET`

---

## 2. Future APIs (In-Progress)
- `POST /media/upload` - Logic for Logos & Gallery (S3 Integration).
- `GET /admin/schools` - Listing of all schools (Super Admin).

---

## 🛠️ Global Headers
- `Content-Type: application/json`
- (Future) `Authorization: Bearer <JWT_TOKEN>`
