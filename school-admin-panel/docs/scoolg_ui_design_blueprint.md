# 🎨 Scoolg Admin Panel — Complete UI/Design Blueprint

> Screen-by-screen visual specification. Every element, every pixel, every interaction described.

---

## 🎯 Global Design System

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#2563eb` | Buttons, active states, links |
| `--primary-hover` | `#1d4ed8` | Button hover |
| `--primary-light` | `#eff6ff` | Primary backgrounds, badges |
| `--success` | `#22c55e` | Active status, present |
| `--success-light` | `#f0fdf4` | Success backgrounds |
| `--warning` | `#f59e0b` | Late, pending |
| `--warning-light` | `#fffbeb` | Warning backgrounds |
| `--danger` | `#ef4444` | Absent, delete, errors |
| `--danger-light` | `#fef2f2` | Danger backgrounds |
| `--bg` | `#f8fafc` | Page background |
| `--surface` | `#ffffff` | Cards, modals |
| `--text` | `#0f172a` | Headings, primary text |
| `--text-secondary` | `#64748b` | Labels, descriptions |
| `--text-muted` | `#94a3b8` | Placeholders, hints |
| `--border` | `#e2e8f0` | Card borders, dividers |
| `--sidebar-bg` | `#ffffff` | White sidebar |
| `--sidebar-border` | `#e0e7ff` | Soft bluish border-right (1.5px) |
| `--sidebar-text` | `#64748b` | Inactive nav text (gray) |
| `--sidebar-active-bg` | `#eff6ff` | Active nav item bg (light blue) |
| `--sidebar-active-text` | `#2563eb` | Active nav item text (blue) |

### Typography (Plus Jakarta Sans)
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page Title (h1) | 28px | 800 (Extra Bold) | `--text` |
| Section Title (h2) | 20px | 700 (Bold) | `--text` |
| Card Title (h3) | 16px | 700 | `--text` |
| Body Text | 14px | 500 | `--text` |
| Label / Caption | 12px | 600 | `--text-secondary` |
| Small / Badge | 11px | 700 | varies |

### Spacing Scale
| Name | Value | Usage |
|------|-------|-------|
| xs | 4px | Icon gaps |
| sm | 8px | Inner padding |
| md | 16px | Card internal spacing |
| lg | 24px | Between sections |
| xl | 32px | Page padding |
| 2xl | 48px | Major separations |

### Component Library
| Component | Specs |
|-----------|-------|
| **Card** | White bg, 1px `--border`, border-radius 20px, padding 24px, shadow: `0 1px 3px rgba(0,0,0,0.04)` |
| **Button (Primary)** | bg `--primary`, white text, 14px weight 700, padding 12px 24px, radius 12px, hover: translateY(-1px) + deeper shadow |
| **Button (Secondary)** | White bg, 1px `--border`, `--text` color, same sizing |
| **Button (Danger)** | bg `--danger`, white text |
| **Input Field** | Height 48px, padding 12px 16px, radius 12px, border 1.5px `--border`, focus: border `--primary` + blue glow |
| **Dropdown** | Same as input, with chevron-down icon right |
| **Badge** | Padding 4px 10px, radius 20px, font 11px weight 700 |
| **Avatar** | 40px circle (list), 80px circle (profile), object-fit cover |
| **Table Row** | Height 56px, hover: bg `#f8fafc`, border-bottom 1px `--border` |
| **Modal** | Centered, max-width 600px, radius 24px, bg white, overlay `rgba(0,0,0,0.4)` + backdrop-blur |
| **Tab** | Underline style, active: `--primary` color + 2px bottom border |
| **Toast/Snackbar** | Bottom-right, radius 12px, auto-dismiss 4s |

---

