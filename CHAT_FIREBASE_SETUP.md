# Chat → Firebase (Firestore) — one-time setup

The parent ⇄ school **group chat** now runs on **Cloud Firestore** (realtime, no polling).
Reads come straight from Firestore via realtime listeners; **all writes go through the
backend** (service account), which also sends FCM push. Everything else (students,
teachers, fees, …) stays in MongoDB.

Project: **scoolg-c17c7** (same Firebase project already used for push notifications).

## Do these once in the Firebase Console

1. **Enable Firestore**
   - Firebase Console → *Build → Firestore Database → Create database*
   - Choose **Production mode**, region **asia-south1 (Mumbai)** (or nearest).

2. **Publish the security rules**
   - Firestore → **Rules** tab → paste the contents of [`firestore.rules`](./firestore.rules) → **Publish**.

3. **Enable Authentication** (needed for `signInWithCustomToken`)
   - Console → *Build → Authentication → Get started*.
   - No provider needs to be turned on — custom-token sign-in works once Auth is enabled.

4. **Service account write access** (usually already fine)
   - The backend reuses the `FIREBASE_SERVICE_ACCOUNT` env (already set on Netlify for push).
   - That service account needs Firestore write access. The default
     `firebase-adminsdk@…` account has the **Editor** role, which is enough.
   - If writes ever fail with a permission error, grant that account the
     **Cloud Datastore User** role in Google Cloud → IAM.

No new environment variables and no frontend config changes are required —
the Firebase web config and the service account already exist in the project.

## How it works

- Backend mints a **Firebase custom token** per app
  (`/api/student|teacher|admin/firebase-token`) with claims `{ role, schoolId, studentId? }`.
- Apps call `signInWithCustomToken`, then attach **realtime listeners**:
  - Parent → `chats/{studentId}/messages`
  - Teacher → `chats where schoolId == mySchool` (list) + the open thread
  - Admin → `chats/{studentId}/messages` (inside the student's *Parent Chat* tab)
- Sending posts to the existing backend endpoints, which write to Firestore and push.
- Unread counters (`parentUnread` / `schoolUnread`) live on the `chats/{studentId}` doc;
  opening a thread calls a small `…/read` endpoint that resets the relevant side.

> Old messages from the previous MongoDB chat are **not** migrated (they were test data).
> If you want them carried over, ask and I'll add a one-time backfill script.
