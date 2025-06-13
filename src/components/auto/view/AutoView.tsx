import { useParams } from "react-router-dom";
import { Auto } from "../../../tipos/Auto";
import { useState, useEffect } from "react";
import AutoForm from "../form/AutoForm";
import { obtenerAutoPorId } from "../../../api/autos";

interface AutoViewProps {
    initialData?: Auto;
}

const AutoView: React.FC<AutoViewProps> = ({ initialData }) => {
    const { id } = useParams<{ id: string }>();
    const [auto, setAuto] = useState<Auto | null>(null);
    const [cargando, setCargando] = useState(!initialData);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const cargarAuto = async () => {
            if (id && !initialData) { 
                try {
                    if (!id) {
                        setError('ID de auto no proporcionado en la URL.');
                        setCargando(false);
                        return; 
                    }

                    const datos = await obtenerAutoPorId(id);
                    setAuto(datos);
                } catch (err) {
                    setError('Error al cargar los datos del auto. Asegúrate de que el ID sea correcto.');
                    console.error('Detalles del error al cargar auto:', err);
                } finally {
                    setCargando(false);
                }
            } else if (initialData) { 
                setAuto(initialData);
                setCargando(false);
            } else { 
                setError('No se proporcionó un ID de auto para ver.');
                setCargando(false);
            }
        };

        cargarAuto();
    }, [id, initialData]); 

    if (cargando) return <div>Cargando...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!auto) return <div>No se encontraron datos para mostrar.</div>;

    return (
        <div className="form-container">
            <AutoForm
                initialData={auto}
                readOnly={true}
                onSubmit={() => Promise.resolve(false)}
                isEdit={false}
            />
        </div>
    );
};

export default AutoView;