## 📐 Persistent Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER WINDOW                        │
├──────────┬──────────────────────────────────────────────┤
│          │  HEADER BAR (h: 72px, sticky top)            │
│          │  ┌─────────────────────────────────────────┐ │
│          │  │ Page Title    🔍 Search     🔔  👤 Admin│ │
│          │  └─────────────────────────────────────────┘ │
│ SIDEBAR  │──────────────────────────────────────────────│
│ (280px)  │                                              │
│          │  CONTENT AREA                                │
│ White bg │  (padding: 32px)                             │
│ #ffffff  │  (bg: #f8fafc)                               │
│ blue-rgt │  (overflow-y: auto)                          │
│ border   │                                              │
│          │                                              │
│ Logo     │  ┌────────────────────────────────────┐      │
│ Nav Items│  │  PAGE SPECIFIC CONTENT              │      │
│ ...      │  │  (Cards, Tables, Forms, etc.)       │      │
│          │  │                                     │      │
│ User     │  └────────────────────────────────────┘      │
│ Logout   │                                              │
├──────────┴──────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────┘
```

### Sidebar Detail
```
┌──────────────────┤  ← Right edge: 1.5px solid #e0e7ff (bluish line)
│                  │
│  🛡️ SCOOLG       │  ← Logo (blue icon) + brand text (dark, 800wt)
│  School ERP      │     padding: 24px
│                  │
│  ─── MENU ───    │  ← Label: 11px, #94a3b8, uppercase, tracking 1px
│                  │
│  📊 Dashboard    │  ← ACTIVE:  bg #eff6ff, text #2563eb, weight 700
│  👨‍🎓 Students     │  ← INACTIVE: text #64748b, weight 500
│  👩‍🏫 Teachers     │  ← HOVER:   bg #f8fafc, text #0f172a
│  🏛️ Classes      │
│  📅 Timetable    │     Nav item: padding 12px 16px, radius 12px
│  ✅ Attendance   │     Icon: 20px, gap 12px from text
│  📝 Exams        │
│  📢 Notices      │
│                  │
│  ─── SYSTEM ──── │
│  🔐 Roles        │
│  ⚙️ Settings     │
│                  │
│  ┌────────────┐  │
│  │ 🟦 School  │  │ ← Avatar (gradient blue) + school name (14px, 700)
│  │   Name     │  │                          + "Active Plan" (12px, gray)
│  │   Active   │  │
│  └────────────┘  │
│                  │
│  ❓ Support      │ ← text #64748b, hover: text #0f172a
│  🚪 Logout       │ ← text #ef4444, hover: bg #fef2f2
└──────────────────┘

Sidebar CSS:
  background: #ffffff
  width: 280px
  height: 100vh
  border-right: 1.5px solid #e0e7ff  ← Subtle bluish separator
  padding: 24px
  display: flex
  flex-direction: column
