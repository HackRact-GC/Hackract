import express from "express";
import AuthRouter from "./modules/auth/auth.routes.js";
import UserRouter from "./modules/user/user.routes.js";
import RoleRouter from "./modules/Roles/roles.routes.js";
import OrganizationRouter from "./modules/Organization/Organization.routes.js";
import MemberRouter from "./modules/OrgMembers/member.routes.js";
import PentestRouter from "./modules/Pentest/pentest.routes.js";
import CollaboratorRouter from "./modules/PentestCollaborator/collaborator.routes.js";
import FindingRouter from "./modules/vulnerabilityFinding/finding.routes.js";
import AiAssistantRouter from "./modules/AiAssistant/assistant.routes.js";
import AiAgentRouter from "./modules/AiAgent/agent.routes.js";
import AuditLogRouter from "./modules/AuditLogs/auditLog.routes.js";
import LegalAgreementRouter from "./modules/LegalAgreement/legalAgreement.routes.js";
import UserSignatureRouter from "./modules/UserSignature/userSignature.routes.js";
<<<<<<< HEAD
import WorkflowRouter from "./modules/Workflow/workflow.routes.js";
import WorkflowHistoryRouter from "./modules/WorkflowHistory/workflowHistory.routes.js";
=======
import HackerProfileRouter from "./modules/HackerProfile/hackerProfile.routes.js";
>>>>>>> aa5a0c3ffcdbfba4f4871c45b17db60fd7fe8c92

const router = express.Router();

router.use("/auth", AuthRouter);
router.use("/users", UserRouter);
router.use("/roles", RoleRouter);
router.use("/organizations", OrganizationRouter);
router.use("/organization-members", MemberRouter);
router.use("/pentests", PentestRouter);
router.use("/pentest-collaborators", CollaboratorRouter);
router.use("/findings", FindingRouter);
router.use("/ai-assistants", AiAssistantRouter);
router.use("/ai-agents", AiAgentRouter);
router.use("/audit-logs", AuditLogRouter);
router.use("/legal-agreements", LegalAgreementRouter);
router.use("/user-signatures", UserSignatureRouter);
<<<<<<< HEAD
router.use("/workflows", WorkflowRouter);
router.use("/workflows", WorkflowHistoryRouter);
=======
router.use("/hacker-profiles", HackerProfileRouter);
>>>>>>> aa5a0c3ffcdbfba4f4871c45b17db60fd7fe8c92

export default router;
