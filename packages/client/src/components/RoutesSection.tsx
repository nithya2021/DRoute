import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Route, Driver, buildMapsLegs } from '@droute/shared';

export const RoutesSection: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const [routesResponse, driversResponse] = await Promise.all([
        api.get('/optimization/routes'),
        api.get('/drivers'),
      ]);
      setRoutes(routesResponse.data);
      setDrivers(driversResponse.data);
    } catch (error) {
      console.error('Failed to load routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const driverLabel = (driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    return driver ? `${driver.name} (${driver.vehicleNumber})` : driverId;
  };

  const updateRouteStatus = async (routeId: string, status: 'pending' | 'in-progress' | 'completed') => {
    try {
      await api.patch(`/routes/${routeId}`, { status });
      loadRoutes();
    } catch (error) {
      console.error('Failed to update route:', error);
    }
  };

  if (loading) {
    return <section className="section"><div className="loading">Loading routes...</div></section>;
  }

  if (routes.length === 0) {
    return (
      <section className="section">
        <h2>Routes</h2>
        <div className="card">
          <p>No routes available. Please optimize deliveries first.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="section-header">
        <h2>Delivery Routes ({routes.length})</h2>
        <a
          className="btn btn-small"
          href={`${api.defaults.baseURL}/optimization/export`}
          download
        >
          Export to Excel
        </a>
      </div>

      <div className="card">
        {routes.map((route) => (
          <div key={route.id} className="route-card">
            <div
              className="route-header-clickable"
              onClick={() => setExpandedRoute(expandedRoute === route.id ? null : route.id)}
            >
              <div className="route-title">
                <span className="driver-id">{driverLabel(route.driverId)}</span>
                <span className="stops-count">{route.stops.length} stops</span>
              </div>
              <div className="route-info">
                <span>{route.totalDistance.toFixed(1)} km</span>
                <span className={`status status-${route.status}`}>{route.status}</span>
              </div>
              <span className="expand-icon">{expandedRoute === route.id ? '▼' : '▶'}</span>
            </div>

            {expandedRoute === route.id && (
              <div className="route-details-expanded">
                <div className="stops-list">
                  <h4>Delivery Stops:</h4>
                  {route.stops.map((stop, index) => (
                    <div key={stop.id} className="stop-item">
                      <span className="stop-number">{index + 1}</span>
                      <div className="stop-info">
                        <p className="stop-address">{stop.address}</p>
                        <p className="stop-customer">{stop.customerName}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="route-actions">
                  {route.status !== 'completed' && (
                    <>
                      <button
                        className="btn btn-small"
                        onClick={() => updateRouteStatus(route.id, 'in-progress')}
                      >
                        Start Route
                      </button>
                      <button
                        className="btn btn-small btn-success"
                        onClick={() => updateRouteStatus(route.id, 'completed')}
                      >
                        Complete Route
                      </button>
                    </>
                  )}
                  {buildMapsLegs(route.stops).map((leg) => (
                    <a
                      key={leg.firstStop}
                      href={leg.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-small btn-map"
                    >
                      {leg.firstStop === 1 && leg.lastStop === route.stops.length
                        ? 'View on Maps'
                        : `Maps: stops ${leg.firstStop}–${leg.lastStop}`}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
