const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, '');

export const withBaseUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!baseUrl) {
    return normalizedPath;
  }

  return `${baseUrl}${normalizedPath}`;
};
