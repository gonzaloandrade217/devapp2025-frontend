import { useEffect, useState, useCallback } from 'react';
import api from '../api/api';
import { Auto } from '../tipos/Auto';
import { transformarDatosAuto } from '../api/autos'; 

interface UseAutosReturn {
  autos: Auto[];
  error: string | null; 
  loading: boolean;
  isDeleting: boolean;
  deleteError: string | null; 
  obtenerAutos: () => Promise<void>;
  updateAuto: (id: string, autoData: Partial<Auto>) => Promise<boolean>; 
  deleteAuto: (id: string) => Promise<boolean>; 
  clearDeleteError: () => void; 
}

const useAutos = (): UseAutosReturn => {
  const [state, setState] = useState<{
    autos: Auto[];
    error: string | null;
    loading: boolean;
    isDeleting: boolean;
    deleteError: string | null;
  }>({
    autos: [],
    error: null,
    loading: true,
    isDeleting: false,
    deleteError: null
  })

const obtenerAutos = useCallback(async () => {
  setState(prev => ({ ...prev, loading: true, error: null}));
  try {
    const response = await api.get<any[]>('/autos'); 

    const autosTransformados = response.data.map(transformarDatosAuto);

    console.log("useAutos: Autos transformados (con 'id'):", autosTransformados); 
    setState(prev => ({ ...prev, autos: autosTransformados })); 
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 'Error al cargar los autos';
    setState(prev => ({ ...prev, error: errorMsg }));
    console.error('Error fetching autos:', err);
  } finally {
    setState(prev => ({ ...prev, loading: false }));
  }
}, []);
  
  useEffect(() => {
    obtenerAutos();
  }, [obtenerAutos]);

  const updateAuto = async (id: string, autoData: Partial<Auto>): Promise<boolean> => { 
    try {
      setState(prev => ({ ...prev, error: null })); 
      const response = await api.put<Auto>(`/autos/${id}`, autoData);
      setState(prev => ({
        ...prev,
        autos: prev.autos.map(a => a.id === id ? response.data : a)
      }));
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al actualizar auto';
      setState(prev => ({ ...prev, error: errorMsg })); 
      console.error('Error updating auto:', err);
      return false;
    }
  };

  const deleteAuto = async (id: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isDeleting: true, deleteError: null })); 
      await api.delete(`/autos/${id}`);
      setState(prev => ({
        ...prev,
        autos: prev.autos.filter(a => a.id !== id),
        isDeleting: false
      }));
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al eliminar auto';
      setState(prev => ({ ...prev, deleteError: errorMsg, isDeleting: false })); 
      console.error('Error al eliminar auto:', err);
      return false;
    }
  };

  const clearDeleteError = useCallback(() => { 
    setState(prev => ({ ...prev, deleteError: null }));
  }, []);
  
  return { 
    autos: state.autos, 
    error: state.error, 
    loading: state.loading, 
    isDeleting: state.isDeleting,
    deleteError: state.deleteError, 
    obtenerAutos,
    updateAuto,
    deleteAuto,
    clearDeleteError  
  };
};

export default useAutos;