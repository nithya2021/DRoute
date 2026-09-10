import React, { useState } from 'react';
import { api } from '../services/api';
import { OptimizationResult } from '@droute/shared';

export const OptimizationSection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState('');

  const handleOptimize = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/optimization/optimize');
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to optimize routes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <h2>Route Optimization</h2>

      <div className="card">
        <button
          className="btn btn-primary"
          onClick={handleOptimize}
          disabled={loading}
        >
          {loading ? 'Optimizing...' : 'Optimize Routes'}
        </button>

        {error && <div className="message error">✕ {error}</div>}

        {result && (
          <div className="optimization-result">
            <h3>Optimization Complete</h3>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{result.totalStops}</div>
                <div className="stat-label">Total Stops</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{result.routes.length}</div>
                <div className="stat-label">Routes Created</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{result.averageStopsPerRoute}</div>
                <div className="stat-label">Avg Stops/Route</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{result.totalDistance.toFixed(1)}</div>
                <div className="stat-label">Total Distance (km)</div>
              </div>
            </div>

            <h3>Routes by Driver</h3>
            <div className="routes-list">
              {result.routes.map((route, index) => (
                <div key={route.id} className="route-item">
                  <div className="route-header">
                    <span className="route-number">Route {index + 1}</span>
                    <span className="route-driver">Driver ID: {route.driverId}</span>
                  </div>
                  <div className="route-details">
                    <span>Stops: {route.stops.length}</span>
                    <span>Distance: {route.totalDistance.toFixed(1)} km</span>
                    <span>Est. Time: {route.estimatedDuration} min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
