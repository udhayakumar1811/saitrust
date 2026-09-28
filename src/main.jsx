import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { LanguageProvider } from './i18n/LanguageContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';
import './components/Navbar.css';
import './components/Footer.css';
import './components/shared.css';
import './pages/Home.css';
import './pages/pages.css';
import './pages/forms.css';
import './admin/admin.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>,
);
