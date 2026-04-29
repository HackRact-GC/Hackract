import { useNavigate, useParams } from "react-router-dom";
import WorkspaceView from "../components/WorkspaceView.jsx";

const OrganizationProjectWorkspace = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  return (
    <div className="flex flex-col h-full bg-[#050505] -m-10 min-h-screen text-gray-200 font-sans selection:bg-[#00c477]/30 p-6 md:p-10">
      <WorkspaceView
        projectId={projectId}
        onBack={() => navigate("/org-projects")}
      />
    </div>
  );
};

export default OrganizationProjectWorkspace;
