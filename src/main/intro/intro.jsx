import "./Intro.css";

function Intro() {
  return (
    <section className="intro">
      <h1>CompraTecnologica</h1>

      <p className="intro-subtitle">
        Simulación de e-commerce desarrollada con React y Supabase.
      </p>

      <div className="intro-cards">
        <div className="intro-card">
          <h3>Flujo completo</h3>
          <p>
            Replica el flujo de una tienda online real:
            autenticación de usuarios, catálogo de productos
            y carrito persistente.
          </p>
        </div>

        <div className="intro-card">
          <h3>Enfoque técnico</h3>
          <p>
            Arquitectura basada en componentes, manejo
            de estado y buenas prácticas de frontend.
          </p>
        </div>

        <div className="intro-card">
          <h3>Propósito</h3>
          <p>
            Proyecto demostrativo orientado a mostrar
            lógica de negocio y experiencia de usuario.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Intro;