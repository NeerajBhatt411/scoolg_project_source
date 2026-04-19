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

## 2. Student Mobile App APIs
These endpoints are dedicated strictly to the Student Mobile/Web Portal.

### A. Verify School Code
Checks if the School Code matches any school and returns branding details.
- **Endpoint:** `/api/student/verify-campus/:code`
- **Method:** `GET`
- **Response (200 OK):**
  ```json
  {
    "schoolId": "65e...",
    "schoolName": "St. Andrews School",
    "logo": "https://..."
  }
  ```

---

### B. Student Login
Authenticates a student using their unique ID and Password (default: DOB).
- **Endpoint:** `/api/student/login`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "studentAppId": "gaj40001001",
    "password": "DDMMYYYY"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "JWT_TOKEN_HERE",
    "studentId": "65f..."
  }
  ```

---

### C. Get Student Profile
Fetches the authenticated student's data and school branding info.
- **Endpoint:** `/api/student/me`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Response (200 OK):**
  ```json
  {
    "student": { "firstName": "Rahul", "class": "10", ... },
    "school": { "name": "St. Andrews", "logo": "..." }
  }
  ```

---

## 3. Future APIs (In-Progress)
- `POST /media/upload` - Logic for Logos & Gallery (S3 Integration).
- `GET /admin/schools` - Listing of all schools (Super Admin).

---

## 🛠️ Global Headers
- `Content-Type: application/json`
- `Authorization: Bearer <JWT_TOKEN>` (For Admin & Student 'me' routes)
