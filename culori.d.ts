declare module "culori" {
  export function interpolate(
    colors: string[],
    mode?: string,
  ): (progress: number) => unknown;

  export function formatHex(color: unknown): string;
}
