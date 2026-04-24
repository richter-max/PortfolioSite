export type OptWidth = 640 | 1280 | 1920 | 2560;
export type OptFormat = 'avif' | 'webp' | 'jpg';

export function optImage(base: string, width: OptWidth = 1280, format: OptFormat = 'avif'): string {
  return `/img/opt/${base}-${width}.${format}`;
}

export function optImageSet(base: string, width: OptWidth = 1280): string {
  return [
    `url("/img/opt/${base}-${width}.avif") type("image/avif")`,
    `url("/img/opt/${base}-${width}.webp") type("image/webp")`,
    `url("/img/opt/${base}-${width}.jpg") type("image/jpeg")`,
  ].join(', ');
}
