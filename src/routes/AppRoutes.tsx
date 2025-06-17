import React from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout'; 
import Home from '../components/home/Home';
import AutosList from '../components/auto/list/AutosList';
import PersonaCreate from '../components/persona/create/PersonaCreate';
import PersonasList from '../components/persona/list/PersonasList';
import PersonaView from '../components/persona/view/PersonaView';
import PersonaEdit from '../components/persona/edit/PersonaEdit';
import AutoCreate from '../components/auto/create/AutoCreate';
import AutoEdit from '../components/auto/edit/AutoEdit';
import AutoView from '../components/auto/view/AutoView';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>

        <Route index element={<Home />} /> 

        <Route path="personas" element={<PersonasList />} />
        <Route path="personas/nueva" element={<PersonaCreate />} />
        <Route path="personas/:id" element={<PersonaView />} />
        <Route path="personas/:id/editar" element={<PersonaEdit />} />

        <Route path="autos" element={<AutosList />} />
        <Route path="autos/nuevo" element={<AutoCreate />} />
        <Route path="autos/:id" element={<AutoView />} />
        <Route path="autos/:id/editar" element={<AutoEdit />} />

      </Route>
    </Routes>
  );
};

export default AppRoutes;