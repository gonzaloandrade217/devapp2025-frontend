import api from './api';
import { Persona, PersonaFormData } from '../tipos/Persona';
import { Auto } from '../tipos/Auto'; 

function transformarDatosAuto(autoRaw: any): Auto {
    let parsedAnio: number | undefined;
    if (typeof autoRaw.anio === 'number') {
        parsedAnio = autoRaw.anio;
    } else if (autoRaw.anio) {
        const tempAnio = parseInt(autoRaw.anio);
        if (!isNaN(tempAnio)) {
            parsedAnio = tempAnio;
        } else {
            parsedAnio = undefined;
        }
    } else {
        parsedAnio = undefined;
    }

    return {
        id: autoRaw._id ? (typeof autoRaw._id === 'object' && autoRaw._id.toHexString ? autoRaw._id.toHexString() : String(autoRaw._id)) : '',
        patente: autoRaw.patente || undefined,
        marca: autoRaw.marca || undefined,
        modelo: autoRaw.modelo || undefined,
        anio: parsedAnio,
        color: autoRaw.color || undefined,
        numeroChasis: autoRaw.numeroChasis || undefined,
        numeroMotor: autoRaw.numeroMotor || undefined,
        personaID: autoRaw.personaID || undefined
    };
}

function transformarDatosPersona(rawData: any): Persona {
    if (!rawData) {
        throw new Error("Datos crudos (rawData) inválidos proporcionados para transformarDatosPersona");
    }

    let fechaNacimientoConvertida: Date;

    if (rawData.fechaNacimiento && typeof rawData.fechaNacimiento === 'string') {
        try {
            const date = new Date(rawData.fechaNacimiento);
            if (!isNaN(date.getTime())) {
                fechaNacimientoConvertida = date;
            } else {
                console.warn('Fecha de nacimiento inválida encontrada en rawData; usando fecha actual:', rawData.fechaNacimiento);
                fechaNacimientoConvertida = new Date();
            }
        } catch (e) {
            console.warn('Error al parsear fechaNacimiento a Date desde rawData; usando fecha actual:', rawData.fechaNacimiento, e);
            fechaNacimientoConvertida = new Date();
        }
    } else if (rawData.fechaNacimiento instanceof Date) {
        fechaNacimientoConvertida = rawData.fechaNacimiento;
    } else {
        console.warn('fechaNacimiento no presente o con tipo inesperado en rawData; usando fecha actual.');
        fechaNacimientoConvertida = new Date();
    }

    const autos = Array.isArray(rawData.autos) ? rawData.autos.map(transformarDatosAuto) : [];

    const transformed: Persona = {
        id: rawData._id ? (typeof rawData._id === 'object' && rawData._id.toHexString ? rawData._id.toHexString() : String(rawData._id)) : rawData.id || '',
        dni: rawData.dni || '',
        nombre: rawData.nombre || '',
        apellido: rawData.apellido || '',
        genero: rawData.genero || 'No-Binario',
        donanteOrganos: typeof rawData.donanteOrganos === 'boolean' ? rawData.donanteOrganos : false,
        fechaNacimiento: fechaNacimientoConvertida,
        autos: autos
    };

    return transformed;
}

function isPersona(data: any): data is Persona {
    return (
        typeof data === 'object' &&
        data !== null &&
        typeof data.id === 'string' &&
        typeof data.dni === 'string' &&
        typeof data.nombre === 'string' &&
        typeof data.apellido === 'string' &&
        data.fechaNacimiento instanceof Date && 
        (data.genero === 'Masculino' || data.genero === 'Femenino' || data.genero === 'No-Binario') &&
        typeof data.donanteOrganos === 'boolean' &&
        (Array.isArray(data.autos) || data.autos === undefined || data.autos === null)
    );
}

export const obtenerPersonaPorId = async (id: string): Promise<Persona> => {
    try {
        const response = await api.get<any>(`/personas/${id}`);
        const transformedData = transformarDatosPersona(response.data);

        if (!isPersona(transformedData)) {
            console.error('La estructura de los datos de la persona recibidos no coincide con el tipo esperado DESPUÉS DE LA TRANSFORMACIÓN:', transformedData);
            throw new Error('La respuesta no coincide con el tipo Persona después de la transformación.');
        }

        return transformedData;
    } catch (error) {
        console.error('Error al obtener persona por ID:', error);
        throw error;
    }
};

export const obtenerPersonas = async (): Promise<Persona[]> => {
    try {
        const response = await api.get<any[]>('/personas');
        
        const transformedPersonas = response.data.map(transformarDatosPersona);

        return transformedPersonas;
    } catch (error) {
        console.error('Error al obtener personas:', error);
        throw error;
    }
};

export const eliminarPersona = async (id: string): Promise<boolean> => {
    try {
        const response = await api.delete<{ message?: string }>(`/personas/${id}`); 
        
        if (response.status === 200 || response.status === 204) {
            return true;
        } else {
            const errorData = response.data; 
            throw new Error(errorData.message || `Error al eliminar la persona: ${response.status}`);     }
    } catch (error: any) {
        console.error('Error en la API al eliminar persona:', error);
        throw new Error(error.message || 'Ocurrió un error desconocido al eliminar la persona.'); 
    }
};

export const actualizarPersona = async (id: string, personaData: PersonaFormData): Promise<boolean> => {
    try {
        const response = await api.put<any>(`/personas/${id}`, personaData); 

        if (response.status === 200) { 
            return true;
        } else {
            const errorData: { message?: string } = response.data;
            throw new Error(errorData.message || `Error al actualizar la persona: ${response.status}`);
        }
    } catch (error: any) {
        console.error('Error en la API al actualizar persona:', error);
        throw new Error(error.message || 'Ocurrió un error desconocido al actualizar la persona.');
    }
};