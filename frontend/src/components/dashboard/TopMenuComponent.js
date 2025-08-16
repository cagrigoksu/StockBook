import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";

export default function TopMenuComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate()


  const handleLogout = async () => {
    try {
      const response = await API.get("/user_logout");
      if (response.data.status === "success") {
        navigate("/");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white bg-amber-700 hover:bg-amber-800 focus:ring-1 focus:outline-none focus:ring-amber-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
        type="button"
      >
        Dropdown
        <svg
          className="w-2.5 h-2.5 ms-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>

        {isOpen && (
        <div className="absolute z-10 bg-gray-700 divide-y divide-gray-100 rounded-lg shadow-sm w-44 mt-2">
          <ul className="py-2 text-sm text-gray-700">
            <li>
              <a href="/#" className="block px-4 py-2 hover:bg-gray-600 text-white">
                Account
              </a>
            </li>
            <li>
              <a href="/#" className="block px-4 py-2 hover:bg-gray-600 text-white">
                Settings
              </a>
            </li>
            <li>
              <a href="/#" className="block px-4 py-2 hover:bg-gray-600 text-white">
                Earnings
              </a>
            </li>
          </ul>
            <div class="py-2">
                <a href="/#" onClick={handleLogout} className="block px-4 py-2 text-sm text-white hover:bg-gray-600 ">Sign out</a>
            </div>
        </div>

      )}
    </div>
  );
}
