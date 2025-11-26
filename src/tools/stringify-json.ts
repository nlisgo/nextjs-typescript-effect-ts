export const stringifyJson = (data: unknown, formatted: boolean = false): string =>
  JSON.stringify(data, undefined, formatted ? 2 : undefined);
