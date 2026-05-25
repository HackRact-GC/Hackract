import express from 'express';
import { protect } from '../../middleware/Auth.middleware.js';
import { generatePdfReport } from './report.service.js';
import AppError from '../../utils/AppError.js';
import prisma from '../../database/prismaClient.js';

const router = express.Router();

router.use(protect);

/**
 * POST /api/v1/reports/generate
 * Body: { projectId, modules: { execSummary, vulnTable, methodology, rawLogs } }
 * Response: application/pdf binary stream (browser auto-downloads)
 */
router.post('/generate', async (req, res, next) => {
  try {
    const { projectId, modules = {} } = req.body;

    if (!projectId) {
      throw new AppError('projectId is required', 400);
    }

    // Verify the requesting user has access to this project
    const project = await prisma.pentest.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        organizationId: true,
        leadPentesterId: true,
        collaborators: { select: { userId: true } },
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const userId   = req.user.id;
    const userRole = req.user.roles?.map(r => r.type) || [];

    const isCollaborator = project.collaborators.some(c => c.userId === userId);
    const isLead         = project.leadPentesterId === userId;
    const isOrgAdmin     = userRole.includes('ORG_ADMIN');
    const isProjectAdmin = userRole.includes('PROJECT_ADMIN');

    // Check org membership for org projects
    let isOrgMember = false;
    if (project.organizationId) {
      const member = await prisma.organizationMember.findFirst({
        where: { organizationId: project.organizationId, userId },
      });
      isOrgMember = Boolean(member);
    }

    if (!isCollaborator && !isLead && !isOrgAdmin && !isProjectAdmin && !isOrgMember) {
      throw new AppError('You do not have access to this project', 403);
    }

    if (isOrgAdmin) {
      throw new AppError('Organization administrators are not allowed to generate reports.', 403);
    }

    // Generate the PDF buffer
    const pdfBuffer = await generatePdfReport(projectId, modules);

    // Sanitise the project name for use as a filename
    const safeName = (project.name || 'Report')
      .replace(/[^a-z0-9\-_ ]/gi, '')
      .trim()
      .replace(/\s+/g, '-')
      .substring(0, 50);

    const filename = `Hackract-Report-${safeName}-${projectId.split('-')[0].toUpperCase()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    res.send(pdfBuffer);

  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/reports/preview
 * Body: { projectId, modules: { execSummary, vulnTable, methodology, rawLogs } }
 * Response: application/pdf binary stream (browser inline viewing)
 */
router.post('/preview', async (req, res, next) => {
  try {
    const { projectId, modules = {} } = req.body;

    if (!projectId) {
      throw new AppError('projectId is required', 400);
    }

    // Verify the requesting user has access to this project
    const project = await prisma.pentest.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        organizationId: true,
        leadPentesterId: true,
        collaborators: { select: { userId: true } },
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const userId   = req.user.id;
    const userRole = req.user.roles?.map(r => r.type) || [];

    const isCollaborator = project.collaborators.some(c => c.userId === userId);
    const isLead         = project.leadPentesterId === userId;
    const isOrgAdmin     = userRole.includes('ORG_ADMIN');
    const isProjectAdmin = userRole.includes('PROJECT_ADMIN');

    // Check org membership for org projects
    let isOrgMember = false;
    if (project.organizationId) {
      const member = await prisma.organizationMember.findFirst({
        where: { organizationId: project.organizationId, userId },
      });
      isOrgMember = Boolean(member);
    }

    if (!isCollaborator && !isLead && !isOrgAdmin && !isProjectAdmin && !isOrgMember) {
      throw new AppError('You do not have access to this project', 403);
    }

    // Generate the PDF buffer
    const pdfBuffer = await generatePdfReport(projectId, modules);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="preview.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    res.send(pdfBuffer);

  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/reports/project/:projectId/json
 * Returns the full report data as structured JSON (lightweight export)
 */
router.get('/project/:projectId/json', async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.pentest.findUnique({
      where: { id: projectId },
      include: {
        organization: { select: { name: true } },
        findings: {
          orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
          include: { reporter: { select: { fullName: true, handle: true } } },
        },
        collaborators: {
          include: { user: { select: { fullName: true, handle: true } } },
        },
      },
    });

    if (!project) throw new AppError('Project not found', 404);

    const userId   = req.user.id;
    const userRole = req.user.roles?.map(r => r.type) || [];

    const isCollaborator = project.collaborators.some(c => c.userId === userId);
    const isLead         = project.leadPentesterId === userId;
    const isOrgAdmin     = userRole.includes('ORG_ADMIN');
    const isProjectAdmin = userRole.includes('PROJECT_ADMIN');

    // Check org membership for org projects
    let isOrgMember = false;
    if (project.organizationId) {
      const member = await prisma.organizationMember.findFirst({
        where: { organizationId: project.organizationId, userId },
      });
      isOrgMember = Boolean(member);
    }

    if (!isCollaborator && !isLead && !isOrgAdmin && !isProjectAdmin && !isOrgMember) {
      throw new AppError('You do not have access to this project', 403);
    }

    if (isOrgAdmin) {
      throw new AppError('Organization administrators are not allowed to export reports.', 403);
    }

    const filename = `Hackract-Report-${projectId.split('-')[0].toUpperCase()}.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json({ success: true, generatedAt: new Date().toISOString(), data: project });

  } catch (err) {
    next(err);
  }
});

export default router;
