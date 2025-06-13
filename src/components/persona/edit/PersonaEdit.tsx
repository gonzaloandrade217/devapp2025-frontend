import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePersonas from '../../../hooks/usePersonas';
import PersonaForm from '../form/PersonaForm';

const PersonaEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { personas, updatePersona } = usePersonas();

  if (!id) {
    return <div>Error: ID de persona no proporcionado en la URL.</div>;
  }

  const personaToEdit = personas.find(p => p.id === id);

  if (!personaToEdit) {
    return <div>Persona no encontrada</div>;
  }

  return (
    <PersonaForm
      initialData={personaToEdit}
      onSubmit={async (personaData) => {
        const success = await updatePersona(id, personaData);
        if (success) {
          navigate(`/personas/${id}`);
        }
        return success;
      }}
      isEdit={true}
    />
  );
};

export default PersonaEdit;