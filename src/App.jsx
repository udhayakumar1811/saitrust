import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import ScrollToTop from './components/ScrollToTop';
import SplashScreen from './components/SplashScreen';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Batches from './pages/Batches';
import Admission from './pages/Admission';
import Gallery from './pages/Gallery';
import Certification from './pages/Certification';
import Contact from './pages/Contact';
import Posts from './pages/Posts';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import StaffDashboard from './pages/StaffDashboard';
import StaffRedirect from './pages/StaffRedirect';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

import { AdminAuthProvider } from './admin/AdminAuthContext';
import AdminProtectedRoute from './admin/AdminProtectedRoute';
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/Dashboard';
import AdminHeroBanner from './admin/pages/HeroBanner';
import AdminCourses from './admin/pages/Courses';
import AdminBatches from './admin/pages/Batches';
import AdminAboutUs from './admin/pages/AboutUs';
import AdminGallery from './admin/pages/Gallery';
import AdminPosts from './admin/pages/Posts';
import AdminCertification from './admin/pages/Certification';
import AdminFooterSettings from './admin/pages/FooterSettings';
import AdminContactSubmissions from './admin/pages/ContactSubmissions';
import AdminStaffManagement from './admin/pages/StaffManagement';
import AdminAttendance from './admin/pages/Attendance';
import AdminPermissions from './admin/pages/Permissions';
import AdminStudents from './admin/pages/Students';
import AdminTheme from './admin/pages/Theme';
import AdminLogoSettings from './admin/pages/LogoSettings';
import { AdminStore, THEME_PRESETS, useAdminDb } from './admin/adminStore';
import { applyThemePreset } from './admin/applyTheme';

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Splash only shows once per browser tab session, not on every route change.
  const [showSplash, setShowSplash] = useState(() => !window.sessionStorage.getItem('sai_splash_seen'));

  // Apply whatever theme preset Admin last selected (Section 14) so the
  // public site reflects it on every load, not just right after selecting.
  // AdminStore.getTheme() kicks off a background fetch and returns the
  // cached (initially default) value immediately, so we also subscribe to
  // store changes and re-apply once the real value arrives from the API.
  useAdminDb();
  useEffect(() => {
    const { activePresetId } = AdminStore.getTheme();
    const preset = THEME_PRESETS.find((p) => p.id === activePresetId);
    if (preset) applyThemePreset(preset);
  });

  const handleSplashDone = () => {
    window.sessionStorage.setItem('sai_splash_seen', '1');
    setShowSplash(false);
  };

  if (showSplash && !isAdminRoute) {
    return <SplashScreen onDone={handleSplashDone} />;
  }

  if (isAdminRoute) {
    return (
      <AdminAuthProvider>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="hero-banner" element={<AdminHeroBanner />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="batches" element={<AdminBatches />} />
            <Route path="about" element={<AdminAboutUs />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="certification" element={<AdminCertification />} />
            <Route path="footer-settings" element={<AdminFooterSettings />} />
            <Route path="contact-submissions" element={<AdminContactSubmissions />} />
            <Route path="staff" element={<AdminStaffManagement />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="permissions" element={<AdminPermissions />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="theme" element={<AdminTheme />} />
            <Route path="logo" element={<AdminLogoSettings />} />
          </Route>
          <Route path="/admin/*" element={<NotFound />} />
        </Routes>
      </AdminAuthProvider>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:slug" element={<CourseDetails />} />
          <Route path="/batches" element={<Batches />} />
          <Route path="/posts" element={<Posts />} />
          <Route
            path="/admission"
            element={
              <ProtectedRoute role="customer">
                <Admission />
              </ProtectedRoute>
            }
          />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/certification" element={<Certification />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute role={null}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute role="staff">
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/redirect"
            element={
              <ProtectedRoute role="staff">
                <StaffRedirect />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
