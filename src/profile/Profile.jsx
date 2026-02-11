import { useState, useEffect } from "react";
import useUserSession from "../database/adminBase/userSession";
import LogoutUser from "../login/logout";
import { useNavigate } from "react-router-dom";
import useHistory from "./history";
import useProfileData from "./profileData";

function Profile() {
    const { userId, loading: sessionLoading } = useUserSession();
    const navigate = useNavigate();

    const { getHistory, loading: historyLoading } = useHistory();
    const [compras, setCompras] = useState([]);

    const { profile, loading: profileLoading } = useProfileData();
    const [showProfile, setShowProfile] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;

            // Disparamos ambas consultas en paralelo para mejorar performance
            const [resProfile, resHistory] = await Promise.all([
                profile(userId),
                getHistory(userId)
            ]);

            // Seteamos los estados si hay data
            if (resProfile.data) setShowProfile(resProfile.data);
            if (resHistory.data) setCompras(resHistory.data);
        };

        fetchUserData();
    }, [userId]);

    useEffect(() => {
        if (!sessionLoading && !userId) {
            navigate("/login");
        }
    }, [userId, sessionLoading, navigate]);

    const handleLogout = async (e) => {
        e.preventDefault();
        await LogoutUser();
    };

    if (sessionLoading) return <div className="container mt-5 text-center"><h3>Cargando sesión...</h3></div>;
    if (!userId) return null;

   return (
        <div className="container mt-5">
            {/* CABECERA */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="fw-bold">Hola, {showProfile?.email?.split('@')[0] || "Usuario"}</h1>
                <button onClick={handleLogout} className="btn btn-outline-danger btn-sm rounded-pill px-3">
                    Cerrar Sesión
                </button>
            </div>

            {/* TARJETA DE PERFIL: Unificada al estilo minimalista */}
            <div className="card p-4 mb-5 border-0 shadow-sm" style={{ borderRadius: '15px', backgroundColor: '#f8f9fa' }}>
                <h5 className="text-dark fw-bold mb-3">Información de la Cuenta</h5>
                {profileLoading ? (
                    <p>Cargando datos...</p>
                ) : (
                    <>
                        <p className="mb-1 text-secondary"><strong>Email:</strong> {showProfile?.email || "No disponible"}</p>
                        <p className="mb-0 text-muted small"><strong>ID Cliente:</strong> {userId}</p>
                    </>
                )}
            </div>

            <h2 className="mb-4 fw-bold">📦 Historial de Compras</h2>

            <div className="history-section">
                {historyLoading && (
                    <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                )}

                {!historyLoading && compras.length > 0 ? (
                    <div className="row">
                        {compras.map((compra) => {
                            // ... (mismo formateo de fecha que ya tenías)
                            const fechaRaw = compra.purchase_date || "";
                            let fechaFormateada = "Fecha no disponible";
                            if (fechaRaw) {
                                const dateObj = new Date(fechaRaw.replace(" ", "T"));
                                if (!isNaN(dateObj)) fechaFormateada = dateObj.toLocaleDateString();
                            }

                            return (
                                <div key={compra.id} className="col-12 mb-3">
                                    {/* CAMBIO AQUÍ: Mismo borde y redondeado que showCardsPc */}
                                    <div 
                                        className="card shadow-sm border" 
                                        style={{ 
                                            borderRadius: '12px', 
                                            borderColor: '#e0e0e0', // El gris suave de tus cards
                                            borderWidth: '1px' 
                                        }}
                                    >
                                        <div className="card-body d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="text-muted mb-1 small">ORDEN #{compra.id.toString().slice(0, 8).toUpperCase()}</h6>
                                                <p className="fw-bold mb-0">Comprado el {fechaFormateada}</p>
                                            </div>
                                            <div className="text-end">
                                                <p className="fs-5 fw-bold text-dark mb-0">${compra.total_cost}</p>
                                                <span className="badge rounded-pill bg-light text-dark border">
                                                    {compra.products_id?.length || 0} productos
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    !historyLoading && (
                        <div className="alert border-0 shadow-sm text-center py-5" style={{ borderRadius: '15px' }}>
                            <p className="text-muted mb-0">Aún no has realizado ninguna compra.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export default Profile;