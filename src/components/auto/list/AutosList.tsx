import React from "react";
import { useNavigate } from "react-router-dom";
import useAutos from "../../../hooks/useAutos";
import DataTable, { ActionDefinition, ColumnDefinition } from "../../dataTable/dataTable";
import { Auto } from "../../../tipos/Auto";

const AutosList: React.FC = () => {
  const { autos, error, loading, deleteAuto, isDeleting, deleteError, clearDeleteError } = useAutos(); 
  const navigate = useNavigate();

  const handleAddNew = () => {
    navigate('/autos/nuevo');
  }

  const autoColumns: ColumnDefinition<Auto>[] = [
    { header: 'Marca', field: 'marca'},
    { header: 'Modelo', field: 'modelo'},
    { header: 'Año', field: 'año'},
    { header: 'Patente', field: 'patente'}
  ]

  const autoActions: ActionDefinition<Auto>[] = [
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
      onClick: (_auto) => { /* La lógica del modal la maneja DataTable */ },
      isDeleteAction: true,
    },
  ];

  return (
  <DataTable<Auto>
        title="Autos"
        data={autos}
        columns={autoColumns}
        actions={autoActions}
        onAdd={handleAddNew}
        addBtnText="Agregar nuevo"
        addBtnClassName="add-button primary"
        loading={loading}
        error={error}
        onDeleteConfirm={deleteAuto}
        isDeleting={isDeleting}
        deleteError={deleteError}
        onClearDeleteError={clearDeleteError} />
  );
};

export default AutosList;