import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Genero, Persona } from '../../../tipos/Persona';
import { PersonaFormData } from '../../../tipos/Persona';
import '../../css/Form.css';

type FormField = keyof PersonaFormData;

export interface PersonaFormProps {
    initialData?: Partial<Persona>;
    onSubmit: (data: PersonaFormData) => Promise<boolean>;
    isEdit: boolean;
    readOnly?: boolean;
}

const GENEROS_DISPONIBLES: Genero[] = ['Masculino', 'Femenino', 'No-Binario'];

const PersonaForm: React.FC<PersonaFormProps> = ({
    onSubmit,
    initialData = {},
    isEdit = false,
    readOnly = false
}) => {
    console.log("PersonaForm: initialData recibido:", initialData);
    console.log("PersonaForm: initialData.fechaDeNacimiento original:", initialData.fechaDeNacimiento);

    const getInitialFormData = useCallback((data: Partial<Persona>): PersonaFormData => {
        const fechaNacimientoString = data.fechaDeNacimiento
            ? (typeof data.fechaDeNacimiento === 'string' ? data.fechaDeNacimiento : String(data.fechaDeNacimiento))
            : '';

        return {
            dni: data.dni || '',
            nombre: data.nombre || '',
            apellido: data.apellido || '',
            fechaDeNacimiento: fechaNacimientoString,
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
            const newFormData = getInitialFormData(initialData);
            if (
                newFormData.dni !== formData.dni ||
                newFormData.nombre !== formData.nombre ||
                newFormData.apellido !== formData.apellido ||
                newFormData.genero !== formData.genero ||
                newFormData.donanteOrganos !== formData.donanteOrganos ||
                newFormData.fechaDeNacimiento !== formData.fechaDeNacimiento
            ) {
                console.log("PersonaForm: Actualizando formData con nuevos initialData");
                setFormData(newFormData);
            }
        }
    }, [initialData, getInitialFormData]);

    const parseDateFromInput = useCallback((dateString: string): Date => {
        if (!dateString) return new Date(NaN);
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
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

        const fechaNacimientoDate = parseDateFromInput(formData.fechaDeNacimiento);

        if (isNaN(fechaNacimientoDate.getTime())) {
            errors.fechaDeNacimiento = 'Fecha inválida';
        } else if (fechaNacimientoDate > hoy) {
            errors.fechaDeNacimiento = 'No puede ser fecha futura';
        } else if (fechaNacimientoDate > edadMinima) {
            errors.fechaDeNacimiento = 'Debe ser mayor de 18 años';
        }

        console.log("Errores de validación detectados:", errors);

        setFieldErrors(errors);
        const isValid = Object.keys(errors).length === 0;
        console.log("Resultado de validateForm (isValid):", isValid);
        return isValid;
    }, [formData, parseDateFromInput]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const field = name as FormField;

        console.log(`[handleChange] Campo: ${name}, Valor recibido: ${value}, Tipo de input: ${type}`);

        setFormData(prev => {
            let newValue: any = value;

            if (type === 'checkbox') {
                newValue = (e.target as HTMLInputElement).checked;
                console.log(`[handleChange] Checkbox: ${field}, Nuevo valor: ${newValue}`);
            } else if (field === 'fechaDeNacimiento') {
                newValue = value;
                console.log(`[handleChange] Fecha: ${field}, Nuevo valor (string): ${newValue}`);
            } else if (field === 'genero') {
                newValue = value as Genero;
                console.log(`[handleChange] Genero: ${field}, Nuevo valor: ${newValue}`);
            }

            const updatedFormData = { ...prev, [field]: newValue };
            console.log("[handleChange] formData actualizado (antes de setFormData):", updatedFormData);
            return updatedFormData;
        });

        if (fieldErrors[field]) {
            setFieldErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }, [fieldErrors]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});

        if (!validateForm()) {
            setError('Por favor, corrige los errores en el formulario.');
            return;
        }

        setIsSubmitting(true);
        try {
            const success = await onSubmit(formData);
            if (!success) {
                setError('Hubo un error al guardar la persona. Inténtalo de nuevo.');
            }
        } catch (err: any) {
            console.error('Error en el envío del formulario:', err);
            setError(err.message || 'Error inesperado al guardar.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderTextField = (field: FormField, label: string) => (
        <div className="form-group">
            <label>{label}:</label>
            {readOnly ? (
                <div className="read-only-value">
                    {field === 'fechaDeNacimiento'
                        ? (formData[field] ? new Date(formData[field] + 'T00:00:00').toLocaleDateString() : '')
                        : String(formData[field])
                    }
                </div>
            ) : (
                <>
                    <input
                        type={field === 'fechaDeNacimiento' ? 'date' : 'text'}
                        name={field}
                        value={String(formData[field])}
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

            <form onSubmit={handleFormSubmit}>
                {renderTextField('dni', 'DNI')}
                {renderTextField('nombre', 'Nombre')}
                {renderTextField('apellido', 'Apellido')}
                {renderTextField('fechaDeNacimiento', 'Fecha de Nacimiento')}
                {renderSelectField()}
                {renderCheckboxField()}

                {!readOnly && (
                    <div className="form-actions">
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : (isEdit ? 'Actualizar Persona' : 'Guardar Persona')}
                        </button>
                        <button type="button" onClick={() => navigate('/personas')} disabled={isSubmitting}>
                            Cancelar
                        </button>
                    </div>
                )}
                {readOnly && (
                    <div className="form-actions">
                        <button type="button" onClick={() => navigate('/personas')}>
                            Volver
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default PersonaForm;