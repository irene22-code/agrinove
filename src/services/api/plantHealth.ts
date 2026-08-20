import { api } from '../../lib/api';

export const getLookups = () => api.get<any>('/plant-health/lookups');
export const getPublicPlantHealth = (params: any) => {
    const query = new URLSearchParams(params).toString();
    return api.get<any[]>(`/plant-health?${query}`);
};
export const getPublicPlantHealthBySlug = (slug: string) => api.get<any>(`/plant-health/${slug}`);

export const getAdminPlantHealth = () => api.get<any[]>('/admin/plant-health');
export const createPlantHealth = (data: any) => api.post<any>('/admin/plant-health', data);
export const updatePlantHealth = (id: string, data: any) => api.put<any>(`/admin/plant-health/${id}`, data);
export const deletePlantHealth = (id: string) => api.delete<any>(`/admin/plant-health/${id}`);
export const updatePlantHealthStatus = (id: string, status: string) => api.patch<any>(`/admin/plant-health/${id}/status`, { status });

export const uploadPlantHealthImage = (formData: FormData) => api.post<any>('/admin/plant-health/upload-image', formData);
export const uploadPlantHealthDocument = (formData: FormData) => api.post<any>('/admin/plant-health/upload-document', formData);

export const getAdminPlantHealthById = (id: string) => api.get<any>(`/admin/plant-health/${id}`);
