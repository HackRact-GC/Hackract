import * as service from './legalAgreement.service.js';
import { createAgreementSchema, updateAgreementSchema } from './legalAgreement.schema.js';

export const create = async (req, res, next) => {
  try {
    res.status(201).json(await service.createAgreement(createAgreementSchema.parse(req.body)));
  } catch (e) { next(e); }
};

export const list = async (req, res, next) => {
  try {
    const filters = {
      type: req.query.type,
      isActive: req.query.isActive === 'true'
    };
    res.json(await service.getAllAgreements(filters));
  } catch (e) { next(e); }
};

export const get = async (req, res, next) => {
  try {
    res.json(await service.getAgreementById(req.params.id));
  } catch (e) { next(e); }
};

export const getActiveByType = async (req, res, next) => {
  try {
    res.json(await service.getActiveAgreementByType(req.params.type));
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    res.json(await service.updateAgreement(req.params.id, updateAgreementSchema.parse(req.body)));
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    await service.deleteAgreement(req.params.id);
    res.status(204).send();
  } catch (e) { next(e); }
};

export const notify = async (req, res, next) => {
  try {
    res.json(await service.notifyUsers(req.params.id));
  } catch (e) { next(e); }
};