```

### Header Bar Detail
```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  📊 Dashboard                    🔍 ──────────   🔔  👤 │
│  ↑ Page title (28px, 800wt)      ↑ Search bar    ↑  ↑   │
│                                  (w: 300px)   Bell Avatar│
│                                  (radius 12px)           │
└─────────────────────────────────────────────────────────┘
Height: 72px
Background: white
Border-bottom: 1px #e2e8f0
Padding: 0 32px
Display: flex, align-items: center, justify-content: space-between
```

---

## Screen 1: 📊 Dashboard

### Layout
```
┌──────────────────────────────────────────────┐
│ Welcome back, [School Name]!                  │ ← 28px, 800wt
│ Here's what's happening today.               │ ← 14px, --text-secondary
│                                              │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │ 👨‍🎓   │ │ 👩‍🏫   │ │ ✅   │ │ 🏛️   │        │ ← 4 stat cards in a row
│ │2,450 │ │  48  │ │ 94%  │ │  14  │        │
│ │Stud. │ │Teach.│ │Attend│ │Class │        │
│ └──────┘ └──────┘ └──────┘ └──────┘        │
│                                              │
│ ┌────────────────────────────────────────┐   │
│ │ ⚡ Quick Actions                        │   │ ← Card with 4 action buttons
│ │                                        │   │
│ │ [+ Admit Student] [+ Add Teacher]      │   │ ← Primary buttons
│ │ [📢 Send Notice]  [📅 Timetable]       │   │ ← Secondary buttons
│ └────────────────────────────────────────┘   │
│                                              │
│ ┌───────────────────┐ ┌──────────────────┐  │
│ │ 📊 Class Attendance│ │ 📢 Recent Notices│  │ ← 2 cards side by side
│ │ (horizontal bars)  │ │                  │  │
│ │ Class 1: ████ 96% │ │ • PTM on 15 Apr │  │
│ │ Class 2: ███░ 88% │ │ • Holiday: Holi  │  │
│ │ Class 3: ████ 94% │ │ • Sports Day...  │  │
│ │ ...                │ │                  │  │
│ └───────────────────┘ └──────────────────┘  │
│                                              │
│ ┌────────────────────────────────────────┐   │
│ │ 🕐 Recent Activity                     │   │ ← Full width card at bottom
│ │                                        │   │
│ │ 🔵 Rahul Kumar admitted (Class 5-A)    │   │
│ │ 🟢 Class 8-B timetable updated         │   │
│ │ 🟡 PTM notice sent to all parents      │   │
│ └────────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

### Stat Card Detail
```
┌─────────────────────────┐
│  ┌───┐                  │  Height: ~140px
│  │ 🔵│    ← Icon in     │  Padding: 24px
│  │   │    colored bg     │  Radius: 20px
│  └───┘    (48x48, r:14) │  Border: 1px --border
│                          │
│  Total Students  ← 12px, 600wt, --text-secondary, uppercase, tracking 0.5px
│  2,450           ← 32px, 800wt, --text
└─────────────────────────┘
```

---

## Screen 2: 👨‍🎓 Student List

### Layout
```
┌──────────────────────────────────────────────────────┐
│ Student Management                     [+ Add Student]│ ← Title + Primary button
│ Manage all students in your school                    │
│                                                       │
│ ┌─────────────────────────────────────────────────┐  │
│ │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │  │ ← Filter bar inside card
│ │ │Class ▼ │ │Section▼│ │Status ▼│ │Gender ▼│   │  │    (dropdowns)
│ │ └────────┘ └────────┘ └────────┘ └────────┘   │  │
│ │                                                 │  │
│ │ 🔍 Search students...              [Export CSV] │  │ ← Search + export
│ │                                                 │  │
│ │ ┌───┬──────┬─────────┬───────┬────────┬──────┐ │  │
│ │ │ # │Photo │ Name    │Class  │Father  │Status│ │  │ ← Table header (bg #f8fafc)
│ │ ├───┼──────┼─────────┼───────┼────────┼──────┤ │  │
│ │ │ 1 │ 🟦  │Rahul K. │ 5-A   │Suresh  │🟢Act│ │  │ ← Row hover: bg #f8fafc
│ │ │ 2 │ 🟦  │Priya S. │ 5-A   │Ramesh  │🟢Act│ │  │
│ │ │ 3 │ 🟦  │Amit V.  │ 5-B   │Dinesh  │🔴Ina│ │  │ ← Inactive = red badge
│ │ │ ...                                        │ │  │
│ │ └────────────────────────────────────────────┘ │  │
│ │                                                 │  │
│ │     ◀ 1 2 3 4 5 ▶    Showing 1-20 of 2,450    │  │ ← Pagination
│ └─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Table Row Interaction
- **Hover**: Entire row gets `bg: #f8fafc`
- **Click Row**: Opens Student Profile page
- **Actions Column** (right): Three dot menu `⋮` → Edit, View, Change Status, Delete
- **Status Badge**: 
  - Active = Green badge (`bg: #f0fdf4, color: #22c55e`)
  - Inactive = Red badge (`bg: #fef2f2, color: #ef4444`)

---

