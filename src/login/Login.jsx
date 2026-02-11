import { useState } from "react";
import { supabase } from "../database/conexionBase";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./auth.css";

function Login() {
  const [usuario, setUsuario] = useState({ email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState(""); // Estado para el error
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg(""); // Limpia el error al escribir
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: usuario.email,
      password: usuario.password,
    });

    if (error) {
      setErrorMsg("Email o contraseña incorrectos"); // Mensaje lógico
      return;
    }

    // Pasamos un estado al navegar para que la App sepa que hubo éxito
    navigate("/", { state: { message: "¡Sesión iniciada con éxito!" } });
  };

  return (
    <div className="auth_page">
      <div className="auth_card">
        <h2>Iniciar sesión</h2>
        
        {/* Mostramos el error solo si existe */}
        {errorMsg && <p className="error_text">{errorMsg}</p>}

        <input type="email" name="email" placeholder="Email" value={usuario.email} onChange={handleChange} />
        <input type="password" name="password" placeholder="Contraseña" value={usuario.password} onChange={handleChange} />

        <button onClick={handleLogin}>Entrar</button>

        <p className="auth_link">
          ¿No tenés cuenta? <Link to="/register">Registrate</Link>
        </p>
      </div>
    </div>
  );
} export default Login;