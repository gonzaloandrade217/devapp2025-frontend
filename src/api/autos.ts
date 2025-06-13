import { Auto } from '../tipos/Auto';
import api from './api';

function transformarDatosAuto(rawData: any): Auto {
    if (!rawData) {
        throw new Error("Datos crudos (rawData) inválidos proporcionados para transformarDatosAuto");
    }

    const transformed: Auto = {
        id: rawData._id ? (typeof rawData._id === 'object' && rawData._id.toHexString ? rawData._id.toHexString() : String(rawData._id)) : '',
        marca: rawData.marca ?? undefined, 
        modelo: rawData.modelo ?? undefined,
        año: typeof rawData.año === 'number' ? rawData.año : (rawData.año ? parseInt(rawData.año) : undefined),
        patente: rawData.patente ?? undefined,
        color: rawData.color ?? undefined,
        numeroChasis: rawData.numeroChasis ?? undefined,
        numeroMotor: rawData.numeroMotor ?? undefined,
        personaId: rawData.personaId ?? undefined,
    };

    if (isNaN(transformed.año as number)) {
        transformed.año = undefined;
    }

    return transformed;
}

function isAuto(data: any): data is Auto {
    return (
        typeof data === 'object' &&
        data !== null &&
        typeof data.id === 'string' && 
        
        (data.marca === undefined || typeof data.marca === 'string') &&
        (data.modelo === undefined || typeof data.modelo === 'string') &&
        (data.año === undefined || typeof data.año === 'number') &&
        (data.patente === undefined || typeof data.patente === 'string') &&
        (data.color === undefined || typeof data.color === 'string') &&
        (data.numeroChasis === undefined || typeof data.numeroChasis === 'string') &&
        (data.numeroMotor === undefined || typeof data.numeroMotor === 'string') &&
        (data.personaId === undefined || typeof data.personaId === 'string')
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
};