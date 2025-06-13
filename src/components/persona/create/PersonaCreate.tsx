import React from 'react';
import PersonaForm from '../form/PersonaForm';
import useCreatePersona from '../../../hooks/useCreatePersona';
import { useNavigate } from 'react-router-dom';
import { Persona } from '../../../tipos/Persona';

const PersonaCreate: React.FC = () => {
  const { createPersona } = useCreatePersona();
  const navigate = useNavigate();

  const handleSubmit = async (personaData: Omit<Persona, 'id' | 'autos'>) => {
    try {
      const success = await createPersona(personaData);
      if (success) {
        navigate('/personas');
      }
      return success;
    } catch (error) {
      console.error('Error en PersonaCreate:', error);
      return false;
    }
  };

  return (
    <PersonaForm
      onSubmit={handleSubmit}
      isEdit={false}
    />
  );
};

export default PersonaCreate;