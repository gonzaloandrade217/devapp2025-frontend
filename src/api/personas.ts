import api from './api';
import { Persona } from '../tipos/Persona';

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

    const transformed: Persona = {
        id: rawData._id ? (typeof rawData._id === 'object' && rawData._id.toHexString ? rawData._id.toHexString() : rawData._id) : '',
        dni: rawData.dni || '',
        nombre: rawData.nombre || '',
        apellido: rawData.apellido || '',
        genero: rawData.genero || 'No-Binario',
        donanteOrganos: typeof rawData.donanteOrganos === 'boolean' ? rawData.donanteOrganos : false,
        fechaNacimiento: fechaNacimientoConvertida,
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
        typeof data.donanteOrganos === 'boolean'
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