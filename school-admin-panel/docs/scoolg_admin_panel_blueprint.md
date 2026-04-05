# 🏫 Scoolg Admin Panel — Updated Feature Blueprint (v2)

> **Removed**: Teacher Salary, Fee Collection/Pending stats, Auto-SMS.  
> **Changed**: Attendance alerts → In-App notification (parent/student app — future).  
> **Deferred**: Fee Management module (entire), Transport, Hostel.

---

## Module 1: 📊 Dashboard (Command Center)

The first screen admin sees. Clean, Apple-style white design with data cards.

### 1.1 Quick Stats Cards (Top Row)
| Card | Data | Source |
|------|------|--------|
| **Total Students** | Active count (e.g., 2,450) | Student collection `status: active` |
| **Total Teachers** | Active staff count (e.g., 48) | Teacher collection `status: active` |
| **Today's Attendance** | Present % (e.g., 94.2%) | Today's attendance records |
| **Total Classes** | Number of classes configured (e.g., 14) | Class collection count |

### 1.2 Quick Action Buttons (Below stats, floating card style)
- **➕ Admit Student** → Opens Student Admission Form
- **➕ Add Teacher** → Opens Teacher Form
- **📢 Send Notice** → Opens Notice Composer
- **📅 View Timetable** → Opens Timetable Page

### 1.3 Today's Snapshot Section
- **Class-wise Attendance Summary**: Small bars showing each class's today attendance %
- **Recent Notices**: Last 3 notices with title, date, priority badge
- **Upcoming Events**: Next 3 events from calendar

### 1.4 Recent Activity Feed (Bottom)
- Last 10 system actions with timestamps:
  - "New student Rahul Kumar admitted to Class 5-A"
  - "Class 8-B timetable updated by Admin"
  - "Notice: PTM on 15 April sent to all parents"

---

## Module 2: 👨‍🎓 Student Management

### 2.1 Student Directory (List View)
- **Columns**: Roll No, Photo, Name, Class-Section, Father's Name, Phone, Status (Active/Inactive), Actions (View/Edit/Delete)
- **Filters**: Class, Section, Status, Gender, Admission Year
- **Search**: Name, Roll No, Father's name, Phone
- **Bulk Actions**: Export Excel, Print, Bulk status change

### 2.2 Add New Student (Admission Form — 4 Steps)

**Step 1 — Personal Details**
| Field | Type | Required |
|-------|------|----------|
| Full Name | Text | ✅ |
| Date of Birth | Date Picker | ✅ |
| Gender | Dropdown (Male/Female/Other) | ✅ |
| Blood Group | Dropdown | ❌ |
| Aadhar Number | Text (12 digits) | ❌ |
| Religion | Text | ❌ |
| Category | Dropdown (General/OBC/SC/ST) | ❌ |
| Nationality | Text (default: Indian) | ❌ |
| Student Photo | Image Upload | ✅ |

**Step 2 — Parent/Guardian Info**
| Field | Type | Required |
|-------|------|----------|
| Father's Name | Text | ✅ |
| Father's Phone | Phone | ✅ |
| Father's Occupation | Text | ❌ |
| Mother's Name | Text | ✅ |
| Mother's Phone | Phone | ❌ |
| Guardian Name | Text | ❌ |
| Guardian Phone | Phone | ❌ |
| Emergency Contact | Phone | ✅ |

**Step 3 — Academic Details**
| Field | Type | Required |
|-------|------|----------|
| Admission Date | Date | ✅ |
| Admission Class | Dropdown (Nursery–12th) | ✅ |
| Section | Dropdown (A, B, C, D) | ✅ |
| Roll Number | Auto or Manual | ✅ |
| Previous School | Text | ❌ |
| TC Number | Text | ❌ |

**Step 4 — Address**
| Field | Type | Required |
|-------|------|----------|
| Address Line 1 | Text | ✅ |
| Address Line 2 | Text | ❌ |
| City | Text | ✅ |
| State | Text | ✅ |
| Pin Code | Number (6 digits) | ✅ |

