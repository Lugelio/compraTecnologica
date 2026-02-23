import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
      <div className="text-center">
        {/* Usamos text-primary para ese azul tecnológico que te gustó */}
        <h1 className="display-1 fw-bold text-primary">404</h1>
        
        <h2 className="display-5 mb-3">¡Error de Sistema!</h2>
        
        <p className="lead text-muted mb-4">
          UPS No encontramos esta página
        </p>
        
        <Link to="/" className="btn btn-primary btn-lg shadow-sm px-5 py-2">
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}

export default NotFound;