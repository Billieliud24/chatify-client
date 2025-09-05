import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
const ProtectedRoute = () => {
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user"));

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp * 1000;
      return Date.now() >= exp;
    } catch {
      return true;
    }
  };
  useEffect(() => {
    if (!user || !user.token || isTokenExpired(user.token)) {
      sessionStorage.removeItem("user");
      navigate("/", { replace: true });
    }
  }, [navigate]);
  return user && user.token && !isTokenExpired(user.token) ? <Outlet /> : null;
};

export default ProtectedRoute;
