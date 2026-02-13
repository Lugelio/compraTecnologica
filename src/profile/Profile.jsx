import { useState, useEffect } from "react";
import useUserSession from "../database/adminBase/userSession";
import LogoutUser from "../login/logout";
import { useNavigate } from "react-router-dom";
import useHistory from "./history";
import useProfileData from "./profileData";
import "./profile.css"

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
    <div className="container mt-5 profile-container">
        {/* CABECERA */}
        <div className="d-flex justify-content-between align-items-center mb-5">
            <div>
                <h1 className="fw-bold mb-0">Hola, {showProfile?.email?.split('@')[0] || "Usuario"}</h1>
                <p className="text-muted">Checa tus gastos</p>
            </div>
            <button onClick={handleLogout} className="btn btn-logout">
                Cerrar Sesión
            </button>
        </div>

        {/* TARJETA DE PERFIL */}
        <div className="profile-info-card">
            <h5>Información de la Cuenta</h5>
            {profileLoading ? <p>Cargando datos...</p> : (
                <div className="info-grid">
                    <p><strong>Email:</strong> {showProfile?.email}</p>
                    <p className="text-muted small"><strong>Cliente ID:</strong> {userId}</p>
                </div>
            )}
        </div>

        <h2 className="mb-4 fw-bold">📦 Historial de Compras</h2>

        <div className="history-list">
            {!historyLoading && compras.length > 0 ? (
                compras.map((compra) => {
                    const fechaRaw = compra.purchase_date || "";
                    let fechaFormateada = "Fecha no disponible";
                    if (fechaRaw) {
                        const dateObj = new Date(fechaRaw.replace(" ", "T"));
                        if (!isNaN(dateObj)) fechaFormateada = dateObj.toLocaleDateString();
                    }

                    return (
                        <div key={compra.id} className="history-item">
                            <div className="order-main">
                                <span className="order-id">ORDEN #{compra.id.toString().slice(0, 8).toUpperCase()}</span>
                                <h6 className="order-date">Comprado el {fechaFormateada}</h6>
                                <span className="order-badge">{compra.products_id?.length || 0} productos</span>
                            </div>
                            <div className="order-price">
                                <span className="price-label">Total</span>
                                <p className="price-amount">${compra.total_cost}</p>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="empty-history">
                    <p>Aún no has realizado ninguna compra.</p>
                </div>
            )}
        </div>
    </div>
);
}

export default Profile;