import memberRepository from './member.repository.js';

export const addMember = async (data) => {
    return await memberRepository.addMember(data);
};

export const removeMember = async (orgId, userId) => {
    return await memberRepository.removeMember(orgId, userId);
};

export const updateMember = async (orgId, userId, data) => {
    return await memberRepository.updateMember(orgId, userId, data);
};
