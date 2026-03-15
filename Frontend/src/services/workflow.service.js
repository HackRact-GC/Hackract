import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// Create an Axios instance to attach auth tokens automatically
const workflowApi = axios.create({
  baseURL: `${API_URL}/workflows`,
});

workflowApi.interceptors.request.use((config) => {
  // Assuming the token is stored in localStorage by your AuthProvider
  const token = localStorage.getItem("token"); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- API Methods ---

export const createWorkflow = async (data) => {
  const response = await workflowApi.post("/", data);
  return response.data;
};

export const getWorkflowsByPentest = async (pentestId) => {
  const response = await workflowApi.get(`/pentest/${pentestId}`);
  return response.data;
};

export const getWorkflowById = async (id) => {
  const response = await workflowApi.get(`/${id}`);
  return response.data;
};

export const updateWorkflow = async (id, data) => {
  const response = await workflowApi.patch(`/${id}`, data);
  return response.data;
};

// --- History API Methods ---

export const getWorkflowHistory = async (workflowId) => {
  const response = await workflowApi.get(`/${workflowId}/history`);
  return response.data;
};

export const recordWorkflowHistory = async (workflowId, historyData) => {
  const response = await workflowApi.post(`/${workflowId}/history`, historyData);
  return response.data;
};

export default {
  createWorkflow,
  getWorkflowsByPentest,
  getWorkflowById,
  updateWorkflow,
  getWorkflowHistory,
  recordWorkflowHistory,
};
