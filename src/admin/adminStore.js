// ---------------------------------------------------------------------------
// Admin data layer — backed by the real backend API (see Backend
// Integration Spec).
//
// Every screen reads through the synchronous AdminStore.getX() getters
// below, exactly as before: they return whatever is currently cached
// in memory and trigger a background fetch the first time they're called.
// When that fetch resolves, the cache updates and the same pub/sub
// (CustomEvent) used previously notifies every subscribed component, so
// screens still re-render automatically with zero polling and no page
// needing to be rewritten to "await" a read.
//
// Mutations (add/update/delete) apply an optimistic update to the cache
// immediately (so the UI feels instant), fire the real API call in the
// background, and reconcile the cache with the server's response — or roll
// the optimistic change back and log an error if the call fails. Nothing
// in the page components needs to change for this, since none of them use
// the mutators' return value except StaffManagement.jsx (staff accounts are
// backend-generated — see addStaffAccount below), which awaits it directly.
// ---------------------------------------------------------------------------

import axios from 'axios';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../services/api';

const EVENT = 'sai-admin-db-change';
const ERROR_EVENT = 'sai-admin-error';

const uid = (prefix = 'id') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const todayStr = () => new Date().toISOString().slice(0, 10);

// Separate axios instance/session from the public site's `api` (see
// services/api.js) — Admin login is intentionally its own auth flow
// (Backend Spec Section 1), stored under its own localStorage key, so it
// needs its own bearer-token interceptor rather than sharing the
// customer/staff one.
export const adminApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  if (config.headers?.Authorization) return config; // caller set it explicitly
  try {
    const adminRaw = window.localStorage.getItem('sai_admin_auth');
    let token = adminRaw ? JSON.parse(adminRaw)?.token : null;
    // Staff use these same shared widgets (e.g. the file picker on the Staff
    // Dashboard) while signed in through the public site session, so fall
    // back to that token — otherwise their uploads go out unauthenticated
    // and the backend rejects them.
    if (!token) {
      const userRaw = window.localStorage.getItem('sai_auth');
      token = userRaw ? JSON.parse(userRaw)?.token : null;
    }
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // ignore malformed storage
  }
  return config;
});

export const THEME_PRESETS = [
  { id: 'gold-black', name: 'Gold & Black (Default)', ink: '#0c0c0d', gold: '#c99b3f', goldLight: '#e8c876', maroon: '#5c0f18', cream: '#fbf6ec' },
  { id: 'royal-blue', name: 'Royal Blue & Ivory', ink: '#0b1220', gold: '#4b7bec', goldLight: '#8fb2f5', maroon: '#1e3a8a', cream: '#f3f6fb' },
  { id: 'emerald', name: 'Emerald & Cream', ink: '#0a1f16', gold: '#2f9e6e', goldLight: '#7fd6ac', maroon: '#0f5132', cream: '#f2f9f4' },
  { id: 'rose-gold', name: 'Rose Gold & Blush', ink: '#241417', gold: '#d98c9c', goldLight: '#f0bcc7', maroon: '#8a2c3d', cream: '#fdf3f2' },
  { id: 'plum', name: 'Plum & Lilac', ink: '#1c1024', gold: '#9b6bd6', goldLight: '#c8a8ef', maroon: '#4a1b6b', cream: '#f6f1fb' },
  { id: 'teal', name: 'Teal & Sand', ink: '#0b1f1f', gold: '#2fa9a1', goldLight: '#7fd4cd', maroon: '#0d4f4a', cream: '#f2f9f8' },
  { id: 'crimson', name: 'Crimson & Charcoal', ink: '#141212', gold: '#c9403f', goldLight: '#e88a89', maroon: '#7a1414', cream: '#f8f1ef' },
  { id: 'amber-earth', name: 'Amber & Earth', ink: '#1c1610', gold: '#d98c2b', goldLight: '#f0bd76', maroon: '#7a4315', cream: '#faf3e8' },
  { id: 'ocean', name: 'Ocean & Foam', ink: '#0a1a24', gold: '#2b8fd9', goldLight: '#7fc2ef', maroon: '#0d3a5c', cream: '#eef7fb' },
  { id: 'graphite', name: 'Graphite & Silver', ink: '#121212', gold: '#8a8f99', goldLight: '#c3c7cf', maroon: '#3c3f47', cream: '#f4f4f5' },
];

