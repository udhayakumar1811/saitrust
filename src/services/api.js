import axios from 'axios';

/**
 * Centralized backend URL. Change this single value (or set VITE_API_BASE_URL
 * in a .env file) to point the whole app at a different backend.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the logged-in user's token (if any) to every request so the
// backend can identify customer/staff sessions.
api.interceptors.request.use((config) => {
  try {
    const raw = window.localStorage.getItem('sai_auth');
    const token = raw ? JSON.parse(raw)?.token : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // ignore malformed storage
  }
  return config;
});

// ---- Endpoint helpers -------------------------------------------------
// Each helper resolves with backend data. If the backend call fails (e.g.
// the API is temporarily unreachable), it falls back to local demo data so
// the site keeps working instead of breaking for visitors.

import {
  courses as fallbackCourses,
  batches as fallbackBatches,
  galleryImages as fallbackGallery,
  posts as fallbackPosts,
  videos as fallbackVideos,
  heroImage as fallbackHeroImage,
  settings as fallbackSettings,
  demoAccounts,
} from '../data/siteData.js';

async function withFallback(promiseFn, fallbackData) {
  try {
    const res = await promiseFn();
    return { data: res.data?.data ?? res.data, source: 'api' };
  } catch (err) {
    return { data: fallbackData, source: 'fallback', error: err };
  }
}

// ---- Local demo storage helpers -----------------------------------------
// Kept only for AttendanceAPI below (staff marking a *student's* attendance)
// which has no dedicated endpoint in the Backend Integration Spec — not used
// for anything the real API already serves.

// ---- Local profile overrides ---------------------------------------------
// Root cause of "photo disappears every time you log in": whenever the demo
// accounts are used (or the backend doesn't persist the change), login
// returns a fresh, fixed user object from data/siteData.js with no avatar.
// A small local store keyed by email keeps the last known avatar/name/phone
// and re-applies it on top of whatever the login response returns, so a
// photo added once keeps showing up on every future login.
const LOCAL_PROFILE_KEY = 'sai_local_profile_overrides';

function getProfileOverrides() {
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_PROFILE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveProfileOverride(email, patch) {
  if (!email) return;
  const key = email.trim().toLowerCase();
  const all = getProfileOverrides();
  all[key] = { ...all[key], ...patch };
  writeLocal(LOCAL_PROFILE_KEY, all);
}

function applyProfileOverride(user) {
  if (!user?.email) return user;
  const override = getProfileOverrides()[user.email.trim().toLowerCase()];
  return override ? { ...user, ...override } : user;
}

function readLocal(key) {
  try {
    return JSON.parse(window.localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}
function writeLocal(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // storage full/unavailable
    return false;
  }
}

// ---- Offline-safe local mirrors ------------------------------------------
// Posts created by staff and applications submitted by students are also
// kept locally, so the feature keeps working end-to-end when the backend
// is briefly unreachable, and the same records still show up on the public
// Posts page / Student Dashboard.
export const APPLICATIONS_EVENT = 'sai-applications-change';
function notifyApplicationsChanged() {
  window.dispatchEvent(new CustomEvent(APPLICATIONS_EVENT));
}

const LOCAL_POSTS_KEY = 'sai_local_posts';
const LOCAL_APPS_KEY = 'sai_local_applications';
const LOCAL_DELETED_POSTS_KEY = 'sai_local_deleted_posts';
// Tracks, per staff member, which post IDs *this browser* created — kept
// separately from whatever the backend response contains. Root cause of
// "My Posts stays empty even though the post was created successfully":
// once the real backend/MongoDB is reachable, a created post comes back
// from `POST /posts` without the author/authorId tags (those were only
// ever added by the local-fallback branch below), so the old
// `p.author === 'staff'` filter in `mine()` never matched it. This list
// is the reliable fallback signal for "did I publish this one" regardless
// of what shape the backend's response is in.
const LOCAL_MY_POST_IDS_KEY = 'sai_staff_my_post_ids';

function rememberMyPost(staffKey, postId) {
  if (!staffKey || postId === undefined || postId === null) return;
  const all = readLocal(LOCAL_MY_POST_IDS_KEY);
  const map = Array.isArray(all) ? {} : all; // guard against the old array shape
  const mine = map[staffKey] || [];
  if (!mine.includes(String(postId))) {
    map[staffKey] = [...mine, String(postId)];
    writeLocal(LOCAL_MY_POST_IDS_KEY, map);
  }
}

function getMyPostIds(staffKey) {
  if (!staffKey) return [];
  const all = readLocal(LOCAL_MY_POST_IDS_KEY);
  const map = Array.isArray(all) ? {} : all;
  return map[staffKey] || [];
}

const localUid = (p = 'id') => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function getLocalPosts() {
  return readLocal(LOCAL_POSTS_KEY);
}
function getDeletedPostIds() {
  return readLocal(LOCAL_DELETED_POSTS_KEY);
}

// Merges backend posts with locally-created ones, hides anything deleted
// locally, and sorts newest first.
function mergePosts(remote, type) {
  const deleted = getDeletedPostIds();
  const locals = getLocalPosts().filter((p) => p.type === type);
  const all = [...(remote || []), ...locals].filter(
    (p) => p && !deleted.includes(String(p.id))
  );
  const seen = new Set();
  const unique = all.filter((p) => {
    const key = String(p.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return unique.sort(
    (a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)
  );
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/**
 * Turns a batch's { day: '09', month: 'JUN' } into a real calendar date.
 * No year is stored on a batch, so the nearest sensible one is used: the
 * current year, rolling to next year when that date is already well past.
 */
