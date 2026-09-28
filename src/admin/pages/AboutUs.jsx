import { useState } from 'react';
import { AdminStore, useAdminDb } from '../adminStore';
import FileDrop from '../ui/FileDrop';

export default function AboutUs() {
  useAdminDb();
  const about = AdminStore.getAbout();
  const [form, setForm] = useState({ mediaType: about.mediaType, mediaUrl: about.mediaUrl });
  const [saved, setSaved] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSave = (e) => {
    e.preventDefault();
    // Text content (heading/paragraphs/checklist/button) is no longer
    // editable here — pass the existing values through untouched so saving
    // the media doesn't blank them out on the public site.
    AdminStore.updateAbout({
      mediaType: form.mediaType,
      mediaUrl: form.mediaUrl,
      heading: about.heading,
      paragraphs: about.paragraphs,
      checklist: about.checklist,
      buttonText: about.buttonText,
      buttonLink: about.buttonLink,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="admin-page__head">
        <div>
          <h1>About Us Section</h1>
          <p>Controls the media shown in the public About section.</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="admin-panel">
          <h3>Image or Video</h3>
          <p className="admin-panel__hint">Choose whether the About section shows an image or a video, then upload the file from your device.</p>
          <div className="form-row">
            <label>Media Type</label>
            <select value={form.mediaType} onChange={(e) => set({ mediaType: e.target.value, mediaUrl: null })}>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div className="form-row">
            <label>{form.mediaType === 'video' ? 'Video File' : 'Image File'}</label>
            <FileDrop
              value={form.mediaUrl}
              onChange={(v) => set({ mediaUrl: v })}
              accept={form.mediaType === 'video' ? 'video/*' : 'image/*'}
              kind={form.mediaType}
              label={form.mediaType === 'video' ? 'Choose video' : 'Choose image'}
            />
          </div>
        </div>

        {saved && <p className="admin-success-note">About Us section updated.</p>}
        <button type="submit" className="btn btn-gold">Save Changes</button>
      </form>
    </div>
  );
}
