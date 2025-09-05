import React from "react";
import { useState, useEffect } from "react";
import { useNavigate ,Link} from "react-router-dom";
import "./Register.css";
import { getCsrfToken } from "../../API/getCsrfToken";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    avatar: "",
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
        console.error("Ett fel inträffade i useeffect", error);
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
  const randomAvtar = () => {
    const url = `https://i.pravatar.cc/75?u=${form.username || Date.now()}`;
    setForm({ ...form, avatar: url });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!csrfToken) {
      setError("Säkerhetstoken saknas");
      return;
    }

    const body = { ...form, csrfToken};
    try {
      const res = await fetch(
        "https://chatify-api.up.railway.app/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(body),
          credentials:'include'
        }
      );
      const data = await res.json();

      if (!res.ok) {
        if (data.message === "Username or email already exists") {
          setError("Användarnamnet eller e-postadressen är redan upptaget.");
        } else {
          setError("Något gick fel vid registreringen.");
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate("/Login"), 1500);
    } catch (err) {
      setError("kunde inte ansluta till servern");
    }
  };

  return (
    <div className="register">
      <form className="sign-up-form" onSubmit={handleSubmit}>
        <h2>Registrera</h2>
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
          placeholder="skriv ditt lösenord"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          className="form-input"
          type="email"
          name="email"
          placeholder="skriv ditt e-postadress"
          value={form.email}
          onChange={handleChange}
          required
        />
        <div className="avatar-group">
          <input
            type="url"
            name="avatar"
            placeholder='Avatar URL, eg: "https://picsum.photos/75/75"
'
            value={form.avatar}
            onChange={handleChange}
          />
          <button
            type="button"
            className="avatar-dice"
            onClick={randomAvtar}
            title="Slumpa avatar"
          >
            🎲
          </button>
        </div>
        {isValidUrl(form.avatar) && (
          <div className="avatar-preview">
            <img src={form.avatar} alt="Avatar Preview" />
          </div>
        )}

        {error && <p className="error-text">{error}</p>}
        {success && (
          <p className="success-text">
            Registrering lyckades! Omdirigerar till inloggning...
          </p>
        )}

        <button type="submit" disabled={Object.values(form).some((v) => !v)}>
          Skapa Konto
        </button>
        <p>
          Har du konto? <Link to="/login">Logga in</Link>
        </p>

        <div className="sign-up-term">
          <input type="checkbox" />
          <p>Godkänd vilkor och sekretspolicy.</p>
        </div>
      </form>
    </div>
  );
};

export default Register;
