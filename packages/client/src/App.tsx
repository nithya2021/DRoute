import React, { useState } from 'react';
import { ImportSection } from './components/ImportSection';
import { OptimizationSection } from './components/OptimizationSection';
import { RoutesSection } from './components/RoutesSection';
import { DriversSection } from './components/DriversSection';

type Tab = 'import' | 'optimize' | 'routes' | 'drivers';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('import');

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>DRoute</h1>
          <p>Singapore Delivery Route Optimization</p>
        </div>
      </header>

      <nav className="nav">
        <div className="container">
          <button
            className={`nav-item ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            Import Deliveries
          </button>
          <button
            className={`nav-item ${activeTab === 'optimize' ? 'active' : ''}`}
            onClick={() => setActiveTab('optimize')}
          >
            Optimize Routes
          </button>
          <button
            className={`nav-item ${activeTab === 'routes' ? 'active' : ''}`}
            onClick={() => setActiveTab('routes')}
          >
            View Routes
          </button>
          <button
            className={`nav-item ${activeTab === 'drivers' ? 'active' : ''}`}
            onClick={() => setActiveTab('drivers')}
          >
            Drivers
          </button>
        </div>
      </nav>

      <main className="main">
        <div className="container">
          {activeTab === 'import' && <ImportSection />}
          {activeTab === 'optimize' && <OptimizationSection />}
          {activeTab === 'routes' && <RoutesSection />}
          {activeTab === 'drivers' && <DriversSection />}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 DRoute. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
