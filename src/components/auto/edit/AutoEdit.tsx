import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAutos from "../../../hooks/useAutos";
import AutoForm from "../form/AutoForm";

const AutoEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { autos, updateAuto } = useAutos();

    if(!id) {
        return <div>Error: ID de auto no proporcionnado en la URL.</div>;
    }

    const autoToEdit = autos.find(a => a.id === id);

    if (!autoToEdit) {
    return <div>Auto no encontrado</div>;
    }

    return (
        <AutoForm
            initialData={autoToEdit}
            onSubmit={async (autoData) => {
                const success = await updateAuto(id, autoData);
                if(success) {
                    navigate(`/autos/${id}`);
                }
                return success;
            }}
            isEdit={true}
        />
    );
};

export default AutoEdit;