import { appEnv } from '../../app/config/env';

export interface ResourcePathOptions {
  mock: string;
  api: string;
}

export function resolveResourcePath(paths: ResourcePathOptions) {
  return appEnv.dataSource === 'api' ? paths.api : paths.mock;
}

export function resolveResourceItemPath(
  paths: ResourcePathOptions,
  id: number,
) {
  return `${resolveResourcePath(paths)}/${id}`;
}
