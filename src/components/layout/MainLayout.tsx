import React from 'react';
import { Link, Outlet } from 'react-router-dom'; 
import '../css/MainLayout.css';

const MainLayout: React.FC = () => {

  return (
    <div className="main-layout">
      <header className="main-header">
        <h1 className="app-title">Personas-Autos</h1>
        <nav className="main-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/personas" className="nav-link">Personas</Link>
          <Link to="/autos" className="nav-link">Autos</Link>
        </nav>
      </header>

      <main className="main-content">
        <Outlet /> 
      </main>
    </div>
  );
};

export default MainLayout;