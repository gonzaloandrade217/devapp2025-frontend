import React from 'react';
import { useNavigate } from 'react-router-dom';
import usePersonas from '../../../hooks/usePersonas';
import DataTable, { ColumnDefinition, ActionDefinition } from '../../dataTable/dataTable'; 
import { Persona } from '../../../tipos/Persona';

const PersonasList: React.FC = () => {
  const { personas, loading, error, deletePersona, isDeleting, deleteError, clearDeleteError } = usePersonas();
  const navigate = useNavigate();

  const handleAddNew = () => {
    navigate('/personas/nueva');
  };

  const personaColumns: ColumnDefinition<Persona>[] = [
    { header: 'DNI', field: 'dni' },
    { header: 'Nombre', field: 'nombre' },
    { header: 'Apellido', field: 'apellido' },
    { header: 'Género', field: 'genero' },
    { 
      header: 'Donante',
      field: 'donanteOrganos',
      render: (persona) => {
        console.log(`ID Persona: ${persona.id}`);
        console.log(`DonanteOrganos en render:`, persona.donanteOrganos, `(Tipo: ${typeof persona.donanteOrganos})`);
        return (
        <span className={`donante-badge ${persona.donanteOrganos ? 'donante' : 'no-donante'}`}>
          {persona.donanteOrganos ? 'Sí' : 'No'}
        </span>
      );
      },
    },
  ];

  const personaActions: ActionDefinition<Persona>[] = [
    {
      label: 'Ver',
      className: 'btn-blue',
      onClick: (persona) => navigate(`/personas/${persona.id}`), 
    },
    {
      label: 'Editar',
      className: 'btn-yellow',
      onClick: (persona) => navigate(`/personas/${persona.id}/editar`),
    },
    {
      label: 'Borrar',
      className: 'btn-red',
      onClick: (_persona) => { /* La lógica del modal la maneja DataTable */ },
      isDeleteAction: true,
    },
  ];

  return (
  <DataTable<Persona>
        title="Personas"
        data={personas}
        columns={personaColumns}
        actions={personaActions}
        onAdd={handleAddNew}
        addBtnText="Agregar nueva"
        addBtnClassName="add-button primary"
        loading={loading}
        error={error}
        onDeleteConfirm={deletePersona}
        isDeleting={isDeleting}
        deleteError={deleteError}
        onClearDeleteError={clearDeleteError} />
  );
};

export default PersonasList;