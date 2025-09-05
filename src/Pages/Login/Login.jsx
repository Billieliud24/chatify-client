import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCsrfToken } from "../../API/getCsrfToken";
import "./Login.css";

const Login = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await getCsrfToken();
        setCsrfToken(token);
      } catch (error) {
        console.error("Ett fel inträffade i useeefect", error);
        setError("Kunde inte ladda från servern");
      }
    };

    fetchToken();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const isValidUrl = (url) => {
    try {
      return Boolean(new URL(url));
    } catch {
      return false;
    }
  };
  const randomAvatar = () => {
    const url = `https://i.pravatar.cc/75?u=${form.username || Date.now()}`;
    setForm({ ...form, avatar: url });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("https://chatify-api.up.railway.app/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",

        body: JSON.stringify({
          username: form.username,
          password: form.password,
          csrfToken: csrfToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message === "Invalid credentials") {
          setError("fel användärnamn eller  lösönord" ||"invalid credentials");
        } else {
          setError(data.message || "Något gick fel.");
        }
        return;
      }
      const { token } = data;

      const payload = JSON.parse(atob(token.split(".")[1]));

      const userInfo = {
        id: payload.id,
        username: form.username,
        avatar: form.avatar || "https://i.pravatar.cc/100",
        token,
      };

      sessionStorage.setItem("user", JSON.stringify(userInfo));

      setSuccess(true);
      setTimeout(() => navigate("/chat"), 800);
    } catch (err) {
      setError("Nätverks fel försök igen.");
    }
  };

  return (
    <div className="login">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <input
          className="form-input"
          type="text"
          name="username"
          placeholder="skriv ditt namn"
          value={form.username}
          onChange={handleChange}
          required
        />

        <input
          className="form-input"
          type="password"
          name="password"
          placeholder="skriv ditt namn"
          value={form.password}
          onChange={handleChange}
          required
        />
        {isValidUrl(form.avatar) && (
          <div className="avatar-preview">
            <img src={form.avatar} alt="Avatar Preview" />
          </div>
        )}
        <button type="submit" disabled={!form.username || !form.password}>
          Logga in
        </button>
        {error && <p className="error-text">{error}</p>}
        {success && (
          <p className="success-text">
            login lyckades! Omdirigerar till chat app...
          </p>
        )}
        <p>
          Ny här ? <Link to="/">Registrera</Link>
        </p>

        <div className="login-term">
          <input type="checkbox" />
          <p>Godkänd vilkor och sekretspolicy.</p>
        </div>
      </form>

     
    </div>
  );
};
export default Login;
