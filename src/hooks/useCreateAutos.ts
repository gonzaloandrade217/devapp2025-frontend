import api from '../api/api';
import { Auto } from '../tipos/Auto';

const useCreateAuto = () => {
  const createAuto = async (autoData: Omit<Auto, 'id'>): Promise<boolean> => {
    try {
      const response = await api.post('/autos', autoData);
      return response.status === 201;
    } catch (error) {
      console.error('Error creating auto:', error);
      return false;
    }
  };

  return { createAuto };
};

export default useCreateAuto;