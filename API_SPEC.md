# 🚀 Scoolg Student ERP - API Specification

This document outlines the API endpoints required for the Scoolg Student Mobile/Web App.

## 📌 Base URL
- **Local Development**: `http://localhost:5001`
- **Swagger Docs (UI)**: `http://localhost:5001/api-docs`

---

## 🔐 Authentication Overview
The API uses **JWT (JSON Web Tokens)** for authentication.
- **Access Token**: Short-lived (1 day), used for all protected requests.
- **Refresh Token**: Long-lived (30 days), used to generate new access tokens without re-login.

### Required Headers
For all protected routes (marked with 🔒), you **must** include the following header:
`Authorization: Bearer <YOUR_ACCESS_TOKEN>`

---

## 🏢 Campus Verification
Before logging in, the app must verify the school campus code.

### 1. Verify Campus Code
- **Endpoint**: `GET /api/student/verify-campus/:code`
- **Description**: Checks if a school code (e.g., `GAJ1561`) exists and returns branding info.

**Success Response (200 OK)**:
```json
{
  "schoolId": "1774719455432",
  "schoolName": "Gajera International School",
  "logo": "https://res.cloudinary.com/..."
}
```

---

## 🔑 User Authentication

### 2. Student Login
- **Endpoint**: `POST /api/student/login`
- **Body**:
```json
{
  "studentAppId": "sch1001",
  "password": "your_dob_ddmmyyyy"
}
```

**Success Response (200 OK)**:
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "studentId": "69c811df12..."
}
```

### 3. Refresh Access Token
- **Endpoint**: `POST /api/auth/refresh`
- **Description**: Generate a new access token using a refresh token.
- **Body**:
```json
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

---

## 👤 Student Data (Protected 🔒)

### 4. Get Student Profile
- **Endpoint**: `GET /api/student/me`
- **Headers**: `Authorization: Bearer <token>`

**Success Response (200 OK)**:
```json
{
  "student": {
    "firstName": "Neeraj",
    "lastName": "Bhatt",
    "class": "10",
    "section": "A",
    "studentAppId": "sch1001"
  },
  "school": {
    "name": "Gajera International School",
    "logo": "..."
  }
}
```

---

## 📅 Academic Records (Protected 🔒)

### 5. Get Attendance List
- **Endpoint**: `GET /api/student/attendance`
- **Description**: Returns a history of attendance statuses.

**Success Response (200 OK)**:
```json
[
  { "date": "2024-05-10", "status": "Present" },
  { "date": "2024-05-09", "status": "Absent" }
]
```

### 6. Get Timetable
- **Endpoint**: `GET /api/student/timetable`
- **Description**: Returns the weekly class schedule for the student's class and section.

**Success Response (200 OK)**:
```json
{
  "className": "10",
  "sectionName": "A",
  "schedule": {
    "Monday": [
      { "subject": "Math", "time": "08:00 AM", "teacher": "Mr. Sharma" }
    ]
  }
}
```

---

## 🛠️ Error Codes
| Status Code | Description |
|---|---|
| 400 | Bad Request (Missing fields) |
| 401 | Unauthorized (Invalid Token or Credentials) |
| 404 | Not Found (Invalid ID or School Code) |
| 500 | Server Error |
