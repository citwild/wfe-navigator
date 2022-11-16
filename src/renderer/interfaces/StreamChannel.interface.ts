import Stream from '../classes/Stream';
import { StreamTimeline } from './StreamTimeline.type';

export interface StreamChannel {
  uniqueId: any;
  stream: Stream;
  timelineInput: StreamTimeline;
  playerRef: HTMLInputElement;
  showMedia: boolean;
  muteMedia: boolean;
  gainValue: number;
  pannerValue: number;
}