## Screen 3: 👨‍🎓 Student Admission Form

### Layout (Multi-step wizard)
```
┌──────────────────────────────────────────────────────┐
│ New Student Admission                                 │
│                                                       │
│ ┌─────────────────────────────────────────────────┐  │
│ │  Step Bar (top of card)                          │  │
│ │  ① Personal ─── ② Parents ─── ③ Academic ─── ④ Address │
│ │  🔵 active      ⚪ pending     ⚪ pending      ⚪ pending│
│ │                                                  │  │
│ │  ─────────────────────────────────────────────── │  │
│ │                                                  │  │
│ │  📷 Upload Photo (circular, 100px, dashed border)│  │
│ │                                                  │  │
│ │  ┌──────────────────┐ ┌──────────────────┐      │  │ ← 2-column grid
│ │  │ Full Name *      │ │ Date of Birth *  │      │  │
│ │  │ [____________]   │ │ [📅___________]  │      │  │
│ │  └──────────────────┘ └──────────────────┘      │  │
│ │                                                  │  │
│ │  ┌──────────────────┐ ┌──────────────────┐      │  │
│ │  │ Gender *         │ │ Blood Group      │      │  │
│ │  │ [▼ Select___]    │ │ [▼ Select___]    │      │  │
│ │  └──────────────────┘ └──────────────────┘      │  │
│ │                                                  │  │
│ │  ┌──────────────────┐ ┌──────────────────┐      │  │
│ │  │ Aadhar Number    │ │ Religion         │      │  │
│ │  │ [____________]   │ │ [____________]   │      │  │
│ │  └──────────────────┘ └──────────────────┘      │  │
│ │                                                  │  │
│ │  ┌──────────────────┐ ┌──────────────────┐      │  │
│ │  │ Category         │ │ Nationality      │      │  │
│ │  │ [▼ Select___]    │ │ [Indian_______]  │      │  │
│ │  └──────────────────┘ └──────────────────┘      │  │
│ │                                                  │  │
│ │                        [Back]  [Next Step →]     │  │ ← Footer buttons
│ └─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Step Bar Spec
- Horizontal progress: circles connected by lines
- Active step: Blue circle + blue text
- Completed step: Green circle with ✓ + green line
- Pending step: Gray circle + gray text
- Line between circles: 2px, colored based on completion

---

## Screen 4: 👨‍🎓 Student Profile (Detail View)

### Layout
```
┌──────────────────────────────────────────────────────┐
│ ← Back to Students                                    │ ← Breadcrumb link
│                                                       │
│ ┌─────────────────────────────────────────────────┐  │
│ │  ┌────┐  Rahul Kumar                            │  │ ← Profile header card
│ │  │    │  Class 5-A | Roll No: 12 | Admission: 2024│ │
│ │  │ 📷 │  Status: 🟢 Active                      │  │
│ │  │    │                                          │  │
│ │  └────┘  [✏️ Edit]  [🔄 Change Status]  [📄 TC] │  │ ← Action buttons
│ └─────────────────────────────────────────────────┘  │
│                                                       │
│ ┌─────────────────────────────────────────────────┐  │
│ │ [📋 Personal] [📚 Academic] [📊 Attendance]     │  │ ← Tabs (underline style)
│ │ [📝 Exams] [📄 Documents]                       │  │
│ │                                                  │  │
│ │ ─────────────────────────────────────────────    │  │
│ │                                                  │  │
│ │ TAB CONTENT AREA (changes per tab)               │  │
│ │                                                  │  │
│ │ ┌─ Personal Tab ──────────────────────────────┐  │  │
│ │ │                                              │  │  │
│ │ │  Full Name:       Rahul Kumar                │  │  │ ← Key-value grid
│ │ │  Date of Birth:   15 Mar 2014                │  │  │    (2 columns)
│ │ │  Gender:          Male                       │  │  │
│ │ │  Blood Group:     B+                         │  │  │
│ │ │  Father:          Suresh Kumar (9876543210)  │  │  │
│ │ │  Mother:          Rani Devi                  │  │  │
│ │ │  Address:         123, MG Road, Jaipur       │  │  │
│ │ │                                              │  │  │
│ │ └──────────────────────────────────────────────┘  │  │
│ └─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Attendance Tab Content
```
┌──────────────────────────────────────────┐
│  April 2026                    ◀ ▶       │ ← Month navigator
│                                          │
│  Mon  Tue  Wed  Thu  Fri  Sat           │
│  🟩   🟩   🟥   🟩   🟩   🟩            │ ← Green=Present, Red=Absent
│  🟩   🟨   🟩   🟩   ⬜   ⬜            │    Yellow=Late, Gray=Holiday
│  🟩   🟩   🟩   🟥   🟩   🟩            │
│  🟩   🟩   🟩   🟩   ...               │
│                                          │
│  Working Days: 24 | Present: 21          │
│  Absent: 2 | Late: 1 | Percentage: 87.5%│
└──────────────────────────────────────────┘
```