### 2.3 Student Profile (Detail View — Tabs)
- **📋 Personal**: All personal + parent info (editable)
- **📚 Academic**: Current class, admission history, past classes
- **📊 Attendance**: Monthly calendar, total %, absent days
- **📝 Exam Results**: Subject-wise marks per exam
- **📄 Documents**: Uploaded files (TC, Birth Cert, Aadhar)

### 2.4 Edit / Status Management
| Action | Effect |
|--------|--------|
| **Edit** | Update any field |
| **Mark Inactive** | Removed from active lists, data preserved |
| **Mark Active** | Re-appears in all modules |
| **Delete** | Soft delete (hidden, data stays) |
| **Generate TC** | PDF with school letterhead |

### 2.5 Class Promotion (Yearly 🔥)
- Select class → See all students
- **"Promote All"** → Move to next class
- Individual override: Detained / Promoted
- Section reassignment during promotion
- Previous year archived

### 2.6 Section Transfer
- Move student between sections in same class
- Roll number update optional

---

## Module 3: 👩‍🏫 Teacher & Staff Management

> **Note**: Salary/Payroll removed. Only profile and academic assignment management.

### 3.1 Teacher Directory
- **Columns**: Photo, Name, Employee ID, Subject(s), Assigned Classes, Phone, Status, Actions
- **Filters**: Subject, Class, Status
- **Search**: Name, ID, Phone

### 3.2 Add New Teacher
| Field | Type | Required |
|-------|------|----------|
| Full Name | Text | ✅ |
| Employee ID | Auto-generated | ✅ |
| Phone | Phone | ✅ |
| Email | Email | ✅ |
| Photo | Image Upload | ✅ |
| Date of Joining | Date | ✅ |
| Qualification | Text | ✅ |
| Specialization | Text | ❌ |
| Experience (Years) | Number | ❌ |
| Address | Text | ✅ |
| Aadhar | Text | ❌ |

### 3.3 Subject & Class Allocation
- Assign subjects + classes to teacher
- Example: "Mrs. Sharma → Math → Class 5A, 5B, 6A"
- Feeds into Timetable module

### 3.4 Teacher Profile (Tabs)
- **📋 Personal**: All details (editable)
- **📚 Assignments**: Classes & subjects
- **📅 Timetable**: Personal weekly schedule
- **📊 Attendance**: Their own attendance record

### 3.5 Edit / Deactivate / Delete
- Same logic as students: Edit, Soft deactivate, Soft delete

---

## Module 4: 🏛️ Class & Section Management

### 4.1 Class List
- All classes (Nursery → 12th)
- Shows: Sections count, Total students, Class teacher

### 4.2 Add / Edit Class
| Field | Type |
|-------|------|
| Class Name | Text |
| Sections | Multi-add (A, B, C...) |
| Class Teacher | Dropdown (active teachers) |
| Max Students per Section | Number |

### 4.3 Section Management
- Add/remove sections
- View section-wise student count
- Assign section teacher

### 4.4 Subjects per Class
- Define subjects for each class
- Mark as Mandatory / Optional
- Feeds into Timetable + Exams

---

## Module 5: 📅 Timetable Management

### 5.1 School Timing Config
| Setting | Example |
|---------|---------|
| School Start Time | 8:00 AM |
| School End Time | 2:30 PM |
| Period Duration | 40 min |
| Number of Periods | 8 |
| Breaks | After Period 4 (Lunch 30 min), Period 6 (Short 15 min) |
| Working Days | Mon–Sat |

### 5.2 Auto-generated Period Slots
System auto-creates time slots based on config above.

### 5.3 Class-wise Timetable Builder
- Select Class-Section → Assign Subject + Teacher per period per day
- **Conflict Detection**: 🔴 Error if teacher double-booked
- Visual grid (Day × Period)

### 5.4 Teacher-wise View
- Select teacher → See their weekly schedule
- Identify free periods

### 5.5 Export
- Print class timetable (PDF)
- Print teacher schedule (PDF)

---

## Module 6: ✅ Attendance Management

### 6.1 Mark Attendance
- Select Class + Section + Date
- Student list appears
- Mark: **Present / Absent / Late / Half-Day**
- "Mark All Present" quick button
- Submit saves to DB

