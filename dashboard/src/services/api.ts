import axios from 'axios';
import type { DashboardOverview, MessageDetail } from '../types/dashboard';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

export interface OverviewApiResponse {
  success: boolean;
  code?: number;
  message?: string;
  data?: DashboardOverview;
  details?: QcmChallenge;
}

export const fetchOverview = async (studentId?: number): Promise<OverviewApiResponse> => {
  const params = studentId ? { student_id: studentId } : {};
  const response = await apiClient.get<OverviewApiResponse>('/dashboard/overview', { params });
  return response.data;
};

export const toggleHomework = async (
  studentId: number,
  homeworkId: number,
  isDone: boolean
): Promise<boolean> => {
  const response = await apiClient.put<{ success: boolean }>(`/homework/${studentId}/toggle`, {
    id_devoir: homeworkId,
    is_done: isDone,
  });
  return response.data.success;
};

export const fetchMessageDetail = async (
  studentId: number,
  messageId: number
): Promise<MessageDetail> => {
  const response = await apiClient.get<{ success: boolean; data: MessageDetail }>(
    `/messages/${studentId}/${messageId}`
  );
  return response.data.data;
};

export const toggleMessageRead = async (
  studentId: number,
  messageId: number,
  isRead: boolean
): Promise<boolean> => {
  const response = await apiClient.put<{ success: boolean; is_read: boolean }>(
    `/messages/${studentId}/${messageId}/read`,
    { is_read: isRead }
  );
  return response.data.success;
};

export interface QcmProposition {
  raw: string;
  decoded: string;
}

export interface QcmChallenge {
  question_raw: string;
  question_decoded: string;
  propositions: QcmProposition[];
}

export const submitDoubleAuth = async (choiceRaw: string): Promise<boolean> => {
  const response = await apiClient.post<{ success: boolean; result: any }>('/auth/doubleauth', {
    choix: choiceRaw,
  });
  return response.data.success && response.data.result?.status === 'authenticated';
};
