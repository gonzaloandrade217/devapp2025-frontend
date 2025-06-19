import React, { useState } from 'react';
import '../css/List.css';

export interface ColumnDefinition<T> {
  header: string;
  field: keyof T;
  render?: (item: T) => React.ReactNode;
}

export interface ActionDefinition<T> {
  label: string;
  className: string;
  onClick: (item: T) => void;
  isDeleteAction?: boolean;
}

export interface DataTableProps<T extends { id: string }> {
  title: string;
  data: T[];
  columns: ColumnDefinition<T>[];
  actions: ActionDefinition<T>[];

  onAdd?: () => void;
  addBtnText?: string;
  addBtnClassName?: string;

  loading?: boolean;
  error?: string | null;

  onDeleteConfirm: (id: string) => Promise<boolean>;
  isDeleting?: boolean;
  deleteError?: string | null;
  onClearDeleteError?: () => void;

  showAddButton?: boolean;
}

const DataTable = <T extends { id: string }>(props: DataTableProps<T>) => {
  const {
    title,
    data,
    columns,
    actions,
    onAdd,
    addBtnText = 'Agregar nuevo',
    addBtnClassName = 'add-button primary',
    loading = false,
    error = null,
    onDeleteConfirm,
    isDeleting = false,
    deleteError = null,
    onClearDeleteError,
    showAddButton = true, 
  } = props;

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    onClearDeleteError && onClearDeleteError();
    setDeletingId(id);
  };

  const handleConfirm = async () => {
    if (!deletingId) return;

    const success = await onDeleteConfirm(deletingId);
    if (success) {
      setDeletingId(null);
    }
  };

  const handleCancel = () => {
    if (!isDeleting) {
      setDeletingId(null);
      onClearDeleteError && onClearDeleteError();
    }
  };

  const renderConfirmationModal = () => (
    <div className="confirmation-overlay">
      <div className="confirmation-box">
        <h3>Confirmar eliminación</h3>
        <p>¿Estás seguro de querer eliminar este elemento?</p>

        {deleteError && (
          <div className="error-message">{deleteError}</div>
        )}

        <div className="confirmation-buttons">
          <button
            className="confirm-button danger"
            onClick={handleConfirm}
            disabled={isDeleting}
            aria-busy={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Confirmar'}
          </button>
          <button
            className="cancel-button secondary"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="loading-indicator">Cargando {title.toLowerCase()}...</div>;
  if (error) return <div className="error-message">Error al cargar {title.toLowerCase()}: {error}</div>;

  return (
    <div className="data-table-container">
      <header className="list-header">
        <h1>{title}</h1>
        {onAdd && showAddButton && (
          <button
            className={addBtnClassName}
            onClick={onAdd}
            disabled={loading || isDeleting}
            aria-busy={loading}
          >
            {loading ? 'Cargando...' : addBtnText}
          </button>
        )}
      </header>
      {(data.length === 0 && !loading && !error) ? (
        <div className="no-data">No hay {title.toLowerCase()} registrados.</div>
      ) : (
        <section className="list-content">
          <table>
            <thead>
              <tr>
                {columns.map((col, index) => (
                  <th key={index}>{col.header}</th>
                ))}
                {actions.length > 0 && <th className="actions-header">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {col.field === 'anio' && console.log(`Valor de 'anio' para el auto ${item.id}:`, (item as any)[col.field])}

                      {col.render ? col.render(item) : (item as any)[col.field]}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="action-buttons">
                      {actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          className={action.className}
                          onClick={() => action.isDeleteAction ? handleDeleteClick(item.id) : action.onClick(item)}
                        >
                          {action.label}
                        </button>
                      ))}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {deletingId !== null && renderConfirmationModal()}
    </div>
  );
};

export default DataTable;