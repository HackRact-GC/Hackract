import agentRepository from './agent.repository.js';
import AppError from '../../utils/AppError.js';
import { AgentErrorCodes } from './agent.constants.js';

export const createAgentSession = async (data) => {
    return await agentRepository.createAgent(data);
};

export const getAgentSession = async (id) => {
    const agent = await agentRepository.findById(id);
    if (!agent) throw new AppError('Agent session not found', 404, AgentErrorCodes.NOT_FOUND);
    return agent;
};

export const updateAgentSession = async (id, data) => {
    return await agentRepository.updateAgent(id, data);
};

export const listAgentSessions = async (filters) => {
    return await agentRepository.findAll(filters);
};

export const testAgent = async (id, prompt) => {
    const agent = await getAgentSession(id);
    return {
        agentId: id,
        prompt,
        response: `[Simulated Model Interaction]: Successfully parsed prompt "${prompt}".`,
        status: 'SUCCESS',
        testedAt: new Date()
    };
};

export const deployAgent = async (id, pentestId) => {
    return await updateAgentSession(id, { isActive: true, pentestId });
};
