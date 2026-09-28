import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import CourseDetailModal from '../components/CourseDetailModal';
import Carousel from '../components/Carousel';
import { CourseCardSkeleton } from '../components/Skeletons';
import { CoursesAPI } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

export default function Courses() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [courses, setCourses] = useState(null);
  const [detailCourse, setDetailCourse] = useState(null);

  const load = () => {
    CoursesAPI.getAll().then((res) => setCourses(res.data || []));
  };

  useEffect(load, []);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>{t('courses.eyebrow')}</span>
          <h1>{t('courses.title')}</h1>
          <p>{t('courses.desc')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {courses === null && (
            <div className="grid-4">
              {Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)}
            </div>
          )}

          {courses && courses.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{t('courses.empty')}</p>
          )}

          {courses && courses.length > 0 && (
            <Carousel ariaLabel={t('courses.title')}>
              {courses.map((c) => <CourseCard key={c.id} course={c} onViewDetails={setDetailCourse} />)}
            </Carousel>
          )}
        </div>
      </section>

      <CourseDetailModal
        course={detailCourse}
        onClose={() => setDetailCourse(null)}
        onEnroll={(c) => navigate(`/admission?course=${c.slug}`)}
      />
    </>
  );
}
