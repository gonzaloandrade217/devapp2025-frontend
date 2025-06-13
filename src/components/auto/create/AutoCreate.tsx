import React from 'react';
import AutoForm from '../form/AutoForm';
import useCreateAuto from '../../../hooks/useCreateAutos';
import { useNavigate } from 'react-router-dom';
import { Auto } from '../../../tipos/Auto';

const AutoCreate: React.FC = () => {
  const { createAuto } = useCreateAuto();
  const navigate = useNavigate();

  const handleSubmit = async (autoData: Omit<Auto, 'id'>) => {
    try {
      const success = await createAuto(autoData);
      if (success) {
        navigate('/autos');
      }
      return success;
    } catch (error) {
      console.error('Error en AutoCreate;', error);
      return false;
    }
  }

  return (
    <AutoForm
      onSubmit={handleSubmit}
      isEdit={false}
    />
  );
};

export default AutoCreate;