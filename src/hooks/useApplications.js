import { useCallback, useEffect, useState } from 'react';
import { ApplicationsAPI, APPLICATIONS_EVENT } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * The logged-in student's applications, shared by the course/batch cards
 * (so they can show "Applied" instead of "Enroll Now") and by the Student
 * Dashboard. Re-reads whenever an application is created or cancelled
 * anywhere in the app.
 */
export default function useApplications() {
  const { isCustomer } = useAuth();
  const [applications, setApplications] = useState(isCustomer ? null : []);

  const reload = useCallback(() => {
    if (!isCustomer) {
      setApplications([]);
      return;
    }
    ApplicationsAPI.mine().then(setApplications);
  }, [isCustomer]);

  useEffect(() => {
    reload();
    window.addEventListener(APPLICATIONS_EVENT, reload);
    return () => window.removeEventListener(APPLICATIONS_EVENT, reload);
  }, [reload]);

  return { applications: applications || [], loading: applications === null, reload };
}
