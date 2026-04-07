import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

const StatusBadge = ({ status, children }) => {
  const colors = {
    loading: "bg-amber-100 text-amber-700 border-amber-200",
    success: "bg-green-100 text-green-800 border-green-200",
    error: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`text-xs font-mono px-2 py-1 rounded border ${colors[status]}`}>{children}</span>
  );
};

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("Enter the 6-digit code we emailed you.");
  const [form, setForm] = useState({
    email: searchParams.get("email") || "",
    code: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("Verifying...");
    try {
      const payload = { email: form.email, token: form.code };
      const { data } = await api.post("/auth/verify-email", payload);
      setStatus("success");
      const successMsg = data?.message || "Email verified! You can now log in.";
      setMessage(successMsg);
      toast.success(successMsg);
      setTimeout(() => navigate("/login"), 800);
    } catch (error) {
      const errorMsg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Verification failed. Please request a new code.";
      setStatus("error");
      setMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-3xl font-bold font-mono tracking-tighter">Verify email</h2>
        <p className="text-gray-500 text-xs font-mono tracking-wide">
          Completing verification secures your account.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <StatusBadge status={status === "idle" ? "loading" : status}>{status || "loading"}</StatusBadge>
        <p className="text-sm font-mono text-gray-800">{message}</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold tracking-widest uppercase text-gray-500 font-sans">Email</label>
          <div className="flex items-center w-full bg-gray-100 rounded-sm px-3 py-3 border border-transparent focus-within:border-black transition-all duration-300">
            <span className="text-xs font-mono text-gray-500 mr-2 select-none">root@hackract:~$</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="flex-1 bg-transparent outline-none text-sm font-mono placeholder-gray-400 text-gray-900 cursor-text"
              placeholder="username@domain.com"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold tracking-widest uppercase text-gray-500 font-sans">6-digit access code</label>
          <div className="flex items-center w-full bg-gray-100 rounded-sm px-3 py-3 border border-transparent focus-within:border-black transition-all duration-300">
            <span className="text-xs font-mono text-gray-500 mr-2 select-none">otp_verify:</span>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              required
              pattern="\d{6}"
              maxLength={6}
              className="flex-1 bg-transparent outline-none text-sm font-mono tracking-[0.8em] font-bold text-center placeholder-gray-400 text-gray-900 cursor-text"
              placeholder="000000"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-black text-[#00ff88] font-mono font-bold py-3 uppercase tracking-widest hover:bg-[#00ff88] hover:text-black transition-all duration-300 mt-2 cursor-pointer shadow-lg disabled:opacity-60"
        >
          {status === "loading" ? "Validating..." : "Execute Verification"}
        </button>
      </form>

      <div className="flex flex-col gap-3 text-xs font-mono text-gray-600">
        <p>
          If this succeeded, you can proceed to log in. If it failed, you can request a new verification link from
          the login page or register again with the same email.
        </p>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-4 py-2 bg-black text-[#00ff88] rounded-sm font-bold uppercase tracking-widest hover:bg-[#00ff88] hover:text-black transition-all duration-300"
          >
            Go to login
          </Link>
          <Link
            to="/register/hacker"
            className="px-4 py-2 border border-gray-900 text-gray-900 rounded-sm font-bold uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all duration-300"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
