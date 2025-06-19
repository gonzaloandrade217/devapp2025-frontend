import { Auto } from '../tipos/Auto';
import api from './api'; 

export function transformarDatosAuto(rawData: any): Auto {
    if (!rawData) {
        throw new Error("Datos crudos (rawData) inválidos proporcionados para transformarDatosAuto");
    }

    let parsedAnio: number | undefined;
    if (typeof rawData.anio === 'number') {
        parsedAnio = rawData.anio;
    } else if (rawData.anio) {
        const tempAnio = parseInt(rawData.anio);
        if (!isNaN(tempAnio)) {
            parsedAnio = tempAnio;
        } else {
            parsedAnio = undefined;
        }
    } else {
        parsedAnio = undefined;
    }

    const transformed: Auto = {
        id: rawData._id ? (typeof rawData._id === 'object' && rawData._id.toHexString ? rawData._id.toHexString() : String(rawData._id)) : rawData.id || '',
        marca: rawData.marca || undefined,
        modelo: rawData.modelo || undefined,
        anio: parsedAnio,
        patente: rawData.patente || undefined,
        color: rawData.color || undefined,
        numeroChasis: rawData.nroChasis || undefined,
        numeroMotor: rawData.nroMotor || undefined,
        personaID: rawData.personaID || undefined,
    };

    return transformed;
}

function isAuto(data: any): data is Auto {
    return (
        typeof data === 'object' &&
        data !== null &&
        typeof data.id === 'string' && 
        
        (data.marca === undefined || typeof data.marca === 'string') &&
        (data.modelo === undefined || typeof data.modelo === 'string') &&
        (data.anio === undefined || typeof data.anio === 'number') && 
        
        (data.patente === undefined || typeof data.patente === 'string') &&
        (data.color === undefined || typeof data.color === 'string') &&
        (data.numeroChasis === undefined || typeof data.numeroChasis === 'string') &&
        (data.numeroMotor === undefined || typeof data.numeroMotor === 'string') &&
        (data.personaID === undefined || typeof data.personaID === 'string')
    );
}

export const obtenerAutoPorId = async (id: string): Promise<Auto> => {
    try {
        const response = await api.get<any>(`/autos/${id}`);
        const transformedData = transformarDatosAuto(response.data);

        if (!isAuto(transformedData)) {
            console.error('La estructura de los datos del auto recibidos no coincide con el tipo esperado DESPUÉS DE LA TRANSFORMACIÓN:', transformedData);
            throw new Error('La respuesta no coincide con el tipo Auto después de la transformación.');
        }

        return transformedData;
    } catch (error) {
        console.error('Error al obtener auto por ID:', error);
        throw error;
    }
};

export const obtenerAutos = async (): Promise<Auto[]> => {
    try {
        const response = await api.get<any[]>('/autos');
        
        const transformedAutos = response.data.map(transformarDatosAuto);

        return transformedAutos;
    } catch (error) {
        console.error('Error al obtener autos:', error);
        throw error;
    }
}

export const eliminarAuto = async (id: string): Promise<boolean> => {
    try {
        const response = await api.delete<{ message?: string }>(`/autos/${id}`);
        
        if (response.status === 200 || response.status === 204) {
            return true;
        } else {
            const errorData = response.data;
            throw new Error(errorData.message || `Error al eliminar el auto: ${response.status}`);
        }
    } catch (error: any) {
        console.error('Error en la API al eliminar auto:', error);
        throw new Error(error.message || 'Ocurrió un error desconocido al eliminar el auto.'); 
    }
};