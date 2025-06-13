import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Home.css'; 

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>Bienvenido al Sistema</h1>
      <div className="buttons-container">
        <button 
          className="boton-persona"
          onClick={() => navigate('/personas')}
        >
          Personas
        </button>
        <button 
          className="boton-auto"
          onClick={() => navigate('/autos')}
        >
          Autos
        </button>
      </div>
    </div>
  );
};

export default Home;