import * as service from './agent.service.js';
import { createAgentSchema, updateAgentSchema } from './agent.schema.js';

export const create = async (req, res, next) => {
    try {
        const data = createAgentSchema.parse(req.body);
        if (req.user) data.userId = req.user.id;
        res.status(201).json(await service.createAgentSession(data));
    } catch (e) { next(e); }
};

export const get = async (req, res, next) => {
    try {
        res.json(await service.getAgentSession(req.params.id));
    } catch (e) { next(e); }
};

export const list = async (req, res, next) => {
    try {
        const filters = {
            userId: req.user.id, // Users only see their own agents usually?
            pentestId: req.query.pentestId
        };
        // If admin, maybe allow seeing others?
        res.json(await service.listAgentSessions(filters));
    } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
    try {
        res.json(await service.updateAgentSession(req.params.id, updateAgentSchema.parse(req.body)));
    } catch (e) { next(e); }
};
