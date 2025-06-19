import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PersonaForm from "../../persona/form/PersonaForm";
import { Persona } from "../../../tipos/Persona";
import { obtenerPersonaPorId, eliminarPersona } from '../../../api/personas';
import DataTable, { ActionDefinition, ColumnDefinition } from '../../dataTable/dataTable';
import { Auto } from '../../../tipos/Auto';
import { eliminarAuto } from '../../../api/autos';

interface PersonaViewProps {
  initialData?: Persona;
}

const PersonaView: React.FC<PersonaViewProps> = ({ initialData }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [persona, setPersona] = useState<Persona | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingPersona, setIsDeletingPersona] = useState(false);
  const [deletePersonaError, setDeletePersonaError] = useState<string | null>(null);

  const [isDeletingAuto, setIsDeletingAuto] = useState(false);
  const [deleteAutoError, setDeleteAutoError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setPersona(initialData);
      setCargando(false);
      return;
    }

    const cargarPersona = async () => {
      if (!id) {
        setError("ID de persona no proporcionado.");
        setCargando(false);
        return;
      }
      try {
        const datos = await obtenerPersonaPorId(id);
        console.log("Datos de la persona recibidos de la API en PersonaView:", datos);
        setPersona(datos);
      } catch (err) {
        setError('Error al cargar los datos de la persona.');
        console.error(err);
      } finally {
        setCargando(false);
      }
    };

    cargarPersona();
  }, [id, initialData]);

  const autoColumns: ColumnDefinition<Auto>[] = [
    { header: 'Patente', field: 'patente' },
    { header: 'Marca', field: 'marca' },
    { header: 'Modelo', field: 'modelo' },
    { header: 'Año', field: 'anio' },
  ];

  const autoViewActions: ActionDefinition<Auto>[] = [
    {
      label: 'Ver',
      className: 'btn-blue',
      onClick: (auto) => navigate(`/autos/${auto.id}`),
    },
  ];

  const handleDeleteAutoConfirm = async (autoId: string): Promise<boolean> => {
    setIsDeletingAuto(true);
    setDeleteAutoError(null);
    try {
        const success = await eliminarAuto(autoId);
        if (success) {
            if (persona) {
                setPersona(prevPersona => {
                    if (!prevPersona) return null;
                    return {
                        ...prevPersona,
                        autos: prevPersona.autos?.filter(auto => auto.id !== autoId) || []
                    };
                });
            }
            return true;
        } else {
            setDeleteAutoError('No se pudo borrar el auto. Intenta de nuevo.');
            return false;
        }
    } catch (err) {
        console.error('Error al borrar auto:', err);
        setDeleteAutoError(`Ocurrió un error al borrar el auto: ${(err as Error).message || 'Desconocido'}`);
        return false;
    } finally {
        setIsDeletingAuto(false);
    }
  };

  const handleAddAuto = () => {
    if (persona && persona.id) {
      navigate(`/autos/nuevo?personaId=${persona.id}`);
    } else {
      console.warn("No se puede agregar un auto, ID de persona no disponible.");
    }
  };

  const handleEditPersona = () => {
    if (persona && persona.id) {
      navigate(`/personas/${persona.id}/editar`);
    } else {
      console.warn("No se puede editar la persona, ID no disponible.");
    }
  };

  const handleDeletePersona = async () => {
    if (!persona || !persona.id) {
      console.warn("No se puede borrar la persona, ID no disponible.");
      return;
    }

    if (window.confirm(`¿Estás seguro de que quieres borrar a ${persona.nombre} ${persona.apellido}? Esta acción eliminará también todos sus autos.`)) {
      setIsDeletingPersona(true);
      setDeletePersonaError(null);
      try {
        const success = await eliminarPersona(persona.id);
        if (success) {
          navigate('/personas');
        } else {
          setDeletePersonaError('No se pudo borrar la persona. Verifica la conexión o intenta más tarde.');
        }
      } catch (err) {
        console.error('Error al borrar persona:', err);
        setDeletePersonaError(`Ocurrió un error al borrar la persona: ${(err as Error).message || 'Desconocido'}`);
      } finally {
        setIsDeletingPersona(false);
      }
    }
  };

  if (cargando) {
    return <div className="loading-message">Cargando persona...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const displayPersona = initialData || persona;
  if (!displayPersona) {
    return <div className="info-message">No se encontraron datos para esta persona.</div>;
  }

  return (
    <div className="form-container">
      <PersonaForm
        initialData={displayPersona}
        readOnly={true}
        onSubmit={() => Promise.resolve(false)}
        isEdit={false}
      />

      <div className="autos-section" style={{ marginTop: '30px' }}>
        <DataTable<Auto>
          title="Autos Asociados"
          data={displayPersona.autos || []}
          columns={autoColumns}
          actions={autoViewActions}
          onDeleteConfirm={handleDeleteAutoConfirm}
          isDeleting={isDeletingAuto}
          deleteError={deleteAutoError}
          onClearDeleteError={() => setDeleteAutoError(null)}
          addBtnText=""
          onAdd={() => {}}
          showAddButton={false}
        />
      </div>
    </div>
  );
};

export default PersonaView;