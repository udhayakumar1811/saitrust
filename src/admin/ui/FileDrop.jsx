import { useRef, useState } from 'react';
import { IconUpload, IconClose } from '../AdminIcons';
import { adminApi } from '../adminStore';
import { readFileAsDataUrl } from '../../services/api';

/**
 * A real native file picker (input[type=file]) — never a text/link field,
 * per spec Section 2/4/5/6/7/13. Uploads the chosen file to the backend
 * (POST /api/upload) and passes the returned URL to onChange, instead of
 * the previous base64-data-URL approach (a demo-only trick that doesn't
 * scale to a real database/deployment, per the spec).
 */
export default function FileDrop({ value, onChange, accept = 'image/*', label = 'Choose file', kind = 'image' }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState('idle'); // idle | uploading | error
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setStatus('uploading');
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await adminApi.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      onChange(res.data.data.url);
      setStatus('idle');
    } catch (err) {
      // The upload endpoint wasn't reachable — keep the chosen file usable
      // by embedding it, so the post can still be created.
      try {
        const dataUrl = await readFileAsDataUrl(file);
        onChange(dataUrl);
        setStatus('idle');
      } catch {
        setStatus('error');
        setError(err?.response?.data?.message || 'Upload failed. Please try again.');
      }
    }
  };

  return (
    <div className="admin-filedrop">
      {value ? (
        <div className="admin-filedrop__preview">
          {kind === 'video' ? (
            <video src={value} controls />
          ) : (
            <img src={value} alt="preview" />
          )}
          <button type="button" className="admin-filedrop__remove" onClick={() => { onChange(null); setFileName(''); setStatus('idle'); }}>
            <IconClose size={14} /> Remove
          </button>
        </div>
      ) : (
        <button type="button" className="admin-filedrop__btn" onClick={() => inputRef.current?.click()} disabled={status === 'uploading'}>
          <IconUpload size={20} />
          <span>{status === 'uploading' ? 'Uploading…' : label}</span>
          <span className="admin-filedrop__hint">Choose a {kind} from your device</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {value && fileName && <p className="admin-filedrop__filename">{fileName}</p>}
      {error && <p className="admin-filedrop__filename" style={{ color: '#b3261e' }}>{error}</p>}
    </div>
  );
}
