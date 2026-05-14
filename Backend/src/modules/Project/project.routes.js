import express from "express";
import { protect } from "../../middleware/Auth.middleware.js";
import prisma from "../../database/prismaClient.js";
import AppError from "../../utils/AppError.js";
import { checkLegalSignature } from "../../middleware/legalSignature.middleware.js";
import { logAction } from "../AuditLogs/auditLog.service.js";

const router = express.Router();

const isOrgAdminMember = async (organizationId, userId) => {
  const member = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId,
      role: { in: ["owner", "admin"] },
    },
  });
  return Boolean(member);
};

router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const { organizationId } = req.query;
    const where = {};

    if (organizationId) {
      where.organizationId = organizationId;
    } else {
      where.OR = [
        { organization: { members: { some: { userId: req.user.id } } } },
        { collaborators: { some: { userId: req.user.id } } },
        { leadPentesterId: req.user.id },
      ];
    }

    const projects = await prisma.pentest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
        collaborators: {
          include: {
            user: { select: { id: true, fullName: true, email: true, handle: true } },
          },
        },
        workflows: { select: { id: true, name: true, updatedAt: true } },
        _count: { select: { findings: true } },
      },
    });

    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /projects/personal
 * Creates a personal (solo) pentest workspace for the requesting user.
 * No organization required. NDA gate is bypassed on this project type.
 */
router.post("/personal", async (req, res, next) => {
  try {
    const { name, description } = req.body || {};
    if (!name?.trim()) throw new AppError("Project name is required", 400);

    const project = await prisma.pentest.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isPersonal: true,
        leadPentesterId: req.user.id,
        status: "IN_PROGRESS",
        targetDomains: [],
        ipRanges: [],
        workflows: {
          create: {
            name: `${name.trim()} — Workflow`,
            nodes: [],
            edges: [],
          },
        },
      },
      include: {
        workflows: true,
        collaborators: true,
      },
    });

    // Auto-add creator as a HACKER collaborator so they can submit findings
    await prisma.pentestCollaborator.create({
      data: { pentestId: project.id, userId: req.user.id, role: "HACKER" },
    });

    await logAction("PERSONAL_WORKSPACE_CREATED", req.user.id, { pentestId: project.id, name }, req);

    res.status(201).json({ success: true, data: project, message: "Personal workspace created" });
  } catch (error) {
    next(error);
  }
});

