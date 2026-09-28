import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ArtPanel from '../components/ArtPanel';
import CourseCard from '../components/CourseCard';
import CourseDetailModal from '../components/CourseDetailModal';
import BatchCard from '../components/BatchCard';
import PostCard from '../components/PostCard';
import VideoModal from '../components/VideoModal';
import PostModal from '../components/PostModal';
import Carousel from '../components/Carousel';
import { CourseCardSkeleton, BatchCardSkeleton } from '../components/Skeletons';
import { CoursesAPI, BatchesAPI, UpdatesAPI, StaffPostsAPI, HeroAPI } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  IconAward, IconUsers, IconClock, IconCalendar, IconCheck, IconArrow, IconStar,
} from '../components/Icons';

export default function Home() {
  const { t } = useLanguage();
  const { isStaff } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState(null);
  const [batches, setBatches] = useState(null);
  const [posts, setPosts] = useState(null);
  const [heroImage, setHeroImage] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [activePost, setActivePost] = useState(null);
  const [detailCourse, setDetailCourse] = useState(null);

  const HIGHLIGHTS = [
    { icon: IconUsers, title: t('highlights.openTitle'), sub: t('highlights.openSub') },
    { icon: IconCalendar, title: t('highlights.ageTitle'), sub: t('highlights.ageSub') },
    { icon: IconCheck, title: t('highlights.freeTitle'), sub: t('highlights.freeSub') },
    { icon: IconAward, title: t('highlights.isoTitle'), sub: t('highlights.isoSub') },
  ];

  const WHY_US = [
    { icon: IconCheck, title: t('common.why1Title'), desc: t('common.why1Desc') },
    { icon: IconUsers, title: t('common.why2Title'), desc: t('common.why2Desc') },
    { icon: IconAward, title: t('common.why3Title'), desc: t('common.why3Desc') },
    { icon: IconClock, title: t('common.why4Title'), desc: t('common.why4Desc') },
    { icon: IconCalendar, title: t('common.why5Title'), desc: t('common.why5Desc') },
    { icon: IconStar, title: t('common.why6Title'), desc: t('common.why6Desc') },
  ];

  const loadCourses = () => {
    CoursesAPI.getAll().then((res) => setCourses(res.data || []));
  };

  const loadBatches = () => {
    BatchesAPI.getUpcoming().then((res) => setBatches(res.data || []));
  };

  const loadPosts = () => {
    UpdatesAPI.getAll().then((res) => {
      const sorted = [...(res.data || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
      setPosts(sorted.slice(0, 8));
    });
  };

  const handleDeletePost = async (post) => {
    await StaffPostsAPI.remove(post.id);
    loadPosts();
  };

  useEffect(() => {
    loadCourses();
    loadBatches();
    loadPosts();
    // Admin-uploaded hero image, if any — falls back to the illustrated panel.
    HeroAPI.getActive().then((res) => setHeroImage(res.data?.imageUrl || null));
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__content">
            <span className="eyebrow">{t('hero.eyebrow')}</span>
            <h1 className="hero__title">
              {t('hero.titleLine1')}<br />
              <span className="gold-text">{t('hero.titleLine2')}</span>
            </h1>
            <p className="hero__sub">{t('hero.sub')}</p>
            <p className="hero__desc">{t('hero.desc')}</p>
            <div className="hero__actions">
              {!isStaff && (
                <Link to="/admission" className="btn btn-gold">{t('hero.enroll')} <IconArrow size={16} /></Link>
              )}
              <Link to="/about" className="btn btn-ghost">{t('hero.knowMore')}</Link>
            </div>

            <div className="hero__stats">
              <div><strong>1000+</strong><span>{t('hero.statsStudents')}</span></div>
              <div><strong>4</strong><span>{t('hero.statsCourses')}</span></div>
              <div><strong>ISO</strong><span>{t('hero.statsIso')}</span></div>
            </div>
          </div>

          <div className="hero__media">
            <div className="hero__media-frame">
              {heroImage ? (
                <img src={heroImage} alt="SAI International Social Service Trust training" style={{ borderRadius: 'inherit', width: '100%', aspectRatio: '4 / 5', objectFit: 'cover' }} />
              ) : (
                <ArtPanel icon="users" ratio="4 / 5" />
              )}
              <div className="hero__badge">
                <span className="hero__badge-top">ISO</span>
                <span className="hero__badge-bottom">{t('hero.badgeCertified')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHT STRIP */}
      <section className="highlight-strip">
        <div className="container highlight-strip__grid">
          {HIGHLIGHTS.map((h) => (
            <div className="highlight-strip__item" key={h.title}>
              <span className="highlight-strip__icon"><h.icon size={22} /></span>
              <div>
                <strong>{h.title}</strong>
                <span>{h.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COURSES */}
      <section className="section" id="courses">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow" style={{ justifyContent: 'center' }}>{t('common.coursesEyebrow')}</span>
            <h2>{t('common.ourCourses')}</h2>
            <div className="divider-gold" />
          </div>

          {courses === null ? (
            <div className="grid-4">
              {Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)}
            </div>
          ) : (
            <Carousel ariaLabel={t('common.ourCourses')}>
              {courses.map((c) => <CourseCard key={c.id} course={c} onViewDetails={setDetailCourse} />)}
            </Carousel>
          )}

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/courses" className="btn btn-outline-dark">{t('common.viewAllCourses')}</Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="section section--tight why-section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow" style={{ justifyContent: 'center' }}>{t('common.whyChooseEyebrow')}</span>
            <h2>{t('common.whyChoose')}</h2>
            <div className="divider-gold" />
          </div>
          <div className="grid-3">
            {WHY_US.map((w) => (
              <div className="why-card" key={w.title}>
                <span className="why-card__icon"><w.icon size={24} /></span>
                <h4>{w.title}</h4>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UPCOMING BATCHES */}
      <section className="section batches-section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow" style={{ justifyContent: 'center', color: 'var(--gold-light)' }}>{t('common.planStartDate')}</span>
            <h2 style={{ color: 'var(--text-on-ink)' }}>{t('common.upcomingBatches')}</h2>
            <div className="divider-gold" />
            <p style={{ color: 'var(--text-on-ink-muted)' }}>{t('common.pickSlot')}</p>
          </div>

          {batches === null ? (
            <div className="batches-grid">
              {Array.from({ length: 4 }).map((_, i) => <BatchCardSkeleton key={i} />)}
            </div>
          ) : (
            <Carousel size="batches" ariaLabel={t('common.upcomingBatches')}>
              {batches.map((b) => <BatchCard key={b.id} batch={b} />)}
            </Carousel>
          )}

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/batches" className="btn btn-ghost">{t('common.viewAllBatches')}</Link>
          </div>
        </div>
      </section>

      {/* POSTS & UPDATES */}
      <section className="section section--tight">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow" style={{ justifyContent: 'center' }}>{t('nav.posts')}</span>
            <h2>{t('common.latestUpdates')}</h2>
            <div className="divider-gold" />
          </div>

          {posts === null && (
            <div className="grid-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ aspectRatio: '3 / 4', borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          )}
          {posts && posts.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{t('common.noPosts')}</div>
          )}
          {posts && posts.length > 0 && (
            <Carousel size="posts" ariaLabel={t('common.latestUpdates')}>
              {posts.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  onWatch={setActiveVideo}
                  onView={setActivePost}
                  onDelete={handleDeletePost}
                />
              ))}
            </Carousel>
          )}

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/posts" className="btn btn-outline-dark">{t('common.viewAllUpdates')}</Link>
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="cta-strip">
        <div className="container cta-strip__inner">
          <div>
            <h3>{t('common.readyTitle')}</h3>
            <p>{t('common.readyDesc')}</p>
          </div>
          {!isStaff && (
            <Link to="/admission" className="btn btn-gold">{t('common.applyAdmission')} <IconArrow size={16} /></Link>
          )}
        </div>
      </section>

      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      <PostModal post={activePost} onClose={() => setActivePost(null)} />
      <CourseDetailModal
        course={detailCourse}
        onClose={() => setDetailCourse(null)}
        onEnroll={(c) => navigate(`/admission?course=${c.slug}`)}
      />
    </>
  );
}
