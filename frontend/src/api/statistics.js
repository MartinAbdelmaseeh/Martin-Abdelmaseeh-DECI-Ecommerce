import { apiFetch } from './client';

export const statisticsApi = {
  getOverview: () => apiFetch('/statistics/overview'),
  getTimeseries: (days = 14) => apiFetch(`/statistics/timeseries?days=${days}`),
};