---

## Screen 5: 👩‍🏫 Teacher List

Same layout pattern as Student List but with these columns:
```
│ # │ Photo │ Name │ Emp ID │ Subjects │ Classes │ Phone │ Status │ Actions │
```
- Subjects column shows comma-separated badges: `Math` `Science`
- Classes column: `5-A, 5-B, 6-A`

---

## Screen 6: 👩‍🏫 Teacher Form (Add/Edit)

Single-page form (not multi-step — teachers have less fields):
```
┌──────────────────────────────────────────────────────┐
│ Add New Teacher                                       │
│                                                       │
│ ┌─────────────────────────────────────────────────┐  │
│ │                                                  │  │
│ │  📷 Upload Photo (circular)                      │  │
│ │                                                  │  │
│ │  ┌──────────────┐ ┌──────────────┐              │  │
│ │  │ Full Name *  │ │ Employee ID  │              │  │ ← Auto-generated
│ │  └──────────────┘ └──────────────┘              │  │
│ │  ┌──────────────┐ ┌──────────────┐              │  │
│ │  │ Phone *      │ │ Email *      │              │  │
│ │  └──────────────┘ └──────────────┘              │  │
│ │  ┌──────────────┐ ┌──────────────┐              │  │
│ │  │ Qualification*│ │ Specialization│             │  │
│ │  └──────────────┘ └──────────────┘              │  │
│ │  ┌──────────────┐ ┌──────────────┐              │  │
│ │  │ DOJ *        │ │ Experience   │              │  │
│ │  └──────────────┘ └──────────────┘              │  │
│ │  ┌─────────────────────────────────┐            │  │
│ │  │ Address *                        │            │  │
│ │  └─────────────────────────────────┘            │  │
│ │                                                  │  │
│ │  ── Subject & Class Assignment ──               │  │
│ │  ┌──────────────┐                               │  │
│ │  │ Subjects     │ ← Multi-select chips          │  │
│ │  │ [Math ✕] [Science ✕] [+ Add]                │  │
│ │  └──────────────┘                               │  │
│ │  ┌──────────────┐                               │  │
│ │  │ Classes      │ ← Multi-select chips          │  │
│ │  │ [5-A ✕] [5-B ✕] [6-A ✕] [+ Add]            │  │
│ │  └──────────────┘                               │  │
│ │                                                  │  │
│ │               [Cancel]  [Save Teacher]           │  │
│ └─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## Screen 7: 🏛️ Class & Section Manager

### Layout
```
┌──────────────────────────────────────────────────────┐
│ Class & Section Management                [+ Add Class]│
│                                                       │
│ ┌─────────────────────────────────────────────────┐  │
│ │  ┌────────────────────────────────────────────┐  │  │
│ │  │ 🏛️ Nursery          Sections: A, B         │  │  │ ← Expandable card
│ │  │    Students: 60     Teacher: Mrs. Sharma    │  │  │
│ │  │    Subjects: Hindi, English, Math, EVS      │  │  │
│ │  │    [Edit] [Manage Sections] [Manage Subjects]│ │  │
│ │  └────────────────────────────────────────────┘  │  │
│ │                                                  │  │
│ │  ┌────────────────────────────────────────────┐  │  │
│ │  │ 🏛️ Class 1           Sections: A, B, C     │  │  │
│ │  │    Students: 90      Teacher: Mr. Verma     │  │  │
│ │  │    ...                                      │  │  │
│ │  └────────────────────────────────────────────┘  │  │
│ │                                                  │  │
│ │  ┌────────────────────────────────────────────┐  │  │
│ │  │ 🏛️ Class 2           Sections: A, B        │  │  │
│ │  │    ...                                      │  │  │
│ │  └────────────────────────────────────────────┘  │  │
│ │                                                  │  │
│ │  ... (Nursery to 12th, all listed vertically)    │  │
│ └─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### "Manage Sections" Modal
```
┌────────────────────────────────────┐
│  Manage Sections — Class 5         │
│                                    │
│  Section A: 30 students  Mrs. Sharma  [✏️] [🗑️]
│  Section B: 28 students  Mr. Verma    [✏️] [🗑️]
│  Section C: 25 students  —            [✏️] [🗑️]
│                                    │
│  [+ Add Section]                   │
│                                    │
│                         [Close]    │
└────────────────────────────────────┘
```

