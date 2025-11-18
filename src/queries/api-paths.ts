const apiBasePath = 'https://api.prod.elifesciences.org';

export const categoriesPath = ({ limit = 18 }: { limit?: number } = {}): string => `${apiBasePath}/subjects?per-page=${limit}&page=1`;
export const categoryPath = (id: string): string => `${apiBasePath}/subjects/${id}`;

export const highlightsPath = ({ limit = 3 }: { limit?: number } = {}): string => `${apiBasePath}/covers?per-page=${Math.min(limit * 2, 100)}&page=1`;

export const reviewedPreprintsPath = ({ limit = 10 }: { limit?: number } = {}): string => `${apiBasePath}/search?sort=date&order=desc&type[]=reviewed-preprint&per-page=${Math.min(limit, 100)}&page=1`;
export const reviewedPreprintPath = (id: string): string => `${apiBasePath}/reviewed-preprints/${id}`;
