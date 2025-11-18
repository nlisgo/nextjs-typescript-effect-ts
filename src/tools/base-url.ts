const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, '');

export const withBaseUrl = (path: string): string => `${baseUrl ?? ''}${path.startsWith('/') ? path : `/${path}`}`;