---

## Screen 8: 📅 Timetable Builder

### Layout
```
┌──────────────────────────────────────────────────────┐
│ Timetable Management                                  │
│                                                       │
│ ┌───────────────┐ ┌─────────────────┐                │
│ │ View by:      │ │ Select:         │                │
│ │ ◉ Class  ○ Teacher │ │ [Class 5-A ▼]│               │
│ └───────────────┘ └─────────────────┘                │
│                                                       │
│ ┌─────────────────────────────────────────────────┐  │
│ │      │ Period 1│ Period 2│ Period 3│ ...│Period 8│  │ ← Scrollable grid
│ │      │ 8:00-   │ 8:40-   │ 9:20-   │    │ 1:25-  │  │
│ │      │ 8:40    │ 9:20    │ 10:00   │    │ 2:05   │  │
│ │──────┼─────────┼─────────┼─────────┼────┼────────│  │
│ │ Mon  │ Math    │ English │ Hindi   │LUNCH│Science │  │
│ │      │Sharma   │ Verma   │ Gupta   │    │ Singh  │  │
│ │──────┼─────────┼─────────┼─────────┼────┼────────│  │
│ │ Tue  │ Science │ Math    │ SST     │LUNCH│English │  │
│ │      │ Singh   │ Sharma  │ Yadav   │    │ Verma  │  │
│ │──────┼─────────┼─────────┼─────────┼────┼────────│  │
│ │ Wed  │ Hindi   │ Science │ Math    │LUNCH│ PT     │  │
│ │      │ Gupta   │ Singh   │ Sharma  │    │ Khan   │  │
│ │ ...                                               │  │
│ └─────────────────────────────────────────────────┘  │
│                                                       │
│ [⚙️ Configure Timings]  [📄 Print PDF]  [✏️ Edit Mode]│
└──────────────────────────────────────────────────────┘
```

### Each Cell in Edit Mode
- Click cell → Dropdown appears: Select Subject + Select Teacher
- If teacher already booked → 🔴 Red border + tooltip "Mrs. Sharma is in Class 6-B"
- Empty cell = dashed border with "+" icon
- Break/Lunch cells = gray bg, non-editable

---

## Screen 9: ✅ Mark Attendance