### 6.2 Attendance Alerts (Future — In-App)
> [!IMPORTANT]
> **Not SMS**. Alerts will appear in the **Student/Parent App** (when built).
> - Parent opens app → Sees notification: "Your child [Name] was absent today"
> - Logic is saved in backend, delivery channel is app push notification (future)

### 6.3 Attendance Dashboard
- **Today**: X Present, Y Absent, Z Late (%)
- **Class-wise**: Lowest attendance class highlighted
- **Trend**: Last 30 days line chart

### 6.4 Student Attendance Report
- Monthly calendar: Green/Red/Yellow/Gray
- Total working days, present, absent, %
- Auto-flag below 75% students

### 6.5 Teacher Attendance
- Same system for staff
- Monthly report

---

## Module 7: 📝 Exam & Result Management

### 7.1 Exam Setup
| Field | Type |
|-------|------|
| Exam Name | Text (e.g., "Mid-Term 2025") |
| Exam Type | Unit Test / Semester / Annual |
| Start & End Date | Date |
| Applicable Classes | Multi-select |

### 7.2 Marks Entry
- Select Exam → Class-Section → Subject
- Enter marks per student (Obtained / Total)
- Or enter Grade (A+, A, B+...)
- Submit → Lock (admin can unlock for edit)

### 7.3 Auto Result Generation
- Total, Percentage, Grade, Rank auto-calculated
- Pass/Fail based on minimum marks config
- **PDF Report Card**: School logo, student info, marks table, remarks

### 7.4 Result Dashboard
- Class toppers (Top 3)
- Subject-wise average (bar chart)
- Pass/Fail ratio (pie chart)

---

## Module 8: 📢 Notices & Communication

### 8.1 Notice Board
| Field | Type |
|-------|------|
| Title | Text |
| Message | Rich Text |
| Audience | All / Specific Classes / Teachers Only |
| Attachment | Image / PDF |
| Priority | Normal / Important / Urgent |
| Publish Date | Date (schedule future) |
| Expiry Date | Date (auto-hide) |

### 8.2 Event Calendar
- Add events (Annual Day, PTM, Sports Day, Holidays)
- Monthly calendar view
- Auto-show on Dashboard

### 8.3 Circulars
- Target specific class parents
- Delivery: In-app notification (future)

### 8.4 Holiday Calendar
- Pre-define all holidays
- Auto-skip in attendance module

---

## Module 9: 🔐 User Roles & Permissions

### 9.1 Default Roles
| Role | Access |
|------|--------|
| **Super Admin** | Everything |
| **Principal** | All except user management |
| **Teacher** | Own class: attendance, marks, timetable view |
| **Receptionist** | Student admission, parent queries |

### 9.2 Custom Roles
- Create role → Toggle permissions per module (View/Add/Edit/Delete)

### 9.3 Activity Logs
- WHO did WHAT at WHEN
- Searchable audit trail

---

## Module 10: ⚙️ School Settings

### 10.1 School Profile
- Name, Logo, Address, Contact, Board, Affiliation No.

### 10.2 Academic Year
- Create/switch years (2025-26, 2026-27)
- Year-specific data (attendance, exams)
- Previous years read-only

### 10.3 Notification Config (Future)
- App push notification settings
- Toggle which alerts are active

### 10.4 Report Customization
- Upload letterhead
- Customize report card format
- Set grading scale

---

## 🗂️ Implementation Phases

| Phase | Modules | Status |
|-------|---------|--------|
| **Phase 1** | Class & Section Setup, Student CRUD, Teacher CRUD | 🔴 Start Here |
| **Phase 2** | Timetable Builder, Attendance System | 🟡 Next |
| **Phase 3** | Exams & Results, Notices & Events | 🟠 After Phase 2 |
| **Phase 4** | Roles & Permissions, School Settings | 🟢 Polish |
| **Future** | Fee Management, In-App Alerts, Parent App | 🔵 Deferred |

---

> [!TIP]
> **Dashboard** will be built last because it aggregates data from all other modules. We'll start with a clean placeholder and progressively add real stats as each module is completed.
