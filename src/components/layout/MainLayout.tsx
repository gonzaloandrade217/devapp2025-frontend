import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom'; 
import '../css/MainLayout.css';

const MainLayout: React.FC = () => {
  const navigate = useNavigate(); 

  return (
    <div className="main-layout">
      <header className="main-header">
        <h1 className="app-title">Personas-Autos</h1>
        <nav className="main-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/personas" className="nav-link">Personas</Link>
          <Link to="/autos" className="nav-link">Autos</Link>
          <button onClick={() => navigate(-1)} className="back-button">
            Volver
          </button>
        </nav>
      </header>

      <main className="main-content">
        <Outlet /> 
      </main>
    </div>
  );
};

export default MainLayout;