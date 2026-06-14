export interface MpegtsErrorDetails {
  [key: string]: unknown;
}

export type MpegtsErrorHandler = (type: number | string, details: MpegtsErrorDetails) => void;

export type MpegtsEventHandler =
  | MpegtsErrorHandler
  | (() => void);

export interface MpegtsPlayer {
  attachMediaElement(video: HTMLVideoElement): void;
  load(): void;
  play(): Promise<void> | void;
  on(event: string, handler: MpegtsEventHandler): void;
  destroy(): void;
}
