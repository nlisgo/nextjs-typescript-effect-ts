const apiBasePath = 'https://api.prod.elifesciences.org';

export const categoriesPath = ({ limit = 18, page = 1 }: { limit?: number, page?: number } = {}): string => `${apiBasePath}/subjects?order=asc&page=${page}&per-page=${Math.min(limit, 100)}`;
export const categoryPath = (id: string): string => `${apiBasePath}/subjects/${id}`;

export const highlightsPath = (): string => `${apiBasePath}/covers/current`;

export const reviewedPreprintsPath = ({ limit = 10, page = 1 }: { limit?: number, page?: number } = {}): string => `${apiBasePath}/search?sort=date&order=desc&type[]=reviewed-preprint&page=${page}&per-page=${Math.min(limit, 100)}`;
export const reviewedPreprintPath = (id: string): string => `${apiBasePath}/reviewed-preprints/${id}`;
