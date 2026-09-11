import React from 'react';
import { SingleRouteSection } from './components/SingleRouteSection';

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>DRoute</h1>
          <p>Singapore Delivery Route Optimization</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <SingleRouteSection />
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 DRoute</p>
        </div>
      </footer>
    </div>
  );
}
