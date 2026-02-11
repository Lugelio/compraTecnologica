import { useState } from "react";
import { supabase } from "../database/conexionBase";
import { Link, useNavigate } from "react-router-dom";
import useCreate from "../database/adminBase/CRUD/create";
import "./auth.css";

function Register() {
  const [nuevoUsuario, setNuevoUsuario] = useState({ email: "", password: "", confirmPassword: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { ejecutarInsercion } = useCreate();

  const handleChange = (e) => {
    setNuevoUsuario({ ...nuevoUsuario, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  const handleRegister = async () => {
    if (nuevoUsuario.password !== nuevoUsuario.confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden");
      return;
    }
    
    setErrorMsg("");

    const { data, error } = await supabase.auth.signUp({
      email: nuevoUsuario.email,
      password: nuevoUsuario.password,
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: nuevoUsuario.email,
      password: nuevoUsuario.password,
    });

    if (loginError) {
      setErrorMsg("Error al iniciar sesión: " + loginError.message);
      return;
    }

    if (data.user) {
      await ejecutarInsercion({ user_id: data.user.id }, "carts");
    }

    navigate("/", { replace: true });
  };

  return (
    <div className="auth_page">
      <div className="auth_card">
        <h2>Crear cuenta</h2>

        {errorMsg && <div className="auth_error">{errorMsg}</div>}

        <label>Email</label>
        <input type="email" name="email" placeholder="nombre@ejemplo.com" value={nuevoUsuario.email} onChange={handleChange} />

        <label>Contraseña</label>
        <input type="password" name="password" placeholder="Mínimo 6 caracteres" value={nuevoUsuario.password} onChange={handleChange} />

        <label>Confirmar Contraseña</label>
        <input type="password" name="confirmPassword" placeholder="Repetí tu contraseña" value={nuevoUsuario.confirmPassword} onChange={handleChange} />

        <button onClick={handleRegister}>Registrarse</button>

        <p className="auth_link">
          ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;