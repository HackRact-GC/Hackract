import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useAuth } from "../context/authContext.jsx";

const InputField = ({ label, type, placeholder, id, name, value, onChange }) => (
  <div className="flex flex-col gap-2 group">
    <label
      htmlFor={id}
      className="text-xs font-bold tracking-widest uppercase text-gray-500 font-sans cursor-pointer"
    >
      {label}
    </label>
    <div className="flex items-center w-full bg-gray-100 rounded-sm px-3 py-3 border border-transparent focus-within:border-black transition-all duration-300">
      <span className="text-xs font-mono text-gray-500 mr-2 select-none">root@hackract:~$</span>
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={name}
        className="flex-1 bg-transparent outline-none text-sm font-mono placeholder-gray-400 text-gray-900 cursor-text"
        required
      />
    </div>
  </div>
);

const SocialButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-sm py-2.5 hover:bg-gray-100 hover:border-black transition-all duration-300 cursor-pointer active:scale-95"
  >
    <span className="text-xl">{icon}</span>
    <span className="text-sm font-mono font-bold tracking-wide">{label}</span>
  </button>
);

const Register = () => {
  const { register, loading } = useAuth();
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    handle: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [roleType, setRoleType] = useState("PENTESTER"); // PENTESTER (Hacker) or ORG_ADMIN (Organization)
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        connection: 'google-oauth2',
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    });
  };

  const handleGithubLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        connection: 'github',
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    try {
      const payload = { ...form, roleType };
      const result = await register(payload);
      
      setSuccessMessage(result?.message || "Registration successful. Check your email for verification code.");
      console.info("[ui] registration success", result);

      // Redirect to OTP verification page
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
      }, 1500);
    } catch (err) {
      const backendError = err?.response?.data?.error || err?.response?.data?.message;
      setErrorMessage(backendError || "Registration failed. Please try again.");
      console.error("[ui] registration failed", err?.response?.data || err);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-3xl font-bold font-mono tracking-tighter hover:text-green-500 transition-colors duration-500 cursor-default">
          Create account
        </h2>
        <p className="text-gray-500 text-xs font-mono tracking-wide">
          Register with your email and password
        </p>
      </div>

      {/* Role toggle */}
      <div className="flex gap-2 w-full">
        {[
          { id: "PENTESTER", label: "Hacker" },
          { id: "ORG_ADMIN", label: "Organization" },
        ].map((option) => {
          const isActive = roleType === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setRoleType(option.id)}
              className={`flex-1 py-2.5 border text-xs font-mono uppercase tracking-widest rounded-sm transition-all duration-300 cursor-pointer ${
                isActive
                  ? "bg-black text-[#00ff88] border-black shadow-lg shadow-[#00ff88]/30"
                  : "bg-white text-gray-700 border-gray-300 hover:border-black hover:bg-gray-100"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-xs font-mono px-3 py-2 rounded">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-xs font-mono px-3 py-2 rounded">
            {errorMessage}
          </div>
        )}
        <InputField
          label="Full Name"
          type="text"
          id="fullName"
          name="fullName"
          placeholder="Jane Doe"
          value={form.fullName}
          onChange={handleChange}
        />
        <InputField
          label="Handle"
          type="text"
          id="handle"
          name="handle"
          placeholder="janedoe"
          value={form.handle}
          onChange={handleChange}
        />
        <InputField
          label="Email"
          type="email"
          id="email"
          name="email"
          placeholder="username@domain.com"
          value={form.email}
          onChange={handleChange}
        />
        <InputField
          label="Password"
          type="password"
          id="password"
          name="password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={handleChange}
        />
        <InputField
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Re-enter password"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-[#00ff88] font-mono font-bold py-3 uppercase tracking-widest hover:bg-[#00ff88] hover:text-black transition-all duration-300 mt-2 cursor-pointer shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-200"></div>
        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">or connect via</span>
        <div className="h-px flex-1 bg-gray-200"></div>
      </div>

      <div className="flex gap-4 w-full">
        <SocialButton
          icon={<FcGoogle />}
          label="Google"
          onClick={handleGoogleLogin}
        />
        <SocialButton
          icon={<FaGithub />}
          label="Github"
          onClick={handleGithubLogin}
        />
      </div>

      <div className="text-center text-xs font-mono text-gray-500 mt-4">
        Already have an account?{" "}
        <Link to="/login" className="underline hover:text-black transition-colors font-bold uppercase">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default Register;
