import assistantRepository from './assistant.repository.js';

export const createAssistant = async (data) => {
    return await assistantRepository.createAssistant(data);
};

export const getAssistantById = async (id) => {
    return await assistantRepository.findById(id);
};

export const getAllAssistants = async () => {
    return await assistantRepository.findAll();
};

export const updateAssistant = async (id, data) => {
    return await assistantRepository.updateAssistant(id, data);
};

export const deleteAssistant = async (id) => {
    return await assistantRepository.deleteAssistant(id);
};
