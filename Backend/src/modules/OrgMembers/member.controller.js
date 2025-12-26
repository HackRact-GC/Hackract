import * as service from './member.service.js';
import { addMemberSchema, updateMemberSchema } from './member.schema.js';

export const add = async (req, res, next) => {
    try {
        res.status(201).json(await service.addMember(addMemberSchema.parse(req.body)));
    } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
    try {
        const { organizationId, userId } = req.params;
        await service.removeMember(organizationId, userId);
        res.status(204).send();
    } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
    try {
        const { organizationId, userId } = req.params;
        res.json(await service.updateMember(organizationId, userId, updateMemberSchema.parse(req.body)));
    } catch (e) { next(e); }
};
