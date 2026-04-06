import express from "express";
import { protect } from "../../middleware/Auth.middleware.js";
import prisma from "../../database/prismaClient.js";
import AppError from "../../utils/AppError.js";
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
      },
    });

    res.json({ success: true, data: projects });
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

router.post("/", async (req, res, next) => {
  try {
    const { name, description, organizationId, projectAdminId, hackerIds = [] } = req.body || {};
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
        organizationId,
        status: "PLANNING",
        workflows: {
          create: {
            name: `${name} - Main Workflow`,
            nodes: [],
            edges: [],
          },
        },
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

    await prisma.pentestCollaborator.deleteMany({
      where: { pentestId: projectId, role: "PROJECT_ADMIN" },
    });

    await prisma.pentestCollaborator.create({
      data: { pentestId: projectId, userId: projectAdminId, role: "PROJECT_ADMIN" },
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

router.post("/:projectId/apply", async (req, res, next) => {
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

export default router;
