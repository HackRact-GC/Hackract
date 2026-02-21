import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useAuthSync from "./hooks/useAuthSync";

function App() {
  // Automatically sync Auth0 user data with PostgreSQL backend
  useAuthSync();

  return (
    <>
      <main>
        <Outlet />
      </main>
      <Toaster />
    </>
  );
}
export default App;
