import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

const InputField = ({ label, type, placeholder, id }) => (
    <div className="flex flex-col gap-2 group">
        <label htmlFor={id} className="text-xs font-bold tracking-widest uppercase text-gray-500 font-sans">
            {label}
        </label>
        <div className="flex items-center w-full bg-gray-100 rounded-sm px-3 py-3 border border-transparent focus-within:border-black transition-colors">
            <span className="text-xs font-mono text-gray-500 mr-2 select-none">
                root@hackract:~$
            </span>
            <input
                type={type}
                id={id}
                placeholder={placeholder}
                className="flex-1 bg-transparent outline-none text-sm font-mono placeholder-gray-400 text-gray-900"
            />
        </div>
    </div>
);

const SocialButton = ({ icon: Icon, label }) => (
    <button className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-sm py-2.5 hover:bg-gray-50 transition-colors">
        <Icon className="text-xl" />
        <span className="text-sm font-mono font-bold tracking-wide">{label}</span>
    </button>
);

const Register = () => {
    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="space-y-2 text-center md:text-left">
                <h2 className="text-3xl font-bold font-mono tracking-tighter">Create Account</h2>
                <p className="text-gray-500 text-xs font-mono tracking-wide">
                    Enter a secured email and password to create your account
                </p>
            </div>

            <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
                <InputField
                    label="Email"
                    type="email"
                    id="reg-email"
                    placeholder="username@domain.com"
                />
                <InputField
                    label="Password"
                    type="password"
                    id="reg-password"
                    placeholder="................"
                />
                <InputField
                    label="Confirm Password"
                    type="password"
                    id="conf-password"
                    placeholder="................"
                />

                <button
                    type="submit"
                    className="w-full bg-black text-[#00ff88] font-mono font-bold py-3 uppercase tracking-widest hover:bg-gray-900 transition-colors mt-2"
                >
                    Register
                </button>
            </form>

            <div className="flex gap-4 w-full">
                <SocialButton icon={FcGoogle} label="Google" />
                <SocialButton icon={FaGithub} label="Github" />
            </div>

            <div className="text-center text-xs font-mono text-gray-500 mt-4">
                Already have an account?{" "}
                <Link to="/login" className="underline hover:text-black transition-colors font-bold uppercase">
                    LOGIN
                </Link>
            </div>
        </div>
    );
};

export default Register;
