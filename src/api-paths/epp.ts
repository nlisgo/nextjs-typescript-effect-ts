const apiBasePath = 'https://prod--epp.elifesciences.org/api';

export const reviewedPreprintsPath = ({ limit = 10 }: { limit?: number } = {}): string => `${apiBasePath}/preprints-no-content?order=desc&page=1&per-page=${Math.min(limit, 100)}`;
export const reviewedPreprintPath = (id: string): string => `${apiBasePath}/preprints/${id}`;
