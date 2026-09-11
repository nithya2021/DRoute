import React, { useRef, useState } from 'react';
import { api } from '../services/api';

export const SingleRouteSection: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('origin', origin);
      formData.append('destination', destination);

      const response = await api.post('/route', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
      });

      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `optimised-route-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setMessageType('success');
      setMessage('Optimised route downloaded.');
    } catch (error: any) {
      // The error body arrives as a Blob because the request asked for one.
      const payload = error.response?.data;
      const text = payload instanceof Blob ? await payload.text() : null;
      let detail = 'Failed to build the route. Is the server running?';
      if (text) {
        try {
          const parsed = JSON.parse(text);
          detail = parsed.details || parsed.error || detail;
        } catch {
          detail = text;
        }
      }
      setMessageType('error');
      setMessage(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <h2>Optimised Route</h2>

      <div className="card">
        <div className="field">
          <label htmlFor="origin">Start point</label>
          <input
            id="origin"
            type="text"
            placeholder="e.g. 10 Anson Road, S 079903"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            disabled={loading}
          />
          <p className="field-hint">Where the driver sets off. Leave blank to start at the first delivery.</p>
        </div>

        <div className="field">
          <label htmlFor="destination">End point</label>
          <input
            id="destination"
            type="text"
            placeholder="e.g. 1 Woodlands Square, S 738099"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            disabled={loading}
          />
          <p className="field-hint">Where the driver finishes. Leave blank to end at the last delivery.</p>
        </div>

        <div className="upload-area">
          <div className="upload-box" onClick={() => fileInputRef.current?.click()}>
            <div className="upload-icon">📁</div>
            <p className="upload-text">{file ? file.name : 'Click to select Excel file'}</p>
            <p className="upload-hint">Delivery addresses, one per row</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setMessage('');
            }}
            disabled={loading}
            style={{ display: 'none' }}
          />
        </div>

        <button className="btn btn-primary" onClick={handleSubmit} disabled={!file || loading}>
          {loading ? 'Optimising…' : 'Build Route & Download'}
        </button>

        {message && (
          <div className={`message ${messageType}`}>
            {messageType === 'success' ? '✓' : '✕'} {message}
          </div>
        )}

        <div className="format-info">
          <h3>Excel File Format</h3>
          <p>An address column is required. A name column is used when present.</p>
          <ul>
            <li>
              The postal code can be its own column, or left inside the address —{' '}
              <strong>#05-34, S 518208</strong> and <strong>(S)730764</strong> both work
            </li>
            <li>Contact number and notes are carried through when present</li>
            <li>
              Rows with no six-digit postal code cannot be placed, and are listed on a{' '}
              <strong>Not Routed</strong> sheet with their row numbers
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
