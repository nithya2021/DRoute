import React, { useRef, useState } from 'react';
import { api } from '../services/api';

export const ImportSection: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/import/excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessageType('success');
      setMessage(`Successfully imported ${response.data.stopsCount} delivery stops`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.response?.data?.details || 'Failed to import file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <h2>Import Deliveries</h2>

      <div className="card">
        <div className="upload-area">
          <div
            className="upload-box"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon">📁</div>
            <p className="upload-text">Click to select Excel file</p>
            <p className="upload-hint">(.xlsx or .xls format)</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            disabled={loading}
            style={{ display: 'none' }}
          />
        </div>

        <div className="format-info">
          <h3>Excel File Format</h3>
          <p>Your Excel file should have the following columns:</p>
          <ul>
            <li><strong>address</strong> - Delivery address</li>
            <li><strong>postalCode</strong> - Singapore postal code</li>
            <li><strong>customerName</strong> - Customer name</li>
            <li><strong>contactNumber</strong> - Phone number (optional)</li>
            <li><strong>notes</strong> - Special instructions (optional)</li>
          </ul>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {messageType === 'success' ? '✓' : '✕'} {message}
          </div>
        )}

        {loading && <div className="loading">Importing...</div>}
      </div>
    </section>
  );
};
