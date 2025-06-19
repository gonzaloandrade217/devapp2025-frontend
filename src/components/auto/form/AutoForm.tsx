import React, { useCallback, useState, useEffect, useRef } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { Auto } from '../../../tipos/Auto';
import '../../css/Form.css';

type AutoFormData = Omit<Auto, 'id'>;
type FormField = keyof AutoFormData;

interface AutoFormProps {
  onSubmit: (data: AutoFormData) => Promise<boolean>;
  initialData?: Partial<AutoFormData>;
  isEdit?: boolean;
  readOnly?: boolean;
}

const AutoForm: React.FC<AutoFormProps> = ({
  onSubmit,
  initialData = {},
  isEdit = false,
  readOnly = false
}) => {
  const getInitialFormData = useCallback((data: Partial<AutoFormData>): AutoFormData => {
    return {
      marca: data.marca || '',
      modelo: data.modelo || '',
      anio: data.anio || 0,
      patente: data.patente || '',
      color: data.color || '',
      numeroChasis: data.numeroChasis || '',
      numeroMotor: data.numeroMotor || '',
      personaID: data.personaID || '',
    };
  }, []); 

  const [formData, setFormData] = useState<AutoFormData>(() => getInitialFormData(initialData));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormField, string>>>({});
  const navigate = useNavigate();

  const prevInitialDataRef = useRef<Partial<AutoFormData>>(initialData);


  useEffect(() => {
    if (JSON.stringify(initialData) !== JSON.stringify(prevInitialDataRef.current)) {
      setFormData(getInitialFormData(initialData));
      prevInitialDataRef.current = initialData; 
    }
  }, [initialData, getInitialFormData]); 


  const validateForm = useCallback((): boolean => {
    const errors: Partial<Record<FormField, string>> = {
      marca: !formData.marca ? 'La marca es requerida.' : undefined,
      modelo: !formData.modelo ? 'El modelo es requerido.' : undefined,
      anio: (!formData.anio || isNaN(Number(formData.anio)) || Number(formData.anio) <= 1900 || Number(formData.anio) > new Date().getFullYear() + 1)
        ? 'Año inválido.'
        : undefined,
      patente: (!(formData.patente ?? '').trim())
        ? 'La patente es requerida.'
        : (!/^[A-Z]{2}\d{3}[A-Z]{2}$|^[A-Z]{3}\d{3}$/.test((formData.patente ?? '').toUpperCase()))
          ? 'Formato de patente inválido (ej: AA123BB o AAA123).'
          : undefined,
      color: !(formData.color ?? '').trim() ? 'El color es requerido.' : undefined,
      personaID: (!formData.personaID || typeof formData.personaID !== 'string' || formData.personaID.length === 0)
        ? 'El ID de la persona es requerido.'
        : undefined,
    };

    const filteredErrors = Object.fromEntries(
      Object.entries(errors).filter(([, value]) => value !== undefined)
    ) as Partial<Record<FormField, string>>;

    setFieldErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const field = name as FormField;

    setFormData(prev => ({
      ...prev,
      [field]: (field === 'anio') ? (parseInt(value) || 0) : value
    }));

    setFieldErrors(prev => ({
      ...prev,
      [field]: (fieldErrors[field]) ? undefined : prev[field]
    }));
  }, [fieldErrors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;

    if (!validateForm()) {
      setError('Por favor, corrige los errores en el formulario.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const success = await onSubmit(formData);
      setError(!success ? 'No se pudo guardar el auto. Verifica los datos o intenta más tarde.' : null);
      if (success) {
        navigate('/autos');
      }
    } catch (err) {
      const message = (err instanceof Error) ? err.message : 'Error desconocido';
      setError(`Error al enviar: ${message}`);
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, navigate, onSubmit, validateForm, readOnly]);

  const renderInputField = (field: FormField, label: string, type: string = 'text') => (
    <div className="form-group">
      <label>{label}:</label>
      {readOnly ? (
        <div className="read-only-value">
          {field === 'anio' || field === 'personaID' ? String(formData[field]) : formData[field]}
        </div>
      ) : (
        <>
          <input
            type={type}
            name={field}
            value={String(formData[field])}
            onChange={handleChange}
            className={fieldErrors[field] ? 'error-input' : ''}
            disabled={isSubmitting}
            required
          />
          {fieldErrors[field] && <span className="field-error">{fieldErrors[field]}</span>}
        </>
      )}
    </div>
  );

  return (
    <div className="form-container">
      <h1>{readOnly ? 'Ver Auto' : isEdit ? 'Editar Auto' : 'Nuevo Auto'}</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={readOnly ? (e) => e.preventDefault() : handleSubmit}>
        {renderInputField('marca', 'Marca')}
        {renderInputField('modelo', 'Modelo')}
        {renderInputField('anio', 'Año', 'number')}
        {renderInputField('patente', 'Patente')}
        {renderInputField('color', 'Color')}
        {renderInputField('numeroChasis', 'Número de Chasis')}
        {renderInputField('numeroMotor', 'Número de Motor')}
        {renderInputField('personaID', 'ID de Persona')}

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
              onClick={() => navigate('/autos')}
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

export default AutoForm;