router.get("/marketplace", async (req, res, next) => {
  try {
    // Marketplace shows only PLANNING projects
    // For now, filtering projects where the user isn't already a collaborator/admin
    const projects = await prisma.pentest.findMany({
      where: {
        status: "PLANNING",
        NOT: {
          OR: [
            { collaborators: { some: { userId: req.user.id } } },
            { leadPentesterId: req.user.id },
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        organization: { select: { id: true, name: true } },
        _count: { select: { collaborators: true } },
      },
    });

    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
});

router.get("/:projectId", async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await prisma.pentest.findUnique({
      where: { id: projectId },
      include: {
        organization: true,
        collaborators: {
          include: {
            user: { select: { id: true, fullName: true, email: true, handle: true } },
          },
        },
        findings: { orderBy: { createdAt: "desc" } },
        workflows: { orderBy: { updatedAt: "desc" } },
      },
    });

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    const canAccess =
      project.organizationId &&
      (await prisma.organizationMember.findFirst({
        where: { organizationId: project.organizationId, userId: req.user.id },
      }));
    const isCollaborator = project.collaborators.some((c) => c.userId === req.user.id);
    const isLead = project.leadPentesterId === req.user.id;

    if (!canAccess && !isCollaborator && !isLead) {
      throw new AppError("You do not have access to this project", 403);
    }

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

router.patch("/:projectId", async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name, description, status, targetDomains, ipRanges, excludedAssets, startDate, endDate } = req.body || {};

    const project = await prisma.pentest.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError("Project not found", 404);

    const canManage = await isOrgAdminMember(project.organizationId, req.user.id);
    const isProjectAdmin = await prisma.pentestCollaborator.findFirst({
        where: { pentestId: projectId, userId: req.user.id, role: "PROJECT_ADMIN" }
    });

    if (!canManage && !isProjectAdmin) {
      throw new AppError("Only organization admin or project admin can update project details", 403);
    }

    const updated = await prisma.pentest.update({
      where: { id: projectId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(targetDomains && { targetDomains }),
        ...(ipRanges && { ipRanges }),
        ...(excludedAssets !== undefined && { excludedAssets }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
      }
    });

    await logAction("PROJECT_UPDATED", req.user.id, { pentestId: projectId, updates: req.body }, req);

    res.json({ success: true, data: updated, message: "Project updated successfully" });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { 
      name, 
      description, 
      organizationId, 
      projectAdminId, 
      hackerIds = [],
      targetDomains = [],
      ipRanges = [],
      excludedAssets = "",
      startDate = null,
      endDate = null
    } = req.body || {};

    if (!name || !organizationId) {
      throw new AppError("name and organizationId are required", 400);
    }

    const canManage = await isOrgAdminMember(organizationId, req.user.id);
    if (!canManage) {
      throw new AppError("Only organization owner/admin can create projects", 403);
    }

    const project = await prisma.pentest.create({
      data: {
        name,
        description,
        organization: { connect: { id: organizationId } },
        status: "PLANNING",
        targetDomains,
        ipRanges,
        excludedAssets,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        workflows: {
          create: {
            name: `${name} - Main Workflow`,
            nodes: [
              { id: 'node-1', type: 'customNode', position: { x: 100, y: 150 }, data: { label: 'Reconnaissance', status: 'pending' } },
              { id: 'node-2', type: 'customNode', position: { x: 350, y: 150 }, data: { label: 'Exploitation', status: 'pending' } },
              { id: 'node-3', type: 'customNode', position: { x: 600, y: 150 }, data: { label: 'Reporting', status: 'pending' } }
            ],
            edges: [
              { id: 'edge-1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#00c477', strokeWidth: 2 } },
              { id: 'edge-2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#00c477', strokeWidth: 2 } }
            ],
          },
        },
        projectAgreements: {
          create: {
            title: `Standard Non-Disclosure & Rules of Engagement - ${name}`,
            version: 1,
            body: `This document outlines the standard rules of engagement and confidentiality agreements for ${name}. By signing this, you agree to not disclose any vulnerabilities found to the public until authorized.`,
            scopeSummary: `Target Domains: ${targetDomains.join(', ') || 'N/A'}\nIP Ranges: ${ipRanges.join(', ') || 'N/A'}\nExcluded: ${excludedAssets || 'None'}`,
            allowedActions: "Standard web exploitation, no destructive testing.",
            confidentiality: "Strictly confidential.",
            legalLiability: "Organization holds harmless the hacker for actions within scope.",
            createdBy: { connect: { id: req.user.id } }
          }
        }
      },
      include: { workflows: true },
    });

    const uniqueHackers = [...new Set((hackerIds || []).filter(Boolean))];
    const collaboratorRows = [
      ...(projectAdminId
        ? [{ pentestId: project.id, userId: projectAdminId, role: "PROJECT_ADMIN" }]
        : []),
      ...uniqueHackers.map((userId) => ({ pentestId: project.id, userId, role: "HACKER" })),
    ];

    if (collaboratorRows.length > 0) {
      await prisma.pentestCollaborator.createMany({
        data: collaboratorRows,
        skipDuplicates: true,
      });
    }

    const fullProject = await prisma.pentest.findUnique({
      where: { id: project.id },
      include: {
        organization: { select: { id: true, name: true } },
        collaborators: {
          include: {
            user: { select: { id: true, fullName: true, email: true, handle: true } },
          },
        },
        workflows: true,
      },
    });

    await logAction("PROJECT_CREATED", req.user.id, {
        pentestId: project.id,
        organizationId,
        name
    }, req);

    res.status(201).json({ success: true, data: fullProject, message: "Project created successfully" });
  } catch (error) {
    next(error);
  }
});

router.patch("/:projectId/admin", async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { projectAdminId } = req.body || {};
    if (!projectAdminId) throw new AppError("projectAdminId is required", 400);

    const project = await prisma.pentest.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError("Project not found", 404);

    const canManage = await isOrgAdminMember(project.organizationId, req.user.id);
    if (!canManage) {
      throw new AppError("Only organization owner/admin can assign project admin", 403);
    }

    // 1. Demote any existing PROJECT_ADMINs to HACKER
    await prisma.pentestCollaborator.updateMany({
      where: { pentestId: projectId, role: "PROJECT_ADMIN" },
      data: { role: "HACKER" }
    });

    // 2. Upsert the new PROJECT_ADMIN
    await prisma.pentestCollaborator.upsert({
      where: {
        pentestId_userId: { pentestId: projectId, userId: projectAdminId }
      },
      update: { role: "PROJECT_ADMIN" },
      create: { pentestId: projectId, userId: projectAdminId, role: "PROJECT_ADMIN" }
    });

    // 3. Update the leadPentesterId on the project
    await prisma.pentest.update({
      where: { id: projectId },
      data: { leadPentesterId: projectAdminId }
    });

    res.json({ success: true, message: "Project admin assigned successfully" });
  } catch (error) {
    next(error);
  }
});

