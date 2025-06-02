import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { API_BASE_URL as API_BASE } from '../config/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log("🧑 Google user:", decoded);

    const res = await fetch(`${API_BASE}/api/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: credentialResponse.credential }),
    });

    const result = await res.json();
    if (result.verified) {
      localStorage.setItem("token", credentialResponse.credential);
      login(result);
      navigate("/dashboard");
    } else {
      alert("❌ Authentication failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-bg to-secondary-bg">
      <div className="bg-card-bg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-border-light/10 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-3">Welcome to CRM PK</h1>
          <p className="text-text-secondary text-sm">
            Sign in to manage your customers and campaigns
          </p>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => alert("Login Failed")}
            theme="outline"
            size="large"
            width="300"
            shape="pill"
          />
          
          <div className="mt-8 text-center">
            <p className="text-sm text-text-muted">
              Created by{" "}
              <span style={{ border: 'none !important', outline: 'none !important', boxShadow: 'none !important', WebkitBoxShadow: 'none !important', MozBoxShadow: 'none !important' }}>
                <a
                  href="https://pk-portfolio-six.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-color focus:outline-none active:outline-none hover:outline-none focus:ring-0 active:ring-0 hover:ring-0 focus:shadow-none active:shadow-none hover:shadow-none"
                  style={{ border: 'none !important', outline: 'none !important', boxShadow: 'none !important', WebkitBoxShadow: 'none !important', MozBoxShadow: 'none !important' }}
                >
                  Puneet Kathpalia
                </a>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