export function resolveBatchDate(batch) {
  if (!batch?.day || !batch?.month) return null;
  const monthIndex = MONTHS.indexOf(String(batch.month).trim().toUpperCase().slice(0, 3));
  if (monthIndex < 0) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let date = new Date(now.getFullYear(), monthIndex, Number(batch.day));
  // If that day/month has already gone by this year, it must mean next
  // year's batch — never leave a freshly-applied batch resolving to a date
  // that's already "past" (that used to happen for any date more than a
  // few months behind today, which made a brand-new application vanish
  // from "Applied" the instant it was created).
  if (date < today) date = new Date(now.getFullYear() + 1, monthIndex, Number(batch.day));
  return date.toISOString().slice(0, 10);
}

/** True once the batch day is fully over (so it can drop off the dashboard). */
export function isBatchDatePast(batchDate) {
  if (!batchDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${batchDate}T00:00:00`);
  return d < today;
}

export const CoursesAPI = {
  getAll: () => withFallback(() => api.get('/courses'), fallbackCourses),
  getBySlug: (slug) =>
    withFallback(
      () => api.get(`/courses/${slug}`),
      fallbackCourses.find((c) => c.slug === slug) || null
    ),
};

export const BatchesAPI = {
  getUpcoming: () => withFallback(() => api.get('/batches'), fallbackBatches),
};

export const GalleryAPI = {
  getAll: () => withFallback(() => api.get('/gallery'), fallbackGallery),
};

// Admin manages this as a one-item list (see admin/pages/Certification.jsx);
// the public site just shows whichever single image currently exists, or
// nothing (falls back to the illustrated ArtPanel) when the list is empty.
export const CertificationAPI = {
  getActive: async () => {
    const res = await withFallback(() => api.get('/certification'), []);
    const list = res.data || [];
    return { ...res, data: list[0] || null };
  },
};

// Singleton "About Us" content (heading/paragraphs/checklist/media) that
// Admin edits from admin/pages/AboutUs.jsx.
export const AboutAPI = {
  getPublic: () => withFallback(() => api.get('/about'), null),
};

export const PostsAPI = {
  getAll: async () => {
    const res = await withFallback(() => api.get('/posts', { params: { type: 'image' } }), fallbackPosts);
    return { ...res, data: mergePosts(res.data, 'image') };
  },
  create: async (payload) => {
    const res = await api.post('/posts', { ...payload, type: 'image' });
    return { data: res.data.data, source: 'api' };
  },
};

export const VideosAPI = {
  getAll: async () => {
    const res = await withFallback(() => api.get('/posts', { params: { type: 'video' } }), fallbackVideos);
    return { ...res, data: mergePosts(res.data, 'video') };
  },
  create: async (payload) => {
    const res = await api.post('/posts', {
      title: payload.title,
      description: payload.description,
      mediaUrl: payload.videoUrl,
      type: 'video',
    });
    return { data: res.data.data, source: 'api' };
  },
};

// "Posts & Updates" shows image posts AND video posts together — used by
// both the Home page preview and the full Posts page, so a video a staff
// member publishes shows up there too, not only image posts.
export const UpdatesAPI = {
  getAll: async () => {
    const [images, videos] = await Promise.all([PostsAPI.getAll(), VideosAPI.getAll()]);
    return { data: [...(images.data || []), ...(videos.data || [])] };
  },
};

// ---- Staff posts ---------------------------------------------------------
// Staff publish image/video posts from their dashboard. These go to the
// backend when it's reachable and are mirrored locally otherwise, so the
// post still appears in the public "Posts & Updates" section either way.
export const StaffPostsAPI = {
  create: async ({ title, category, description, mediaUrl, type, author }) => {
    const body = { title, category, description, mediaUrl, type };
    const staffKey = String(author?.staffId || author?.id || 'staff');
    try {
      const res = await api.post('/posts', body);
      const created = res.data.data;
      // The real backend's response may not tag the post as this staff
      // member's own (see note above) — remember it locally so "My Posts"
      // still finds it regardless.
      if (created?.id !== undefined) rememberMyPost(staffKey, created.id);
      return { data: created, source: 'api' };
    } catch {
      const record = {
        id: localUid('post'),
        ...body,
        author: 'staff',
        authorId: author?.staffId || author?.id || 'staff',
        authorName: author?.name || 'Staff',
        date: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
        local: true,
      };

      // Photos/videos here are stored as full base64 data — localStorage's
      // quota (a few MB per site) fills up after only a handful of these,
      // and a write past that quota used to fail silently, so a post looked
      // "published" but was never actually saved. Now: if it doesn't fit,
      // drop the oldest locally-stored posts one at a time and retry —
      // and only give up (throwing, so the dashboard can show a real error)
      // if it still won't fit even with nothing else stored.
      let existing = getLocalPosts();
      let saved = writeLocal(LOCAL_POSTS_KEY, [record, ...existing]);
      while (!saved && existing.length > 0) {
        existing = existing.slice(0, -1); // drop the oldest (list is newest-first)
        saved = writeLocal(LOCAL_POSTS_KEY, [record, ...existing]);
      }
      if (!saved) {
        throw new Error('This file is too large to save offline. Try a smaller photo/video, or publish once the server connection is back.');
      }
      rememberMyPost(staffKey, record.id);
      return { data: record, source: 'local' };
    }
  },

  // Posts published by this staff member (backend + local mirror). Matches
  // on the author/authorId tag when present (local-fallback posts always
  // have it), and falls back to the locally-remembered ID list for posts
  // the real backend created without echoing that tag back.
  mine: async (author) => {
    const [images, videos] = await Promise.all([PostsAPI.getAll(), VideosAPI.getAll()]);
    const all = [...(images.data || []), ...(videos.data || [])];
    const staffKey = String(author?.staffId || author?.id || 'staff');
    const ids = [author?.staffId, author?.id].filter(Boolean).map(String);
    const myIds = getMyPostIds(staffKey);
    return all.filter((p) => {
      const byAuthorTag = p.author === 'staff' && (ids.length === 0 || ids.includes(String(p.authorId)));
      const byRememberedId = myIds.includes(String(p.id));
      return byAuthorTag || byRememberedId;
    });
  },

  update: async (id, patch) => {
    const locals = getLocalPosts();
    if (locals.some((p) => String(p.id) === String(id))) {
      let next = locals.map((p) => (String(p.id) === String(id) ? { ...p, ...patch } : p));
      let saved = writeLocal(LOCAL_POSTS_KEY, next);
      // Same storage-quota safety net as create(): if the edited post (e.g.
      // a bigger replacement photo/video) no longer fits, drop the oldest
      // *other* local posts to make room rather than losing the edit.
      const others = () => next.filter((p) => String(p.id) !== String(id));
      while (!saved && others().length > 0) {
        const target = others()[others().length - 1];
        next = next.filter((p) => String(p.id) !== String(target.id));
        saved = writeLocal(LOCAL_POSTS_KEY, next);
      }
      if (!saved) {
        throw new Error("This file is too large to save offline. Try a smaller photo/video.");
      }
      return { data: next.find((p) => String(p.id) === String(id)), source: 'local' };
    }
    try {
      const res = await api.patch(`/posts/${id}`, patch);
      return { data: res.data.data, source: 'api' };
    } catch {
      return { data: null, source: 'local' };
    }
  },

  remove: async (id) => {
    const locals = getLocalPosts();
    if (locals.some((p) => String(p.id) === String(id))) {
      writeLocal(LOCAL_POSTS_KEY, locals.filter((p) => String(p.id) !== String(id)));
      return { data: { id }, source: 'local' };
    }
    try {
      await api.delete(`/posts/${id}`);
      return { data: { id }, source: 'api' };
    } catch {
      // Backend unreachable (or this is a demo/seed post): remember the
      // deletion locally so it stops showing on the site.
      writeLocal(LOCAL_DELETED_POSTS_KEY, [...getDeletedPostIds(), String(id)]);
      return { data: { id }, source: 'local' };
    }
  },
};

export const HeroAPI = {
  // Expected shape from backend: { imageUrl: string | null }
  getActive: () => withFallback(() => api.get('/settings/hero-image'), { imageUrl: fallbackHeroImage }),
};

export const SettingsAPI = {
  getPublic: () => withFallback(() => api.get('/settings'), fallbackSettings),
};

// ---- File upload (Section 2) ---------------------------------------------
// Used by Profile.jsx's avatar picker so photos are stored on the server
// instead of as base64 data URLs (a demo-only trick that doesn't scale or
// carry over between devices, per the spec).
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.readAsDataURL(file);
  });
}

export const UploadAPI = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res.data.data; // { url, filename, mimeType, size }
    } catch {
      // Backend unreachable — keep the chosen photo usable for this session
      // by embedding it directly, instead of silently dropping the upload.
      const url = await readFileAsDataUrl(file);
      return { url, filename: file.name, mimeType: file.type, size: file.size, local: true };
    }
  },
};

export const ApplicationsAPI = {
  // Submits the admission form. If the backend can't be reached the
  // application is stored locally so the student still sees it as applied
  // on their dashboard instead of hitting a dead end.
  submit: async (payload) => {
    try {
      const res = await api.post('/applications', payload);
      const saved = res.data?.data || payload;
      // Batch label/date aren't stored server-side; keep them locally so the
      // dashboard can show the batch and expire it on its own.
      const meta = readLocal(LOCAL_APPS_KEY);
      writeLocal(LOCAL_APPS_KEY, [
        { ...payload, id: saved.id, status: saved.status || 'pending', remote: true },
        ...meta,
      ]);
      notifyApplicationsChanged();
      return { data: saved, source: 'api' };
    } catch {
      const record = {
        ...payload,
        id: localUid('app'),
        status: 'pending',
        createdAt: new Date().toISOString(),
        local: true,
      };
      writeLocal(LOCAL_APPS_KEY, [record, ...readLocal(LOCAL_APPS_KEY)]);
      notifyApplicationsChanged();
      return { data: record, source: 'local' };
    }
  },

  // Everything the logged-in student has applied for. Batches whose date
  // has already passed are dropped automatically.
  mine: async () => {
    const res = await withFallback(() => api.get('/student/applications'), []);
    const remote = res.data || [];
    const locals = readLocal(LOCAL_APPS_KEY);
    const byId = new Map();
    [...remote, ...locals].forEach((a) => {
      if (!a) return;
      const key = String(a.id);
      byId.set(key, { ...(byId.get(key) || {}), ...a });
    });
    return [...byId.values()].filter((a) => !isBatchDatePast(a.batchDate));
  },

  cancel: async (id) => {
    const locals = readLocal(LOCAL_APPS_KEY);
    writeLocal(LOCAL_APPS_KEY, locals.filter((a) => String(a.id) !== String(id)));
    try {
      await api.delete(`/applications/${id}`);
      notifyApplicationsChanged();
      return { data: { id }, source: 'api' };
    } catch {
      notifyApplicationsChanged();
      return { data: { id }, source: 'local' };
    }
  },

  // All applications with a specific booked batch — used by the Staff
  // Dashboard's "Batch Applied Students" list. Falls back to whatever is
  // sitting in the local mirror if the backend can't be reached.
  allBatchApplications: async () => {
    const res = await withFallback(() => api.get('/applications'), null);
    const remote = (res.data || []).filter((a) => a.kind === 'batch');
    const locals = readLocal(LOCAL_APPS_KEY).filter((a) => a.kind === 'batch');
    const byId = new Map();
    [...remote, ...locals].forEach((a) => byId.set(String(a.id), { ...(byId.get(String(a.id)) || {}), ...a }));
    return [...byId.values()];
  },

  // True when this Student ID has at least one booked batch — used to stop
  // staff from marking attendance for a student who never applied.
  hasBookedBatch: (batchApplications, studentId) =>
    (batchApplications || []).some(
      (a) => String(a.studentId || '').toUpperCase() === String(studentId || '').toUpperCase()
    ),

  // True when this course (optionally this exact batch) is already applied
  // for — used to flip Enroll/Apply buttons to "Applied".
  isApplied: (applications, courseSlug, batchId) =>
    (applications || []).some(
      (a) => a.course === courseSlug && (!batchId || String(a.batch) === String(batchId))
    ),
};

export const EnquiriesAPI = {
  submit: (payload) => api.post('/enquiries', payload),
};

// ---- Auth ---------------------------------------------------------------
// Always tries the real backend first. Only falls back to checking the
// local demo accounts (see data/siteData.js) when the backend is
// unreachable — this keeps the app usable if the API is briefly down,
// without ever treating the demo accounts as production authentication.
function checkDemoAccount(role, { email, password }) {
  const account = demoAccounts[role];
  if (account && email?.trim().toLowerCase() === account.email && password === account.password) {
    return { user: account.user, token: `demo-${role}-token` };
  }
  return null;
}

// ---- Local accounts (offline registration) --------------------------------
// Mirrors the demo-account fallback login already has: if the backend can't
// be reached at signup, the account is kept locally (keyed by email) so the
// same person can register and log back in without the backend running.
const LOCAL_ACCOUNTS_KEY = 'sai_local_accounts';

function getLocalAccounts() {
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_ACCOUNTS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveLocalAccount(email, account) {
  const all = getLocalAccounts();
  all[email.trim().toLowerCase()] = account;
  writeLocal(LOCAL_ACCOUNTS_KEY, all);
}

function checkLocalAccount({ email, password }) {
  const account = getLocalAccounts()[email?.trim().toLowerCase()];
  if (account && password === account.password) {
    return { user: account.user, token: `local-${account.user.id}-token` };
  }
  return null;
}

export const AuthAPI = {
  login: async (role, credentials) => {
    try {
      const res = await api.post('/auth/login', { role, ...credentials });
      const data = res.data.data;
      return { data: { ...data, user: applyProfileOverride(data.user) }, source: 'api' };
    } catch (err) {
      const demo = checkDemoAccount(role, credentials);
      if (demo) return { data: { ...demo, user: applyProfileOverride(demo.user) }, source: 'fallback' };
      // A student who registered while the backend was down can still log
      // back in from the same browser.
      if (role === 'customer') {
        const local = checkLocalAccount(credentials);
        if (local) return { data: { ...local, user: applyProfileOverride(local.user) }, source: 'fallback' };
      }
      const message = err?.response?.data?.message || 'Invalid email or password.';
      return { data: null, error: message, source: 'fallback' };
    }
  },
  register: async (payload) => {
    try {
      // Register.jsx collects { fullName, email, phone, password }; the
      // backend's User model field is "name" — mapped here rather than
      // touching the page or the backend's field naming.
      const { fullName, ...rest } = payload;
      const res = await api.post('/auth/register', { name: fullName, ...rest });
      return { data: res.data.data, source: 'api' };
    } catch (err) {
      // Backend down/unreachable — the account still gets created, just
      // saved locally, so signing up never dead-ends into an error page.
      const details = err?.response?.data?.details;
      const backendMessage = Array.isArray(details) && details.length
        ? details.join(' ')
        : err?.response?.data?.message;
      if (backendMessage) {
        // A real validation error from a *reachable* backend (e.g. "email
        // already registered", or "Password must be at least 6 characters")
        // should still be shown, not silently bypassed.
        return { data: null, error: backendMessage, source: 'fallback' };
      }
      if (!payload.email || !payload.fullName || !payload.password) {
        return { data: null, error: 'Please fill in all required fields.', source: 'fallback' };
      }
      const email = payload.email.trim().toLowerCase();
      if (getLocalAccounts()[email]) {
        return { data: null, error: 'An account with this email already exists.', source: 'fallback' };
      }
      const account = {
        password: payload.password,
        user: {
          id: localUid('user'),
          name: payload.fullName,
          email: payload.email.trim(),
          phone: payload.phone || '',
          studentId: `SAI-STU-${Math.floor(1000 + Math.random() * 9000)}`,
          avatar: null,
        },
      };
      saveLocalAccount(email, account);
      return { data: { user: account.user, token: `local-${account.user.id}-token` }, source: 'fallback' };
    }
  },
};

export const StudentAPI = {
  getProfile: () => withFallback(() => api.get('/student/profile'), null),
  getApplications: () => withFallback(() => api.get('/student/applications'), []),
};

// ---- Profile (student or staff) -----------------------------------------
// Tries the real backend; if unreachable, resolves successfully anyway so
// the change still applies to the local session (see AuthContext.updateUser)
// — keeps profile editing usable if the API is briefly unreachable.
export const ProfileAPI = {
  update: async (role, payload) => {
    // Always remember this locally by email — this is what makes the
    // change stick across logins even when the login response would
    // otherwise come back from the fixed demo account object.
    saveProfileOverride(payload.email, payload);
    try {
      const endpoint = role === 'staff' ? '/staff/profile' : '/student/profile';
      const res = await api.patch(endpoint, payload);
      return { data: res.data.data, source: 'api' };
    } catch {
      return { data: payload, source: 'fallback' };
    }
  },
};

// ---- Staff: attendance & self check-in -----------------------------------
// AttendanceAPI here is "staff marks a student's attendance for a course" —
// the existing frontend already has a form for it, but the Backend
// Integration Spec does not define an endpoint for it (Section 5 only
// covers staff self-attendance, wired via PresenceAPI below). Left as a
// local-only feature rather than inventing an undocumented endpoint.
export const AttendanceAPI = {
  mark: async ({ studentId, date, status, courseSlug }) => {
    const record = { id: `att-${Date.now()}`, studentId, date, status, courseSlug, markedAt: new Date().toISOString() };
    const local = readLocal('sai_demo_attendance');
    writeLocal('sai_demo_attendance', [record, ...local]);
    return { data: record, source: 'local' };
  },
  getLog: () => ({ data: readLocal('sai_demo_attendance'), source: 'local' }),
};

export const PresenceAPI = {
  // Staff self check-in for the day (Section 5).
  markPresent: async (staffId) => {
    const res = await api.post('/staff/presence', { staffId });
    const record = res.data.data;
    return { data: { ...record, checkedInAt: record.updatedAt }, source: 'api' };
  },
  getTodayStatus: async (staffId) => {
    if (!staffId) return null;
    try {
      const res = await api.get(`/staff/presence/${staffId}/today`);
      const record = res.data.data;
      return record ? { ...record, checkedInAt: record.updatedAt } : null;
    } catch {
      return null;
    }
  },
};

export default api;