router.post("/:projectId/hackers", async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { hackerIds = [] } = req.body || {};
    if (!Array.isArray(hackerIds) || hackerIds.length === 0) {
      throw new AppError("hackerIds must be a non-empty array", 400);
    }

    const project = await prisma.pentest.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError("Project not found", 404);

    const canManage = await isOrgAdminMember(project.organizationId, req.user.id);
    if (!canManage) {
      throw new AppError("Only organization owner/admin can add hackers", 403);
    }

    await prisma.pentestCollaborator.createMany({
      data: [...new Set(hackerIds)].map((userId) => ({ pentestId: projectId, userId, role: "HACKER" })),
      skipDuplicates: true,
    });

    res.json({ success: true, message: "Hackers added successfully" });
  } catch (error) {
    next(error);
  }
});

router.post("/:projectId/apply", checkLegalSignature, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await prisma.pentest.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError("Project not found", 404);

    if (project.status !== "PLANNING") {
        throw new AppError("Applications are only open for projects in PLANNING status", 400);
    }

    const existing = await prisma.pentestCollaborator.findUnique({
      where: { pentestId_userId: { pentestId: projectId, userId: req.user.id } },
    });

    if (existing) {
      throw new AppError(`You are already a ${existing.role} in this project`, 400);
    }

    await prisma.pentestCollaborator.create({
      data: {
        pentestId: projectId,
        userId: req.user.id,
        role: "APPLICANT",
      },
    });

    res.json({ success: true, message: "Application submitted successfully" });
  } catch (error) {
    next(error);
  }
});

router.get("/:projectId/applicants", async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await prisma.pentest.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError("Project not found", 404);

    const canManage = await isOrgAdminMember(project.organizationId, req.user.id);
    const isProjectAdmin = await prisma.pentestCollaborator.findFirst({
        where: { pentestId: projectId, userId: req.user.id, role: "PROJECT_ADMIN" }
    });

    if (!canManage && !isProjectAdmin) {
      throw new AppError("Only organization admin or project admin can view applicants", 403);
    }

    const applicants = await prisma.pentestCollaborator.findMany({
      where: { pentestId: projectId, role: "APPLICANT" },
      include: {
        user: { select: { id: true, fullName: true, handle: true, email: true } },
      },
    });

    res.json({ success: true, data: applicants });
  } catch (error) {
    next(error);
  }
});

router.post("/:projectId/hire", async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;
    if (!userId) throw new AppError("userId is required", 400);

    const project = await prisma.pentest.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError("Project not found", 404);

    const canManage = await isOrgAdminMember(project.organizationId, req.user.id);
    const isProjectAdmin = await prisma.pentestCollaborator.findFirst({
        where: { pentestId: projectId, userId: req.user.id, role: "PROJECT_ADMIN" }
    });

    if (!canManage && !isProjectAdmin) {
      throw new AppError("Only organization admin or project admin can hire hackers", 403);
    }

    await prisma.pentestCollaborator.update({
      where: { pentestId_userId: { pentestId: projectId, userId } },
      data: { role: "HACKER" },
    });

    await logAction("HACKER_HIRED", req.user.id, {
        pentestId: projectId,
        hiredUserId: userId
    }, req);

    res.json({ success: true, message: "Hacker hired successfully" });
  } catch (error) {
    next(error);
  }
});

router.get("/:projectId/activity", async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const logs = await prisma.auditLog.findMany({
      where: { pentestId: projectId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { fullName: true, handle: true } }
      }
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
});

router.post("/:projectId/kickoff", async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await prisma.pentest.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError("Project not found", 404);

    const canManage = await isOrgAdminMember(project.organizationId, req.user.id);
    const isProjectAdmin = await prisma.pentestCollaborator.findFirst({
        where: { pentestId: projectId, userId: req.user.id, role: "PROJECT_ADMIN" }
    });

    if (!canManage && !isProjectAdmin) {
      throw new AppError("Only organization admin or project admin can perform kickoff", 403);
    }

    await prisma.pentest.update({
      where: { id: projectId },
      data: { status: "IN_PROGRESS" }
    });

    await logAction("PROJECT_KICKOFF", req.user.id, {
        pentestId: projectId
    }, req);

    res.json({ success: true, message: "Project kicked off successfully" });
  } catch (error) {
    next(error);
  }
});

// ────────────────────────────────────────
// NDA / Legal Authorization Gate
// ────────────────────────────────────────

/**
 * GET /:projectId/nda-status
 * Returns: { required: bool, signed: bool, agreement: {...} | null }
 * Only relevant for hackers/collaborators. Org admins are exempt.
 */
