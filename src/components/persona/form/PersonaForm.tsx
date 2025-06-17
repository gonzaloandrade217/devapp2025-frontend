import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Genero, Persona } from '../../../tipos/Persona';
import '../../css/Form.css';

type PersonaFormData = Omit<Persona, 'id' | 'autos'>;
type FormField = keyof PersonaFormData;

interface PersonaFormProps {
  onSubmit: (data: PersonaFormData) => Promise<boolean>;
  initialData?: Partial<PersonaFormData>;
  isEdit?: boolean;
  readOnly?: boolean;
}

const GENEROS_DISPONIBLES: Genero[] = ['Masculino', 'Femenino', 'No-Binario'];

const PersonaForm: React.FC<PersonaFormProps> = ({
  onSubmit,
  initialData = {},
  isEdit = false,
  readOnly = false
}) => {
   console.log("PersonaForm: initialData recibido:", initialData); // <-- ¡Añade este log!
  console.log("PersonaForm: initialData.fechaNacimiento original:", initialData.fechaNacimiento);
  const getInitialFormData = useCallback((data: Partial<PersonaFormData>): PersonaFormData => {
    const fechaNacimiento = data.fechaNacimiento
      ? new Date(data.fechaNacimiento)
      : new Date();

    return {
      dni: data.dni || '',
      nombre: data.nombre || '',
      apellido: data.apellido || '',
      fechaNacimiento,
      genero: data.genero || 'Masculino',
      donanteOrganos: data.donanteOrganos || false,
    };
  }, []);

  const [formData, setFormData] = useState<PersonaFormData>(() => getInitialFormData(initialData));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormField, string>>>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (Object.keys(initialData).length > 0 && (initialData.dni !== undefined || initialData.nombre !== undefined)) {
      setFormData(getInitialFormData(initialData));
    }
  }, [initialData, getInitialFormData, readOnly]); 

  const formatDateForInput = useCallback((date: Date): string => {
    if (!date || isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: Partial<Record<FormField, string>> = {};
    const hoy = new Date();
    const edadMinima = new Date(hoy);
    edadMinima.setFullYear(hoy.getFullYear() - 18);

    console.log("Validando formulario con formData:", formData); 

    if (!formData.dni.trim()) {
        errors.dni = 'El DNI es requerido';
    } else if (!/^\d{7,8}$/.test(formData.dni)) {
        errors.dni = 'DNI debe tener 7 u 8 dígitos';
    }

    if (!formData.nombre.trim()) errors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) errors.apellido = 'El apellido es requerido';

    if (isNaN(formData.fechaNacimiento.getTime())) {
        errors.fechaNacimiento = 'Fecha inválida';
    } else if (formData.fechaNacimiento > hoy) {
        errors.fechaNacimiento = 'No puede ser fecha futura';
    } else if (formData.fechaNacimiento > edadMinima) {
        errors.fechaNacimiento = 'Debe ser mayor de 18 años';
    }

    console.log("Errores de validación detectados:", errors);

    setFieldErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    console.log("Resultado de validateForm (isValid):", isValid); 
    return isValid;
}, [formData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const field = name as FormField;

    console.log(`[handleChange] Campo: ${name}, Valor recibido: ${value}, Tipo de input: ${type}`);

    setFormData(prev => {
      let newValue: any = value;

      if (type === 'checkbox') {
        newValue = (e.target as HTMLInputElement).checked;
        console.log(`[handleChange] Checkbox: ${field}, Nuevo valor: ${newValue}`);
      } else if (field === 'fechaNacimiento') {
        newValue = new Date(value);
        console.log(`[handleChange] Fecha: ${field}, Valor original: ${value}, Nuevo valor (Date): ${newValue}`);
      } else if (field === 'genero') {
        newValue = value as Genero;
        console.log(`[handleChange] Genero: ${field}, Nuevo valor: ${newValue}`);
      }

      const updatedFormData = { ...prev, [field]: newValue };
    console.log("[handleChange] formData actualizado (antes de setFormData):", updatedFormData); // <-- Nuevo log
    return updatedFormData;
  });

      //return { ...prev, [field]: newValue };
    //});

    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [fieldErrors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("PersonaForm - handleSubmit iniciado."); 
    console.log("PersonaForm - Valor de isSubmitting al inicio:", isSubmitting);

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const success = await onSubmit(formData);
      if (!success) {
        setError('No se pudo guardar. Verifica los datos o intenta más tarde.');
        return;
      }
      navigate('/personas');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error: ${message}`);
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
      console.log("PersonaForm - handleSubmit finalizado. isSubmitting puesto en FALSE.");
    }
  }, [formData, navigate, onSubmit, validateForm]);

  const renderTextField = (field: FormField, label: string) => (
    <div className="form-group">
      <label>{label}:</label>
      {readOnly ? (
        <div className="read-only-value">
          {field === 'fechaNacimiento'
            ? formData[field].toLocaleDateString()
            : String(formData[field])
          }
        </div>
      ) : (
        <>
          <input
            type={field === 'fechaNacimiento' ? 'date' : 'text'}
            name={field}
            value={field === 'fechaNacimiento'
              ? formatDateForInput(formData[field])
              : String(formData[field])
            }
            onChange={handleChange}
            className={fieldErrors[field] ? 'error-input' : ''}
            disabled={isSubmitting}
          />
          {fieldErrors[field] && <span className="field-error">{fieldErrors[field]}</span>}
        </>
      )}
    </div>
  );

  const renderSelectField = () => (
    <div className="form-group">
      <label>Género:</label>
      {readOnly ? (
        <div className="read-only-value">{formData.genero}</div>
      ) : (
        <select
          name="genero"
          value={formData.genero}
          onChange={handleChange}
          disabled={isSubmitting || readOnly}
          className={fieldErrors.genero ? 'error-input' : ''}
        >
          {GENEROS_DISPONIBLES.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      )}
    </div>
  );

  const renderCheckboxField = () => (
    <div className="form-group checkbox-group">
      <label>
        {readOnly ? (
          <>
            <span className="label-text">Donante de órganos</span>
            <span className="read-only-value">
              {formData.donanteOrganos ? 'Sí' : 'No'}
            </span>
          </>
        ) : (
          <>
            <input
              type="checkbox"
              name="donanteOrganos"
              checked={formData.donanteOrganos}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            Donante de órganos
          </>
        )}
      </label>
    </div>
  );

  console.log("PersonaForm - Estado actual de isSubmitting:", isSubmitting);

  return (
    <div className="form-container">
      <h1>{readOnly ? 'Ver Persona' : isEdit ? 'Editar Persona' : 'Nueva Persona'}</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={readOnly ? (e) => e.preventDefault() : handleSubmit}>
        {renderTextField('dni', 'DNI')}
        {renderTextField('nombre', 'Nombre')}
        {renderTextField('apellido', 'Apellido')}
        {renderTextField('fechaNacimiento', 'Fecha de Nacimiento')}
        {renderSelectField()}
        {renderCheckboxField()}

        {!readOnly && (
          <div className="form-actions">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/personas')}
              className="cancel-button"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PersonaForm;