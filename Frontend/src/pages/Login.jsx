import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

const InputField = ({ label, type, placeholder, id }) => (
    <div className="flex flex-col gap-2 group">
        <label htmlFor={id} className="text-xs font-bold tracking-widest uppercase text-gray-500 font-sans cursor-pointer">
            {label}
        </label>
        <div className="flex items-center w-full bg-gray-100 rounded-sm px-3 py-3 border border-transparent focus-within:border-black transition-all duration-300">
            <span className="text-xs font-mono text-gray-500 mr-2 select-none">
                root@hackract:~$
            </span>
            <input
                type={type}
                id={id}
                placeholder={placeholder}
                className="flex-1 bg-transparent outline-none text-sm font-mono placeholder-gray-400 text-gray-900 cursor-text"
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

const Login = () => {
    const { loginWithRedirect } = useAuth0();

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

    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="space-y-2 text-center md:text-left">
                <h2 className="text-3xl font-bold font-mono tracking-tighter hover:text-green-500 transition-colors duration-500 cursor-default">Welcome back</h2>
                <p className="text-gray-500 text-xs font-mono tracking-wide">
                    Enter your user_id and password to access your account
                </p>
            </div>

            <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                <InputField
                    label="Email"
                    type="email"
                    id="email"
                    placeholder="username@domain.com"
                />
                <InputField
                    label="Password"
                    type="password"
                    id="password"
                    placeholder="................"
                />

                <button
                    type="submit"
                    className="w-full bg-black text-[#00ff88] font-mono font-bold py-3 uppercase tracking-widest hover:bg-[#00ff88] hover:text-black transition-all duration-300 mt-2 cursor-pointer shadow-lg active:scale-98"
                >
                    Login
                </button>
            </form>

            <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-gray-200"></div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">or connect via</span>
                <div className="h-[1px] flex-1 bg-gray-200"></div>
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
                Don't have an access?{" "}
                <Link to="/register" className="underline hover:text-black transition-colors font-bold uppercase">
                    New_Session
                </Link>
            </div>
        </div>
    );
};

export default Login;
