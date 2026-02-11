import { NavLink } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaXTwitter } from "react-icons/fa6";
import "./footer.css"
function Footer() {
    return (
   <footer
      className="text-white"
      style={{ backgroundColor: "#2C2C2C" }}
    >
      {/* Main container */}
      <div className="container py-4">
        <div className="row align-items-center text-center text-md-start">
          
          {/* Left - Social media */}
          <div className="col-md-4 mb-3 mb-md-0 d-flex justify-content-center justify-content-md-start gap-3">
            <a href="#" className="social-box">
              <FaInstagram />
            </a>
            <a href="#" className="social-box">
              <FaFacebookF />
            </a>
            <a href="#" className="social-box">
              <FaXTwitter />
            </a>
          </div>

          {/* Center - CTA */}
          <div className="col-md-4 mb-3 mb-md-0">
            <p className="d-flex justify-content-center align-items-center mb-0">
              <span className="me-3">Register for free</span>
              <button
                type="button"
                className="btn btn-outline-light btn-sm"
              >
                Sign up!
              </button>
            </p>
          </div>

          {/* Right - Footer links */}
          <div className="col-md-4 d-flex justify-content-center justify-content-md-end gap-3">
            <a href="#" className="footer-link">Help</a>
            <a href="#" className="footer-link">Terms</a>
            <a href="#" className="footer-link">Privacy</a>
          </div>

        </div>
      </div>

      {/* Copyright */}
      <div
        className="text-center py-3"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.25)" }}
      >
        © 2026 YourStore — All rights reserved
      </div>
    </footer>
    )
}
export default Footer