router.get("/:projectId/nda-status", async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const project = await prisma.pentest.findUnique({
      where: { id: projectId },
      select: { organizationId: true, leadPentesterId: true, isPersonal: true },
    });
    if (!project) throw new AppError("Project not found", 404);

    // Personal workspaces never require an NDA
    if (project.isPersonal) {
      return res.json({ success: true, data: { required: false, signed: true, agreement: null } });
    }

    // Lead pentester (project owner) is exempt
    if (project.leadPentesterId === userId) {
      return res.json({ success: true, data: { required: false, signed: true, agreement: null } });
    }

    // Org admins / owners are exempt
    if (project.organizationId) {
      const isOrgMember = await prisma.organizationMember.findFirst({
        where: { organizationId: project.organizationId, userId, role: { in: ["owner", "admin"] } },
      });
      if (isOrgMember) {
        return res.json({ success: true, data: { required: false, signed: true, agreement: null } });
      }
    }

    // Fetch the active platform NDA
    const agreement = await prisma.legalAgreement.findFirst({
      where: { type: "nda", isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (!agreement) {
      return res.json({ success: true, data: { required: false, signed: true, agreement: null } });
    }

    const signature = await prisma.userSignature.findUnique({
      where: { userId_agreementId: { userId, agreementId: agreement.id } },
    });

    return res.json({
      success: true,
      data: {
        required: true,
        signed: Boolean(signature),
        agreement,
        signature: signature || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /:projectId/sign-nda
 * Body: { agreementId }
 * Signs the NDA for the given project. Logs the action.
 */
router.post("/:projectId/sign-nda", async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { agreementId } = req.body;
    const userId = req.user.id;

    if (!agreementId) throw new AppError("agreementId is required", 400);

    const project = await prisma.pentest.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError("Project not found", 404);

    const agreement = await prisma.legalAgreement.findUnique({ where: { id: agreementId } });
    if (!agreement) throw new AppError("Agreement not found", 404);
    if (!agreement.isActive) throw new AppError("This agreement is no longer active", 400);

    // Idempotent — don't error if already signed
    const existing = await prisma.userSignature.findUnique({
      where: { userId_agreementId: { userId, agreementId } },
    });

    if (existing) {
      return res.json({ success: true, data: existing, message: "NDA already signed" });
    }

    const signature = await prisma.userSignature.create({
      data: {
        userId,
        agreementId,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      },
    });

    await logAction("NDA_SIGNED", userId, { pentestId: projectId, agreementId }, req);

    res.status(201).json({ success: true, data: signature, message: "NDA signed successfully" });
  } catch (error) {
    next(error);
  }
});

router.delete("/:projectId", async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await prisma.pentest.findUnique({
      where: { id: projectId },
      select: { id: true, leadPentesterId: true, organizationId: true, name: true }
    });

    if (!project) throw new AppError("Project not found", 404);

    // RBAC: Only lead pentester or organization admin can delete
    const isLead = project.leadPentesterId === req.user.id;
    let isOrgAdmin = false;
    
    if (project.organizationId) {
      isOrgAdmin = await isOrgAdminMember(project.organizationId, req.user.id);
    }

    if (!isLead && !isOrgAdmin) {
      throw new AppError("Unauthorized: Only project leads or organization admins can delete projects", 403);
    }

    // Manually delete related records to bypass constraint issues
    await prisma.pentestCollaborator.deleteMany({ where: { pentestId: projectId } });
    await prisma.workflow.deleteMany({ where: { pentestId: projectId } });
    await prisma.finding.deleteMany({ where: { pentestId: projectId } });
    await prisma.aiAgent.deleteMany({ where: { pentestId: projectId } });

    await prisma.pentest.delete({ where: { id: projectId } });

    await logAction("PROJECT_DELETED", req.user.id, { 
      pentestId: projectId, 
      name: project.name 
    }, req);

    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
});

router.delete("/:projectId/collaborators/:userId", async (req, res, next) => {
  try {
    const { projectId, userId } = req.params;

    const project = await prisma.pentest.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError("Project not found", 404);

    const canManage = await isOrgAdminMember(project.organizationId, req.user.id);
    const isProjectAdmin = await prisma.pentestCollaborator.findFirst({
        where: { pentestId: projectId, userId: req.user.id, role: "PROJECT_ADMIN" }
    });

    if (!canManage && !isProjectAdmin) {
      throw new AppError("Only organization admin or project admin can remove collaborators", 403);
    }

    // Prevent removing the last admin? (Optional safety)
    
    await prisma.pentestCollaborator.delete({
      where: { pentestId_userId: { pentestId: projectId, userId } }
    });

    await logAction("COLLABORATOR_REMOVED", req.user.id, { pentestId: projectId, removedUserId: userId }, req);

    res.json({ success: true, message: "Collaborator removed successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;

