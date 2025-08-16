import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";

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
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Select User</h2>
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring focus:ring-blue-500"
          onChange={handleSelect}
          defaultValue=""
        >
          <option disabled value="">
            -- Choose a user --
          </option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.username}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default Login;