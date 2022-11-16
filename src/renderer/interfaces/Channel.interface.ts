import { StreamTimeline } from './StreamTimeline.type';

export interface Channel {
  streamID: number;
  channelOrder: number;
  timelineInput: StreamTimeline;
  playerRef: HTMLInputElement; // TO DELETE
  showMedia: boolean;
  muteMedia: boolean;
  gainValue: number;
  pannerValue: number;
}