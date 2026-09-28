# SAI International Social Service Trust — Website (Public Site + Admin Panel)

Premium black/burgundy/gold/cream vocational-training website for SAI
International Social Service Trust, Kovilpatti. Built with React + Vite,
React Router and Axios, using the trust's official logo for branding
(sticky nav, branded splash screen, gold-badge hero, highlight strip,
course cards, upcoming-batch cards, posts & video sections, black/gold
footer).

This single frontend application contains **both** the public/customer-facing
website (routes like `/`, `/courses`, `/login`, `/dashboard`,
`/staff/dashboard`) **and** the internal Admin Panel (all `/admin/*` routes,
under `src/admin/`) — see `src/App.jsx` for the full route list, and the
top-level `PROJECT/README.md` for how this connects to `PROJECT/BACKEND/`.

## Getting started

```bash
npm install
npm run dev       # local dev server
npm run build     # production build -> dist/
```

## Connecting the backend

All dynamic data (courses, course details, batches, gallery, posts,
videos, hero image, settings, auth, applications, enquiries, student
profile/applications, and every Admin Panel screen under `src/admin/`)
goes through `src/services/api.js` and `src/admin/adminStore.js`. There's a
single place to change the backend URL — copy `.env.example` to `.env`:

```bash
# .env
VITE_API_BASE_URL=https://your-backend.example.com/api
```

If `VITE_API_BASE_URL` isn't set, it falls back to
`http://localhost:5000/api` — the `PROJECT/BACKEND` dev server's default.

Expected endpoints (adjust in `api.js`/`adminStore.js` if your backend differs):

| Method | Endpoint                  | Purpose                          |
|--------|----------------------------|-----------------------------------|
| GET    | `/courses`                 | List all courses                 |
| GET    | `/courses/:slug`           | Single course detail             |
| GET    | `/batches`                 | Upcoming batches                 |
| GET    | `/gallery`                 | Gallery images                   |
| GET    | `/posts`                   | Posts & updates                  |
| GET    | `/videos`                  | Activity videos                  |
| GET    | `/settings/hero-image`     | Active admin-uploaded hero image |
| GET    | `/settings`                | Public trust settings (contact, staff dashboard URL, etc.) |
| POST   | `/auth/login`               | `{ role, email, password }` → `{ user, token }` |
| POST   | `/auth/register`            | Customer self-registration        |
| POST   | `/applications`             | Course application submission     |
| POST   | `/enquiries`                 | Contact form submission           |
| GET    | `/student/profile`          | Logged-in student's profile       |
| GET    | `/student/applications`     | Logged-in student's applications  |

Until the backend is live, **every read endpoint falls back to local demo
data** in `src/data/siteData.js` so the site never breaks for visitors —
swap in real data by matching that same shape. Auth also falls back to
the demo accounts below only when the real `/auth/login` call fails.

## Demo login credentials (development only)

These exist purely so the login flow can be exercised before the real
backend is connected. They are **never** hardcoded as production
authentication — `AuthAPI.login` always tries the backend first and only
falls back to checking these locally when that request fails.

| Role     | Email                     | Password       |
|----------|----------------------------|----------------|
| Customer | `customer@saitrust.demo`  | `Customer@123` |
| Staff    | `staff@saitrust.demo`     | `Staff@123`    |

The demo customer has Student ID `SAI-STU-1042`; the demo staff account
has Staff ID `SAI-STAFF-07` — both shown read-only on `/profile`.

## Key flows

- **Apply Now → login-gated application.** Clicking "Apply Now" (hero,
  course cards, batch cards, CTA strip) always resolves to `/admission`,
  which is wrapped in `ProtectedRoute`. Anonymous visitors are bounced to
  `/login?next=/admission...` and land back on the application form
  immediately after signing in; already-logged-in customers go straight
  through. There's no separate "Apply Now" button in the navbar itself —
  only "Login" (or the account avatar once signed in).
- **Role-based login + account menu.** `/login` starts with a "Continue
  as Student / Staff" choice. Once signed in, "Login" in the navbar is
  replaced by a small avatar (initials, or the uploaded photo) with a
  dropdown: **Profile**, **Dashboard** (customer) or **Staff Dashboard**
  (staff), and **Logout**. Customers land on `/dashboard` after login;
  staff land on `/staff/dashboard`. Staff can never reach `/dashboard`
  and customers can never reach the staff pages — every route checks
  `role` via `ProtectedRoute`.
- **Profile (`/profile`, any signed-in role).** Edit name, email, phone,
  and upload a profile photo (stored as a data URL in the browser for
  now — see note below). Student ID / Staff ID are shown read-only,
  since those are assigned by the trust, not the user. Saves go through
  `ProfileAPI.update()`, which tries the real backend first and always
  applies the change to the local session either way, so editing stays
  usable before the backend exists.
