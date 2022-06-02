// DEPENDENT Class objects
import Media from "./Media";

export default class Stream {
  date:           string;
  location:       string;
  equipment:      string;
  media:          Array<Media>;
  earliestTime:   number;
  latestTime:     number;
  type:           string; //stream, media
  description:    string;

  constructor( 
    date: string = "", 
    location: string = "Unknown", 
    equipment: string = "Unknown",
    media: Array<Media> = new Array<Media>(),
    earliestTime: number = -1,
    latestTime: number = 0,
    type: string = "media", //stream, media
    description: string = ""
    ) {
    this.media = media; 
    this.earliestTime = earliestTime; 
    this.latestTime = latestTime;
    this.date = date;
    this.location = location;
    this.equipment = equipment;
    this.type = type;
    this.description = description;
  }


  // GETTERS
  getDate(): string {
    return this.date;
  }

  getLocation(): string {
    if (this.location == null) {
      return 'unknown'
    }
    return this.location;
  }

  getEquipment(): string {
    if (this.equipment == null) {
      return 'unknown'
    }
    return this.equipment;
  }

  getEarliestTime(): number {
    return this.earliestTime;
  }

  getLatestTime(): number {
    return this.latestTime;
  }

  getSegmentMarkers(): number[] {
    var markers = []; 
    for (var i = 0; i < this.media.length; i++) {
      markers.push(this.media[i].startTime);
      markers.push(this.media[i].endTime);
    }
    return markers;
  }

  // OTHER METHODS
  // Sort by video obj start time
  sortMedia(): void {
    this.media.sort((a,b) => { return a.startTime - b.startTime; });
  }
  
  addMedia(newMedia: Media): void {
    // can take single video obj or array of video objects
    this.media.push(newMedia);
    this.sortMedia();
    this.updateTimeRange(); //might not even need this
  }

  
  updateTimeRange(): void {
    // console.log(this.media[0].startTime + " and " + this.media[this.media.length - 1].endTime);
    this.earliestTime = this.media[0].startTime;
    this.latestTime = this.media[this.media.length - 1].endTime;
  }
  
  // return media object that exists at the currentTime parameter
  // returns NULL if there is no media at that time
  //getFirstMediaAtTime << more explicit name
  getMediaAtTime(currentTime: number): Media | null {
    //check if within range of this stream
    if (currentTime < this.earliestTime || currentTime > this.latestTime) {
      return null;
    }
  
    //iterate over all media objects in array if in range
    for (const entry of this.media) {
      if (entry.isInRange(currentTime)) {
        return entry;
      }
    }
    return null;
  }

}