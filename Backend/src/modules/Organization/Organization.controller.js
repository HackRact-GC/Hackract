// src/modules/organization/organization.controller.js
import organizationService from './Organization.service.js';
import organizationRepository from './Organization.repository.js';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  addMemberSchema,
  updateMemberSchema,
  paginationSchema,
  organizationIdSchema,
  memberIdSchema
} from './Organization.schema.js';
import asyncHandler from '../../utils/AsyncHandler.js';

class OrganizationController {
  createOrganization = asyncHandler(async (req, res) => {
    const { error, value } = createOrganizationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const organization = await organizationService.createOrganization(value, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: organization
    });
  });

  getOrganization = asyncHandler(async (req, res) => {
    const { error, value } = organizationIdSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const organization = await organizationService.getOrganizationById(value.organizationId, req.user.id);

    res.status(200).json({
      success: true,
      data: organization
    });
  });

  getMyOrganizations = asyncHandler(async (req, res) => {
    const { error, value } = paginationSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const result = await organizationService.getMyOrganizations(req.user.id, value);

    res.status(200).json({
      success: true,
      ...result
    });
  });

  updateOrganization = asyncHandler(async (req, res) => {
    const paramsValidation = organizationIdSchema.validate(req.params);
    if (paramsValidation.error) {
      return res.status(400).json({
        success: false,
        error: paramsValidation.error.details[0].message
      });
    }

    const bodyValidation = updateOrganizationSchema.validate(req.body);
    if (bodyValidation.error) {
      return res.status(400).json({
        success: false,
        error: bodyValidation.error.details[0].message
      });
    }

    const organization = await organizationService.updateOrganization(
      paramsValidation.value.organizationId,
      bodyValidation.value,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: 'Organization updated successfully',
      data: organization
    });
  });

  deleteOrganization = asyncHandler(async (req, res) => {
    const { error, value } = organizationIdSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    await organizationService.deleteOrganization(value.organizationId, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Organization deleted successfully'
    });
  });

  addMember = asyncHandler(async (req, res) => {
    const paramsValidation = organizationIdSchema.validate(req.params);
    if (paramsValidation.error) {
      return res.status(400).json({
        success: false,
        error: paramsValidation.error.details[0].message
      });
    }

    const bodyValidation = addMemberSchema.validate(req.body);
    if (bodyValidation.error) {
      return res.status(400).json({
        success: false,
        error: bodyValidation.error.details[0].message
      });
    }

    const member = await organizationService.addMember(
      paramsValidation.value.organizationId,
      bodyValidation.value,
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      data: member
    });
  });

  getMembers = asyncHandler(async (req, res) => {
    const paramsValidation = organizationIdSchema.validate(req.params);
    if (paramsValidation.error) {
      return res.status(400).json({
        success: false,
        error: paramsValidation.error.details[0].message
      });
    }

    const queryValidation = paginationSchema.validate(req.query);
    if (queryValidation.error) {
      return res.status(400).json({
        success: false,
        error: queryValidation.error.details[0].message
      });
    }

    const result = await organizationService.getMembers(
      paramsValidation.value.organizationId,
      queryValidation.value,
      req.user.id
    );

    res.status(200).json({
      success: true,
      ...result
    });
  });

  updateMember = asyncHandler(async (req, res) => {
    const paramsValidation = memberIdSchema.validate(req.params);
    if (paramsValidation.error) {
      return res.status(400).json({
        success: false,
        error: paramsValidation.error.details[0].message
      });
    }

    const bodyValidation = updateMemberSchema.validate(req.body);
    if (bodyValidation.error) {
      return res.status(400).json({
        success: false,
        error: bodyValidation.error.details[0].message
      });
    }

    const member = await organizationService.updateMember(
      paramsValidation.value.organizationId,
      paramsValidation.value.memberId,
      bodyValidation.value,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: 'Member updated successfully',
      data: member
    });
  });

  removeMember = asyncHandler(async (req, res) => {
    const { error, value } = memberIdSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    await organizationService.removeMember(
      value.organizationId,
      value.memberId,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: 'Member removed successfully'
    });
  });

 
  searchOrganizations = asyncHandler(async (req, res) => {
    const { error, value } = paginationSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const result = await organizationRepository.getAllOrganizations(value);

    res.status(200).json({
      success: true,
      ...result
    });
  });
}

export default new OrganizationController();