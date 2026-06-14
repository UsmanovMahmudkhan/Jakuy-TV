export interface EpgProgramme {
  channel: string;
  start: Date;
  stop: Date;
  title: string;
  description?: string;
  category?: string;
}

export interface EpgChannel {
  id: string;
  displayName: string;
  programmes: EpgProgramme[];
}

export interface EpgData {
  channels: EpgChannel[];
  generator?: string;
}