function emptyDb() {
  return {
    heroImages: [],
    courses: [],
    batches: [],
    about: { mediaType: 'image', mediaUrl: null, heading: '', paragraphs: [], checklist: [], buttonText: 'Learn More', buttonLink: '/about' },
    gallery: [],
    posts: [],
    certification: [],
    footer: { phones: [], whatsapp: '', email: '', address: '', staffDashboardUrl: '', logoUrl: null, social: { instagram: '', facebook: '', youtube: '' } },
    contactSubmissions: [],
    staffAccounts: [],
    attendance: [], // flat list of { staffId, date, status, source, updatedAt }, dates fetched on demand
    permissionRequests: [],
    theme: { activePresetId: 'gold-black' },
    students: [],
  };
}

let db = emptyDb();
// Tracks which top-level keys/singletons have had a fetch kicked off, so
// getters only trigger one background load instead of one per render.
const loaded = new Set();
// Tracks which attendance dates have been fetched (see getEffectiveStatus).
const loadedAttendanceDates = new Set();

function notify() {
  window.dispatchEvent(new CustomEvent(EVENT));
}

function setDb(patch) {
  db = { ...db, ...patch };
  notify();
}

export function subscribeAdminDb(callback) {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

// Lets the admin shell show a visible banner whenever a background
// fetch/add/update/delete fails — previously these only went to the
// console, so a failed action (e.g. a rejected course add) just looked
// like it silently vanished with no clue why.
export function subscribeAdminErrors(callback) {
  const handler = (e) => callback(e.detail);
  window.addEventListener(ERROR_EVENT, handler);
  return () => window.removeEventListener(ERROR_EVENT, handler);
}
function notifyError(message) {
  window.dispatchEvent(new CustomEvent(ERROR_EVENT, { detail: message }));
}

// Re-renders the calling component whenever the admin DB changes — used by
// every admin screen (and public pages that read admin data) so edits show
// up live without a manual refresh.
export function useAdminDb() {
  const [, setTick] = useState(0);
  useEffect(() => subscribeAdminDb(() => setTick((t) => t + 1)), []);
}

function friendlyMessage(err) {
  const details = err?.response?.data?.details;
  if (Array.isArray(details) && details.length) return details.join(' ');
  return err?.response?.data?.message || err.message || 'Something went wrong.';
}
function logFetchError(key, err) {
  const message = friendlyMessage(err);
  console.error(`[adminStore] Failed to load ${key}:`, message);
  notifyError(`Couldn't load ${key}: ${message}`);
}
function logMutateError(action, err) {
  const message = friendlyMessage(err);
  console.error(`[adminStore] ${action} failed:`, message);
  notifyError(`Couldn't ${action}: ${message}`);
}

// ---- Generic list-collection helpers -------------------------------------
// `mapIn`/`mapOut` adapt between the page's field names and the backend's,
// for the handful of collections where they differ (hero images, posts).
function ensureListLoaded(key, url, mapIn = (x) => x) {
  if (loaded.has(key)) return;
  loaded.add(key);
  adminApi
    .get(url)
    .then((res) => setDb({ [key]: (res.data.data || []).map(mapIn) }))
    .catch((err) => {
      loaded.delete(key); // allow a retry on the next getter call
      logFetchError(key, err);
    });
}

// Unlike ensureListLoaded, this always re-fetches — used to poll the
// handful of collections that are meant to update in near-real-time from
// someone else's action (staff posting, staff requesting permission),
// where waiting for a full page reload isn't good enough.
function refreshList(key, url, mapIn = (x) => x) {
  return adminApi
    .get(url)
    .then((res) => setDb({ [key]: (res.data.data || []).map(mapIn) }))
    .catch((err) => logFetchError(key, err));
}

function optimisticAdd(key, tempItem) {
  setDb({ [key]: [tempItem, ...db[key]] });
}
function reconcileItem(key, tempId, realItem) {
  setDb({ [key]: db[key].map((it) => (it.id === tempId ? realItem : it)) });
}
function rollbackAdd(key, tempId) {
  setDb({ [key]: db[key].filter((it) => it.id !== tempId) });
}
function optimisticPatch(key, id, patch) {
  const previous = db[key].find((it) => it.id === id);
  setDb({ [key]: db[key].map((it) => (it.id === id ? { ...it, ...patch } : it)) });
  return previous;
}
function rollbackPatch(key, id, previous) {
  if (!previous) return;
  setDb({ [key]: db[key].map((it) => (it.id === id ? previous : it)) });
}
function optimisticDelete(key, id) {
  const previous = db[key].find((it) => it.id === id);
  setDb({ [key]: db[key].filter((it) => it.id !== id) });
  return previous;
}
function rollbackDelete(key, id, previous) {
  if (!previous) return;
  setDb({ [key]: [previous, ...db[key]] });
}

function addViaApi(key, url, payload, mapOut = (x) => x, mapIn = (x) => x) {
  const tempId = uid(key);
  optimisticAdd(key, { id: tempId, ...payload });
  adminApi
    .post(url, mapOut(payload))
    .then((res) => reconcileItem(key, tempId, mapIn(res.data.data)))
    .catch((err) => {
      rollbackAdd(key, tempId);
      logMutateError(`add ${key}`, err);
    });
}
function updateViaApi(key, url, id, patch, mapOut = (x) => x, mapIn = (x) => x) {
  const previous = optimisticPatch(key, id, patch);
  adminApi
    .patch(url, mapOut(patch))
    .then((res) => reconcileItem(key, id, mapIn(res.data.data)))
    .catch((err) => {
      rollbackPatch(key, id, previous);
      logMutateError(`update ${key}`, err);
    });
}
function deleteViaApi(key, url, id) {
  const previous = optimisticDelete(key, id);
  adminApi.delete(url).catch((err) => {
    rollbackDelete(key, id, previous);
    logMutateError(`delete ${key}`, err);
  });
}

// ---- Hero image field mapping -----------------------------------------
// Admin page uses { image, caption }; backend uses { imageUrl, title }.
const heroIn = (h) => ({ id: h.id, image: h.imageUrl, caption: h.title });
const heroOut = (h) => ({ imageUrl: h.image, title: h.caption });

// ---- Post field mapping -------------------------------------------------
// Admin/staff pages use `media`; backend uses `mediaUrl`.
const postIn = (p) => ({ ...p, media: p.mediaUrl });
const postOut = (p) => {
  const { media, ...rest } = p;
  return media !== undefined ? { ...rest, mediaUrl: media } : rest;
};

export const AdminStore = {
  // Forces every collection to re-fetch from the server on next access.
  reset() {
    db = emptyDb();
    loaded.clear();
    loadedAttendanceDates.clear();
    notify();
  },

  // ---- Hero banner images (Section 3.1) ----
  getHeroImages: () => {
    ensureListLoaded('heroImages', '/hero-images', heroIn);
    return db.heroImages;
  },
  addHeroImage: (image) => addViaApi('heroImages', '/hero-images', image, heroOut, heroIn),
  updateHeroImage: (id, patch) => updateViaApi('heroImages', `/hero-images/${id}`, id, patch, heroOut, heroIn),
  deleteHeroImage: (id) => deleteViaApi('heroImages', `/hero-images/${id}`, id),

  // ---- Courses (Section 3.2) ----
  getCourses: () => {
    ensureListLoaded('courses', '/courses');
    return db.courses;
  },
  addCourse: (course) => addViaApi('courses', '/courses', course),
  updateCourse: (id, patch) => updateViaApi('courses', `/courses/${id}`, id, patch),
  deleteCourse: (id) => deleteViaApi('courses', `/courses/${id}`, id),

  // ---- Batches (public Batches page + Admission form) ----
  getBatches: () => {
    ensureListLoaded('batches', '/batches');
    return db.batches;
  },
  addBatch: (batch) => addViaApi('batches', '/batches', batch),
  updateBatch: (id, patch) => updateViaApi('batches', `/batches/${id}`, id, patch),
  deleteBatch: (id) => deleteViaApi('batches', `/batches/${id}`, id),

  // ---- About Us (Section 3.3, singleton) ----
  getAbout: () => {
    if (!loaded.has('about')) {
      loaded.add('about');
      adminApi
        .get('/about')
        .then((res) => setDb({ about: res.data.data }))
        .catch((err) => {
          loaded.delete('about');
          logFetchError('about', err);
        });
    }
    return db.about;
  },
  updateAbout: (patch) => {
    setDb({ about: { ...db.about, ...patch } });
    adminApi.patch('/about', patch).catch((err) => logMutateError('update about', err));
  },

  // ---- Gallery (Section 3.4) ----
  getGallery: () => {
    ensureListLoaded('gallery', '/gallery');
    return db.gallery;
  },
  addGalleryImage: (item) => addViaApi('gallery', '/gallery', item),
  updateGalleryImage: (id, patch) => updateViaApi('gallery', `/gallery/${id}`, id, patch),
  deleteGalleryImage: (id) => deleteViaApi('gallery', `/gallery/${id}`, id),

  // ---- Posts & Updates — shared Admin + Staff (Section 3.5 / 10) ----
  getPosts: () => {
    ensureListLoaded('posts', '/posts', postIn);
    return db.posts;
  },
  // Polled by the admin Posts page so staff-created posts show up without
  // needing a manual page reload.
  refreshPosts: () => refreshList('posts', '/posts', postIn),
  addPost: (post) => addViaApi('posts', '/posts', { date: todayStr(), ...post }, postOut, postIn),
  updatePost: (id, patch) => updateViaApi('posts', `/posts/${id}`, id, patch, postOut, postIn),
  deletePost: (id) => deleteViaApi('posts', `/posts/${id}`, id),

  // ---- Certification (Section 3.6) ----
  getCertification: () => {
    ensureListLoaded('certification', '/certification');
    return db.certification;
  },
  addCertification: (item) => addViaApi('certification', '/certification', item),
  updateCertification: (id, patch) => updateViaApi('certification', `/certification/${id}`, id, patch),
  deleteCertification: (id) => deleteViaApi('certification', `/certification/${id}`, id),

  // ---- Footer / contact settings (Section 3.7, singleton) ----
  getFooterSettings: () => {
    if (!loaded.has('footer')) {
      loaded.add('footer');
      adminApi
        .get('/settings')
        .then((res) => setDb({ footer: res.data.data }))
        .catch((err) => {
          loaded.delete('footer');
          logFetchError('footer', err);
        });
    }
    return db.footer;
  },
  updateFooterSettings: (patch) => {
    setDb({ footer: { ...db.footer, ...patch } });
    adminApi.patch('/settings', patch).catch((err) => logMutateError('update settings', err));
  },

  // ---- Contact form submissions (Section 3.8) ----
  getContactSubmissions: () => {
    ensureListLoaded('contactSubmissions', '/contact-submissions');
    return db.contactSubmissions;
  },
  deleteContactSubmission: (id) => deleteViaApi('contactSubmissions', `/contact-submissions/${id}`, id),

  // ---- Staff accounts (Section 4) ----
  getStaffAccounts: () => {
    ensureListLoaded('staffAccounts', '/staff');
    return db.staffAccounts;
  },
  // The backend generates staffId, login email and a temporary password
  // (never the client) — this returns a Promise so StaffManagement.jsx can
  // await and display the server-issued credentials once.
  addStaffAccount: async ({ name, phone }) => {
    const res = await adminApi.post('/staff', { name, phone });
    const created = res.data.data; // { staffId, email, password }
    // Refresh the list so the cache has the record's real id (needed for
    // subsequent update/delete calls), then attach the one-time password
    // to that entry purely for on-screen display.
    const listRes = await adminApi.get('/staff');
    const staffList = listRes.data.data || [];
    const withPassword = staffList.map((s) => (s.staffId === created.staffId ? { ...s, password: created.password } : s));
    setDb({ staffAccounts: withPassword });
    loaded.add('staffAccounts');
    return withPassword.find((s) => s.staffId === created.staffId);
  },
  updateStaffAccount: (id, patch) => updateViaApi('staffAccounts', `/staff/${id}`, id, patch),
  deleteStaffAccount: (id) => deleteViaApi('staffAccounts', `/staff/${id}`, id),

  // ---- Attendance (Section 5) ----
  getAttendance: () => db.attendance,
  // Staff self-check-in for today (idempotent per staff/day).
  markSelfPresent: (staffId) => {
    const today = todayStr();
    const record = { id: uid('att'), staffId, date: today, status: 'present', source: 'self', updatedAt: new Date().toISOString() };
    setDb({ attendance: [record, ...db.attendance.filter((r) => !(r.staffId === staffId && r.date === today))] });
    adminApi.post('/staff/presence', { staffId }).catch((err) => logMutateError('mark presence', err));
    return record;
  },
  // Admin sets/overrides a status for a given staff/date.
  setAttendance: (staffId, date, status) => {
    const record = { id: uid('att'), staffId, date, status, source: 'admin', updatedAt: new Date().toISOString() };
    setDb({ attendance: [record, ...db.attendance.filter((r) => !(r.staffId === staffId && r.date === date))] });
    adminApi.patch(`/attendance/${staffId}/${date}`, { status }).catch((err) => logMutateError('set attendance', err));
    return record;
  },
  // Resolves the effective status for a staff/date, applying the
  // auto-absent rule for any past day with no explicit record. Triggers a
  // background fetch of that date's attendance the first time it's asked
  // for, same lazy-load pattern as the list collections above.
  getEffectiveStatus: (staffId, date) => {
    if (!loadedAttendanceDates.has(date)) {
      loadedAttendanceDates.add(date);
      adminApi
        .get('/attendance', { params: { date } })
        .then((res) => {
          const forDate = res.data.data || [];
          const others = db.attendance.filter((r) => r.date !== date);
          const merged = forDate
            .filter((r) => r.status !== 'unmarked')
            .map((r) => ({ id: uid('att'), ...r }));
          setDb({ attendance: [...merged, ...others] });
        })
        .catch((err) => {
          loadedAttendanceDates.delete(date);
          logFetchError(`attendance ${date}`, err);
        });
    }
    const rec = db.attendance.find((r) => r.staffId === staffId && r.date === date);
    if (rec) return rec;
    if (date < todayStr()) {
      return { staffId, date, status: 'absent', source: 'auto' };
    }
    return { staffId, date, status: 'unmarked', source: null };
  },
  // Polled by the admin Attendance page so a staff self-check-in shows up
  // live, matching the "visible here in real time" promise on that page.
  refreshAttendance: (date) =>
    adminApi
      .get('/attendance', { params: { date } })
      .then((res) => {
        const forDate = res.data.data || [];
        const others = db.attendance.filter((r) => r.date !== date);
        const merged = forDate.filter((r) => r.status !== 'unmarked').map((r) => ({ id: uid('att'), ...r }));
        setDb({ attendance: [...merged, ...others] });
      })
      .catch((err) => logFetchError(`attendance ${date}`, err)),

  // ---- Permission / leave requests (Section 6) ----
  getPermissionRequests: () => {
    ensureListLoaded('permissionRequests', '/permission-requests');
    return db.permissionRequests;
  },
  // Polled by the admin Permission Requests page so a staff member's new
  // request shows up without needing a manual page reload.
  refreshPermissionRequests: () => refreshList('permissionRequests', '/permission-requests'),
  addPermissionRequest: (req) => addViaApi('permissionRequests', '/permission-requests', { status: 'pending', createdAt: new Date().toISOString(), ...req }),
  approvePermissionRequest: (id) => updateViaApi('permissionRequests', `/permission-requests/${id}/approve`, id, { status: 'approved' }, () => ({})),
  declinePermissionRequest: (id) => updateViaApi('permissionRequests', `/permission-requests/${id}/decline`, id, { status: 'declined' }, () => ({})),
  completePermissionRequest: (id) => updateViaApi('permissionRequests', `/permission-requests/${id}/complete`, id, { status: 'completed' }, () => ({})),

  // ---- Theme (Section 8, singleton) ----
  getTheme: () => {
    if (!loaded.has('theme')) {
      loaded.add('theme');
      adminApi
        .get('/theme')
        .then((res) => setDb({ theme: res.data.data }))
        .catch((err) => {
          loaded.delete('theme');
          logFetchError('theme', err);
        });
    }
    return db.theme;
  },
  setTheme: (activePresetId) => {
    setDb({ theme: { activePresetId } });
    adminApi.patch('/theme', { activePresetId }).catch((err) => logMutateError('set theme', err));
  },

  // ---- Students (Section 7) ----
  getStudents: () => {
    ensureListLoaded('students', '/students');
    return db.students;
  },
  addStudent: (s) => addViaApi('students', '/students', s),
  updateStudent: (id, patch) => updateViaApi('students', `/students/${id}`, id, patch),
  deleteStudent: (id) => deleteViaApi('students', `/students/${id}`, id),

  todayStr,
};
