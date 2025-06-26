import React, { useCallback } from 'react';
import AutoForm from '../form/AutoForm';
import useCreateAuto from '../../../hooks/useCreateAutos';
import { useNavigate, useParams } from 'react-router-dom';
import { Auto } from '../../../tipos/Auto';

const AutoCreate: React.FC = () => {
  const { personaId } = useParams(); 
  const { createAuto } = useCreateAuto();
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (autoData: Omit<Auto, 'id'>) => {
    try {
      const dataToSend = {
        ...autoData,
        personaID: personaId || autoData.personaID, 
      };

      const success = await createAuto(dataToSend); 
      if (success) {
        if (personaId) {
          navigate(`/personas/${personaId}`);
        } else {
          navigate('/autos');
        }
      }
      return success;
    } catch (error) {
      console.error('Error en AutoCreate:', error);
      return false;
    }
  }, [createAuto, navigate, personaId]);

  if (!personaId) {
    return (
      <div className="form-container">
        <h1>Error</h1>
        <p className="error-message">ID de persona no encontrado en la URL. No se puede agregar un auto sin asociarlo a una persona.</p>
        <button className="cancel-button" onClick={() => navigate('/personas')}>
          Volver a la lista de personas
        </button>
      </div>
    );
  }

  return (
    <AutoForm
      onSubmit={handleSubmit}
      isEdit={false}
      initialData={{ personaID: personaId }}
    />
  );
};

export default AutoCreate;
