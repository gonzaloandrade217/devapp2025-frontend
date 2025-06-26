import { Auto } from "./Auto";

export type Genero = 'Masculino' | 'Femenino' | 'No-Binario';

export interface IPersonaBase {
    dni: string;
    nombre: string;
    apellido: string;
    fechaDeNacimiento: string; 
    genero: Genero;
    donanteOrganos: boolean;
    autos?: Auto[];
}

export interface Persona extends IPersonaBase {
    id: string; 
    _id?: any;
    autos?: any[];
}

export interface PersonaRawBackend extends IPersonaBase {
    _id: string; 
}

export type PersonaFormData = IPersonaBase;

export type PersonaUpdateData = Partial<IPersonaBase>;