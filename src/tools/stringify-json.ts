export const stringifyJson = (
  data: unknown,
  formatted: boolean = true,
): string => JSON.stringify(data, undefined, formatted ? 2 : undefined);
