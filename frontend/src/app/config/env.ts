const rawDataSource = import.meta.env.VITE_DATA_SOURCE;
const isApiDataSource = rawDataSource === 'api';

export const appEnv = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL || (isApiDataSource ? '/api' : ''),
  dataSource: isApiDataSource ? 'api' : 'mock',
  enableMsw: !isApiDataSource,
  isDevelopment: import.meta.env.DEV,
} as const;
