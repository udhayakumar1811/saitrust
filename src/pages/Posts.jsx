import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import VideoModal from '../components/VideoModal';
import PostModal from '../components/PostModal';
import Carousel from '../components/Carousel';
import { UpdatesAPI, StaffPostsAPI } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

export default function Posts() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState(null);
  const [active, setActive] = useState(null);
  const [activePost, setActivePost] = useState(null);

  const load = () => {
    UpdatesAPI.getAll().then((res) => {
      const sorted = [...(res.data || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
      setPosts(sorted);
    });
  };

  const handleDelete = async (post) => {
    await StaffPostsAPI.remove(post.id);
    load();
  };

  useEffect(load, []);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>Posts & Updates</span>
          <h1>Latest News From SAI Trust</h1>
          <p>Admissions, training sessions, events and activities — updated regularly by our team.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
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
            <Carousel size="posts" ariaLabel="Posts and updates">
              {posts.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  onWatch={setActive}
                  onView={setActivePost}
                  onDelete={handleDelete}
                />
              ))}
            </Carousel>
          )}
        </div>
      </section>

      <VideoModal video={active} onClose={() => setActive(null)} />
      <PostModal post={activePost} onClose={() => setActivePost(null)} />
    </>
  );
}