### Layout
```
┌──────────────────────────────────────────────────────┐
│ Mark Attendance                                       │
│                                                       │
│ ┌──────────────┐ ┌────────────┐ ┌──────────────┐    │
│ │ Class: [5 ▼] │ │ Section:[A▼]│ │ Date:[📅 Today]│   │
│ └──────────────┘ └────────────┘ └──────────────┘    │
│                                                       │
│ [✅ Mark All Present]                                 │ ← Quick action
│                                                       │
│ ┌─────────────────────────────────────────────────┐  │
│ │ #  │ Photo │ Name           │ Roll │ Status     │  │
│ │────┼───────┼────────────────┼──────┼────────────│  │
│ │ 1  │ 🟦   │ Rahul Kumar    │  01  │ ◉P ○A ○L ○H│  │ ← Radio buttons
│ │ 2  │ 🟦   │ Priya Sharma   │  02  │ ◉P ○A ○L ○H│  │    P=Present A=Absent
│ │ 3  │ 🟦   │ Amit Verma     │  03  │ ○P ◉A ○L ○H│  │    L=Late H=Half-Day
│ │ 4  │ 🟦   │ Sneha Singh    │  04  │ ◉P ○A ○L ○H│  │
│ │ ...                                              │  │
│ └─────────────────────────────────────────────────┘  │
│                                                       │
│ Summary: Present: 28 | Absent: 2 | Late: 1           │ ← Live counter
│                                                       │
│                              [Cancel]  [Submit ✓]     │
└──────────────────────────────────────────────────────┘
```

### Attendance Status Colors (Radio Buttons)
- **Present (P)**: Green radio
- **Absent (A)**: Red radio
- **Late (L)**: Yellow/amber radio
- **Half-Day (H)**: Orange radio

---

## Screen 10: 📝 Exam — Marks Entry

### Layout
```
┌──────────────────────────────────────────────────────┐
│ Marks Entry                                           │
│                                                       │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ │Exam:[▼] │ │Class:[▼] │ │Section:[▼]│ │Subject:[▼]││
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘│
│                                                       │
│ Total Marks: [100]                                    │
│                                                       │
│ ┌─────────────────────────────────────────────────┐  │
│ │ #  │ Name           │ Roll │ Marks Obtained     │  │
│ │────┼────────────────┼──────┼────────────────────│  │
│ │ 1  │ Rahul Kumar    │  01  │ [  85  ]           │  │ ← Number input
│ │ 2  │ Priya Sharma   │  02  │ [  92  ]           │  │
│ │ 3  │ Amit Verma     │  03  │ [  34  ] 🔴        │  │ ← Red if below passing
│ │ ...                                              │  │
│ └─────────────────────────────────────────────────┘  │
│                                                       │
│                         [Save Draft]  [Submit & Lock] │
└──────────────────────────────────────────────────────┘
```

---

## Screen 11: 📢 Notice Board

