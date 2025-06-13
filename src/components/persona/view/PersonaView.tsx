import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PersonaForm from "../../persona/form/PersonaForm";
import { Persona } from "../../../tipos/Persona";
import { obtenerPersonaPorId } from '../../../api/personas';

interface PersonaViewProps {
  initialData?: Persona;
}

const PersonaView: React.FC<PersonaViewProps> = ({ initialData }) => {
  const { id } = useParams<{ id: string }>();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [cargando, setCargando] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarPersona = async () => {
      try {
        if (id && !initialData) {
          const datos = await obtenerPersonaPorId(id);
          setPersona(datos);
        }
      } catch (err) {
        setError('Error al cargar los datos de la persona');
        console.error(err);
      } finally {
        setCargando(false);
      }
    };

    cargarPersona();
  }, [id, initialData]);

  if (cargando) return <div>Cargando...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!initialData && !persona) return <div>No se encontraron datos</div>;

  return (
    <div className="form-container">
      <PersonaForm 
        initialData={initialData || persona!} 
        readOnly={true}
        onSubmit={() => Promise.resolve(false)} 
        isEdit={false}
      />
    </div>
  );
};

export default PersonaView;