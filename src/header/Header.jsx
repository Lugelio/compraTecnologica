import { NavLink } from "react-router-dom";
import logo from "./Logo.png";
import useUserSession from "../database/adminBase/userSession";
import "./header.css";

function Header() {
    const { userId, loading } = useUserSession();

    // Manejador del clic para cerrar sesión


    return (
        <nav className="navbar navbar-expand-lg background px-4 zoom nav_perso">
            <NavLink className="navbar-brand d-flex align-items-center img_nav" to="/">
                <img src={logo} alt="Logo" />
            </NavLink>

            <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarText"
                aria-controls="navbarText"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse justify-content-end" id="navbarText">
                <ul className="navbar-nav mb-2 mb-lg-0">
                    <li className="nav-item">
                        <NavLink to="/" end className="nav-link custom-link fs-2">
                            Home
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink to="/car" className="nav-link custom-link fs-2">
                            Carrito
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink to="/admin" className="nav-link custom-link fs-2">
                            Admin
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        {loading ? (
                            <span className="nav-link custom-link fs-2" style={{ opacity: 0.5 }}>...</span>
                        ) : !userId ? (
                            <NavLink to="/login" className="nav-link custom-link fs-2">
                                Login
                            </NavLink>
                        ) : (
                            <NavLink to="/profile" className="nav-link custom-link fs-2">
                                Perfil
                            </NavLink>

                        )}
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default Header;