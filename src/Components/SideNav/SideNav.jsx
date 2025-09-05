import React from "react";
import { useNavigate } from "react-router-dom";
import "./SideNav.css";
const SideNav = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("messages");
    navigate("/login");
  };
  return (
    <div className="sidenav">
      <div className="profile-sec">
        <img
          src={user?.avatar || "https://i.pravatar.cc/100"}
          alt={user?.username}
        />
        <h3>{user?.username}</h3>
      </div>
      <button onClick={handleLogout} className="logout-btn">
        🚪 Logga ut
      </button>
    </div>
  );
};

export default SideNav;
