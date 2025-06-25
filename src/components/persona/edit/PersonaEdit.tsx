import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PersonaForm from '../form/PersonaForm';
import { Persona, PersonaFormData } from '../../../tipos/Persona';
import { obtenerPersonaPorId, actualizarPersona } from '../../../api/personas';
import DataTable, { ActionDefinition, ColumnDefinition } from '../../dataTable/dataTable';
import { Auto } from '../../../tipos/Auto';
import { eliminarAuto } from '../../../api/autos';

const PersonaEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [persona, setPersona] = useState<Persona | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDeletingAuto, setIsDeletingAuto] = useState(false);
  const [deleteAutoError, setDeleteAutoError] = useState<string | null>(null);

  useEffect(() => {
    const cargarPersonaParaEditar = async () => {
      if (!id) {
        setError("Error: ID de persona no proporcionado en la URL.");
        setCargando(false);
        return;
      }
      try {
        const datosPersona = await obtenerPersonaPorId(id);
        setPersona(datosPersona);
        console.log('Datos de la persona cargados:', datosPersona);
        console.log('Fecha de Nacimiento:', datosPersona.fechaDeNacimiento, 'Tipo:', typeof datosPersona.fechaDeNacimiento);
      } catch (err) {
        console.error('Error al cargar la persona para editar:', err);
        setError('No se pudo cargar la persona para editar.');
      } finally {
        setCargando(false);
      }
    };

    cargarPersonaParaEditar();
  }, [id]);

  const handleSubmit = async (personaData: PersonaFormData): Promise<boolean> => {
    if (!id) {
      setError("Error: ID de persona no disponible para actualizar.");
      return false;
    }
    try {
      const success = await actualizarPersona(id, personaData);
      if (success) {
        navigate(`/personas/${id}`);
        return true;
      } else {
        setError('No se pudo actualizar la persona. Intenta de nuevo.');
        return false;
      }
    } catch (err) {
      console.error('Error al actualizar persona:', err);
      setError(`Ocurrió un error al actualizar la persona: ${(err as Error).message || 'Desconocido'}`);
      return false;
    }
  };

  const autoColumns: ColumnDefinition<Auto>[] = [
    { header: 'Patente', field: 'patente' },
    { header: 'Marca', field: 'marca' },
    { header: 'Modelo', field: 'modelo' },
    { header: 'Año', field: 'anio' },
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

  const autoEditActions: ActionDefinition<Auto>[] = [
    {
      label: 'Ver',
      className: 'btn-blue',
      onClick: (auto) => navigate(`/autos/${auto.id}`),
    },
    {
      label: 'Editar',
      className: 'btn-yellow',
      onClick: (auto) => navigate(`/autos/${auto.id}/editar`),
    },
    {
      label: 'Borrar',
      className: 'btn-red',
      isDeleteAction: true,
      onClick: (auto) => console.log(`Iniciando borrado de auto con ID: ${auto.id}`),
    },
  ];

  if (cargando) {
    return <div className="loading-message">Cargando datos de la persona para editar...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!persona) {
    return <div className="info-message">No se encontraron datos para la edición.</div>;
  }

  return (
    <div className="form-container">
      <h2>Editar Persona</h2>
      <PersonaForm
        initialData={persona}
        onSubmit={handleSubmit}
        isEdit={true}
        readOnly={false}
      />

      <div className="autos-section" style={{ marginTop: '30px' }}>
        <DataTable<Auto>
          title="Autos Asociados"
          data={persona.autos || []}
          columns={autoColumns}
          actions={autoEditActions}
          onDeleteConfirm={handleDeleteAutoConfirm}
          isDeleting={isDeletingAuto}
          deleteError={deleteAutoError}
          onClearDeleteError={() => setDeleteAutoError(null)}
          addBtnText=""
          onAdd={() => {}}
          showAddButton={false}
        />
        {deleteAutoError && <div className="error-message">{deleteAutoError}</div>}
      </div>
    </div>
  );
};

export default PersonaEdit;