- **Staff Dashboard (`/staff/dashboard`, staff only).** A lightweight
  operational panel — separate from the customer dashboard — for staff's
  day-to-day tasks:
  - **Today's Presence** — a self check-in button ("Mark Present
    Today"). This is the record that should sync to the real admin
    dashboard once the backend/admin project is connected.
  - **Create a Post/Update** and **Upload a Training Video** — both
    publish immediately into the Posts & Updates / video sections on the
    live site (demo-persisted to `localStorage`, merged on top of the
    fallback content) so the effect is visible right away.
  - **Mark Student Attendance** — enter a Student ID, pick a course/date/
    status, and see a running log of what's been marked this session.
  - A link out to `/staff/redirect`, which forwards to the *real* admin
    dashboard (`VITE_STAFF_DASHBOARD_URL`) once Developer 2's project is
    connected — for anything beyond day-to-day staff tasks (e.g.
    creating staff accounts, which only Admin can do).
  - **Important:** none of this replaces the real Admin Dashboard
    (Developer 2) or backend (Developer 3). Posts/videos/attendance/
    presence here are demo-persisted in the browser via `localStorage`
    only — wire up the matching endpoints in `src/services/api.js`
    (`PostsAPI`, `VideosAPI`, `AttendanceAPI`, `PresenceAPI`) once the
    real backend exists, and the same UI will start writing there
    instead, automatically.
- **Account hierarchy.** Staff accounts are **not** self-registered on
  this site — only Admin (Developer 2's project) can create a staff
  username/password. Customers can self-register via `/register`. The
  demo staff/customer accounts below exist purely so this flow can be
  tested before that's wired up.
- **Navigation.** Only 4 links (Home, About, Courses, Batches) sit
  directly on the navbar; Gallery, Posts & Updates, Certification and
  Contact live in a "More" dropdown next to them. This, plus the
  language switch, keeps the bar from overflowing on laptop widths even
  when Tamil text runs longer than English (mobile still gets the full
  flat list in the slide-down drawer).
- **Language switch.** The EN | தமிழ் toggle in the navbar (desktop and
  mobile) is backed by `src/i18n/LanguageContext.jsx` and covers the
  whole site — navigation, hero, every page (About, Courses, Course
  details, Batches, Gallery, Certification, Contact, Login, Register,
  Profile, Dashboards, Posts), the footer, and all course content
  (names, descriptions, modules, benefits). It intentionally does
  **not** persist across visits — every fresh page load starts in
  English, regardless of what was picked last time. Add more keys to
  `src/i18n/translations.js` as new content is added.
- **Admin-driven content.** Hero image, posts, and videos are fetched
  from the backend on every page load (`HeroAPI`, `PostsAPI`,
  `VideosAPI`) and re-render automatically — nothing is hardcoded.
  Empty/error/loading states are handled per section.

## About demo-only persistence

Until the real backend is connected, a few features write to the
browser's `localStorage` purely so the demo is interactive instead of
submitting into a void: posts/videos created from the Staff Dashboard,
attendance records, presence check-ins, and profile edits (name/phone/
email/photo). None of this is shared between devices or visible to an
admin anywhere — it only proves out the UI. Once the matching backend
endpoints exist, swap the `localStorage` fallback in `src/services/
api.js` for the real call and everything keeps working without touching
the components.



## About the images

No individual photo files were provided with the reference design beyond
the trust's official logo (now used for the navbar, footer, splash
screen and favicon). Every other photo slot — hero image, course photos,
gallery, certificate visual — currently renders an elegant gold/black
illustrated placeholder (`src/components/ArtPanel.jsx`) instead of an
unrelated stock photo, per the brief's instruction not to use random
stock imagery. The hero image slot already prefers a real admin-uploaded
image (`HeroAPI`) over the placeholder the moment one exists.

**To finish the site with real photography:** drop the trust's actual
photos into `src/assets/`, then swap each `<ArtPanel .../>` usage for an
`<img src={...} />` (the course/gallery/post data files have room to add
an `image` field per item).

## Structure

```
src/
  assets/       Official SAI logo (sai-logo.png)
  components/   Navbar, Footer, cards, Splash screen, video modal,
                icons, skeleton loaders, logo, protected route
  context/      AuthContext (customer/staff session)
  i18n/         LanguageContext + EN/TA translation dictionary
  pages/        Public + customer/staff pages: Home, About, Courses,
                CourseDetails, Batches, Posts, Admission, Gallery,
                Certification, Contact, Login, Register,
                CustomerDashboard, StaffDashboard, StaffRedirect, Profile,
                NotFound
  data/         Fallback/demo content (courses, batches, gallery, posts,
                videos, settings, demo accounts) — used only if the
                backend is briefly unreachable
  services/     Centralized Axios config + auth interceptor (api.js) for
                the public/customer/staff side
  admin/        Admin Panel — its own auth (AdminAuthContext.jsx), data
                layer (adminStore.js), layout, pages/ (Dashboard, Hero
                Banner, Courses, About Us, Gallery, Posts, Certification,
                Footer Settings, Contact Submissions, Staff Management,
                Attendance, Permissions, Students, Theme), and ui/ helpers
                (FileDrop, Modal, ConfirmDialog)
```

## Notes

- Fully responsive (desktop / laptop / tablet / mobile), sticky nav with
  a mobile slide-down menu.
- Loading skeletons + inline error states (with retry) for every
  API-backed section.
- Admission and Contact forms validate client-side (name, 10-digit
  Indian mobile number, required fields) before submitting via Axios.
- Floating WhatsApp button linked to +91 90251 16369 on every page.
- Branded splash screen (logo fade/scale-in with a gold glow on a
  black/burgundy background) shows once per browser tab session.
- Admin Panel routes (`/admin/*`) use a separate login/session
  (`AdminAuthContext`, stored under a different localStorage key) from the
  public site's customer/staff session (`AuthContext`) — see
  `PROJECT/README.md` for admin credentials.
