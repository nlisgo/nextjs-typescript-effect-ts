const apiBasePath = 'https://prod--epp.elifesciences.org/api';

export const reviewedPreprintsPath = ({
  limit = 10,
  page = 1,
}: {
  limit?: number;
  page?: number;
} = {}): string => `${apiBasePath}/preprints-no-content?order=desc&page=${page}&per-page=${Math.min(limit, 100)}`;
export const reviewedPreprintPath = (id: string): string => `${apiBasePath}/preprints/${id}`;