### Layout
```
┌──────────────────────────────────────────────────────┐
│ Notices & Announcements              [+ Create Notice]│
│                                                       │
│ ┌─────────────────────────────────────────────────┐  │
│ │ 🔴 URGENT   Annual Day Preparations             │  │ ← Priority badge + title
│ │ All Classes | Published: 5 Apr 2026              │  │
│ │ Annual day rehearsals start from 10 April...     │  │ ← Truncated preview
│ │                                      [View] [✏️] │  │
│ ├─────────────────────────────────────────────────┤  │
│ │ 🟡 IMPORTANT  PTM Schedule — April              │  │
│ │ Class 1-5 | Published: 3 Apr 2026               │  │
│ │ Parent-teacher meeting will be held on...        │  │
│ │                                      [View] [✏️] │  │
│ ├─────────────────────────────────────────────────┤  │
│ │ ⚪ NORMAL   Holiday: Ambedkar Jayanti            │  │
│ │ All Classes | Published: 1 Apr 2026              │  │
│ │ School will remain closed on 14 April...         │  │
│ │                                      [View] [✏️] │  │
│ └─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Create Notice Modal
```
┌────────────────────────────────────┐
│ Create Notice                       │
│                                    │
│ Title: [________________________]  │
│                                    │
│ Message:                           │
│ ┌──────────────────────────────┐   │
│ │ B I U  | 📎 Attach          │   │ ← Rich text toolbar
│ │                              │   │
│ │ Type your notice here...     │   │
│ │                              │   │
│ └──────────────────────────────┘   │
│                                    │
│ Audience: [All Classes ▼]         │
│ Priority: [Normal ▼]              │
│ Publish:  [📅 Today]               │
│ Expiry:   [📅 ________]            │
│                                    │
│            [Cancel]  [Publish 📢]  │
└────────────────────────────────────┘
```

---

## Screen 12: ⚙️ School Settings

### Layout (Tab-based)
```
┌──────────────────────────────────────────────────────┐
│ School Settings                                       │
│                                                       │
│ [🏫 Profile] [📅 Academic Year] [🔔 Notifications]   │
│ [📄 Reports]                                          │
│                                                       │
│ ── School Profile Tab ──                              │
│                                                       │
│ ┌─────────────────────────────────────────────────┐  │
│ │  ┌──────┐                                       │  │
│ │  │ LOGO │  Upload School Logo                   │  │ ← Drag-drop area
│ │  └──────┘                                       │  │
│ │                                                  │  │
│ │  School Name:     [Sunshine Public School____]   │  │
│ │  Board:           [CBSE ▼]                       │  │
│ │  Affiliation No:  [12345678________________]     │  │
│ │  Address:         [123, MG Road, Jaipur____]     │  │
│ │  Phone:           [9876543210_______________]    │  │
│ │  Email:           [info@sunshine.edu________]    │  │
│ │  Website:         [www.sunshine.edu_________]    │  │
│ │                                                  │  │
│ │                              [Save Changes]      │  │
│ └─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## 📱 Responsive Behavior

| Breakpoint | Sidebar | Layout |
|-----------|---------|--------|
| **> 1200px** (Desktop) | Fixed 280px, always visible | Side-by-side |
| **768–1200px** (Tablet) | Collapsible, toggle with ☰ button | Full width content |
| **< 768px** (Mobile) | Overlay drawer, slide from left | Single column, stacked cards |

### Mobile Adaptations
- Stat cards: 2 per row instead of 4
- Tables: Horizontal scroll with sticky first column
- Forms: Single column instead of 2-column grid
- Sidebar: Hidden, ☰ hamburger in header to open

---

## 🖼️ Image Generation Prompts (For Mockup Reference)

### Dashboard Mockup Prompt
> "Clean, minimal school management dashboard UI. Pure white background, soft shadows. Top row has 4 stat cards (Total Students, Teachers, Attendance %, Classes) with colored icons. Below is a Quick Actions card with 4 buttons. Bottom section has two cards side by side: left showing horizontal bar chart of class attendance, right showing recent notices list. Left sidebar is clean white with a subtle blue-tinted right border, navigation items with blue active state. Font: Plus Jakarta Sans. Apple-style aesthetic. No device frames."

### Student List Mockup Prompt
> "Modern admin panel student directory page. Clean white UI with a data table showing student records with photo thumbnails, names, class-section, parent name, phone, and status badges (green Active, red Inactive). Table has filters above (class dropdown, section dropdown, status dropdown) and a search bar. Rounded card container with subtle shadow. White sidebar on left with soft blue border separator. Premium enterprise design."

### Timetable Builder Mockup Prompt
> "School timetable builder interface. Week grid (Monday to Saturday rows) with 8 period columns. Each cell shows subject name and teacher name. Lunch break column highlighted in gray. Clean white cards with rounded corners. Color-coded subjects. White sidebar with blue accents on left. Professional school management software look."

---

> [!TIP]
> **This document is the complete visual spec.** When we start coding each screen, we'll reference this for exact colors, sizes, and layouts. No guesswork.
