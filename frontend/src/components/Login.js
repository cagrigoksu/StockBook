import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Login() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/users").then((res) => setUsers(res.data));
  }, []);

  const handleSelect = async (e) => {
    const userId = e.target.value;
    await API.post("/select_user", { user_id: userId });
    localStorage.setItem("user_id", userId);
    navigate("/dashboard");
  };

  return (
    <div className="container mt-5">
      <h2>Select Your User</h2>
      <select className="form-select mt-3" onChange={handleSelect} defaultValue="">
        <option disabled value="">-- Choose a user --</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.username}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Login;
