import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import { loginUser } from "../../api/authApi";

import { toast } from "../../utils/toastStore"; 

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

 const handleSubmit = async (e) => {

    e.preventDefault();

    try {

        const response =
            await loginUser(formData);

            console.log("response", response)

        const token =
            response.data.data.token;

        const role =
            response.data.data.role;

        login(token);

        localStorage.setItem(
            "role",
            role
        );

        toast.success(
            "Login Successful"
        );

        if (role === "SHOPKEEPER") {

            navigate(
                "/shopkeeper/dashboard"
            );

        } else {

            navigate(
                "/customer/dashboard"
            );
        }

    } catch (error) {

        toast.error(
            error.response?.data?.message
            || "Something went wrong"
        );
    }
};

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;