import api from '../api/api';
import { Persona } from '../tipos/Persona';

const useCreatePersona = () => {
  const createPersona = async (personaData: Omit<Persona, 'id' | 'autos'>): Promise<boolean> => {
    try {
      const response = await api.post('/personas', personaData);
      return response.status === 201; 
    } catch (error) {
      console.error('Error creating persona:', error); 
      return false;
    }
  };
  return { createPersona };
};

export default useCreatePersona;