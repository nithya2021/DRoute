import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Driver, Route } from '@droute/shared';

export const DriversSection: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driverRoutes, setDriverRoutes] = useState<Record<string, Route[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDriversAndRoutes();
  }, []);

  const loadDriversAndRoutes = async () => {
    setLoading(true);
    try {
      const driversResponse = await api.get('/drivers');
      setDrivers(driversResponse.data);

      const routesMap: Record<string, Route[]> = {};
      for (const driver of driversResponse.data) {
        try {
          const routesResponse = await api.get(`/drivers/${driver.id}/routes`);
          routesMap[driver.id] = routesResponse.data;
        } catch (error) {
          routesMap[driver.id] = [];
        }
      }
      setDriverRoutes(routesMap);
    } catch (error) {
      console.error('Failed to load drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <section className="section"><div className="loading">Loading drivers...</div></section>;
  }

  return (
    <section className="section">
      <h2>Drivers ({drivers.length})</h2>

      <div className="card">
        <div className="drivers-grid">
          {drivers.map((driver) => {
            const routes = driverRoutes[driver.id] || [];
            const totalStops = routes.reduce((sum, r) => sum + r.stops.length, 0);
            const completedRoutes = routes.filter((r) => r.status === 'completed').length;

            return (
              <div key={driver.id} className="driver-card">
                <div className="driver-header">
                  <h3>{driver.name}</h3>
                  <span className={`status status-${driver.status}`}>{driver.status}</span>
                </div>

                <div className="driver-details">
                  <p>
                    <strong>Vehicle:</strong> {driver.vehicleNumber}
                  </p>
                  <p>
                    <strong>Phone:</strong> {driver.phoneNumber}
                  </p>
                  <p>
                    <strong>Routes:</strong> {routes.length}
                  </p>
                  <p>
                    <strong>Total Stops:</strong> {totalStops}
                  </p>
                  <p>
                    <strong>Completed:</strong> {completedRoutes}/{routes.length}
                  </p>
                </div>

                {routes.length > 0 && (
                  <div className="driver-routes">
                    <h4>Assigned Routes:</h4>
                    {routes.map((route) => (
                      <div key={route.id} className="route-tag">
                        <span>{route.stops.length} stops</span>
                        <span className={`status-badge status-${route.status}`}>{route.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
