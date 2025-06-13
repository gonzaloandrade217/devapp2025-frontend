import { useEffect, useState, useCallback } from 'react';
import api from '../api/api';
import { Persona } from '../tipos/Persona'; 

interface UsePersonasReturn {
  personas: Persona[];
  error: string | null; 
  loading: boolean;
  isDeleting: boolean;
  deleteError: string | null; 
  obtenerPersonas: () => Promise<void>;
  updatePersona: (id: string, personaData: Partial<Persona>) => Promise<boolean>; 
  deletePersona: (id: string) => Promise<boolean>; 
  clearDeleteError: () => void; 
}

const usePersonas = (): UsePersonasReturn => {
  const [state, setState] = useState<{
    personas: Persona[];
    error: string | null;
    loading: boolean;
    isDeleting: boolean;
    deleteError: string | null; 
  }>({
    personas: [],
    error: null,
    loading: true,
    isDeleting: false,
    deleteError: null 
  });

  const obtenerPersonas = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await api.get<Persona[]>('/personas');
      const personasConFechas = response.data.map(p => ({
      ...p,
      fechaNacimiento: p.fechaNacimiento ? new Date(p.fechaNacimiento) : new Date(0) 
    }));

    console.log("usePersonas: Personas procesadas con fechas:", personasConFechas); 

    setState(prev => ({ ...prev, personas: personasConFechas })); 
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 'Error al cargar las personas';
    setState(prev => ({ ...prev, error: errorMsg }));
    console.error('Error fetching personas:', err);
  } finally {
    setState(prev => ({ ...prev, loading: false }));
  }
}, []);

  useEffect(() => {
    obtenerPersonas();
  }, [obtenerPersonas]);

  const updatePersona = async (id: string, personaData: Partial<Persona>): Promise<boolean> => { 
    try {
      setState(prev => ({ ...prev, error: null })); 
      const response = await api.put<Persona>(`/personas/${id}`, personaData);
      setState(prev => ({
        ...prev,
        personas: prev.personas.map(p => p.id === id ? response.data : p)
      }));
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al actualizar la persona';
      setState(prev => ({ ...prev, error: errorMsg })); 
      console.error('Error updating persona:', err);
      return false;
    }
  };

  const deletePersona = async (id: string): Promise<boolean> => { 
    try {
      setState(prev => ({ ...prev, isDeleting: true, deleteError: null })); 
      await api.delete(`/personas/${id}`);
      setState(prev => ({
        ...prev,
        personas: prev.personas.filter(p => p.id !== id),
        isDeleting: false
      }));
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al eliminar la persona';
      setState(prev => ({ ...prev, deleteError: errorMsg, isDeleting: false })); 
      console.error('Error al eliminar persona:', err);
      return false;
    }
  };

  const clearDeleteError = useCallback(() => { 
    setState(prev => ({ ...prev, deleteError: null }));
  }, []);

  return { 
    personas: state.personas, 
    error: state.error, 
    loading: state.loading, 
    isDeleting: state.isDeleting,
    deleteError: state.deleteError, 
    obtenerPersonas,
    updatePersona,
    deletePersona,
    clearDeleteError 
  };
};

export default usePersonas;