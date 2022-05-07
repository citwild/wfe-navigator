export default class Stream {
  
  constructor( 
    date = "", 
    location = "", 
    equipment = "",
    media = [],
    earliestTime = 0,
    latestTime = 200
    ) {
    this.media = media; 
    this.earliestTime = earliestTime; 
    this.latestTime = latestTime;
    this.date = date;
    this.location = location;
    this.equipment = equipment;
  }


  // GETTERS
  getDate() {
    return this.date;
  }

  getLocation() {
    if (this.location == null) {
      return 'unknown'
    }
    return this.location;
  }

  getEquipment() {
    if (this.equipment == null) {
      return 'unknown'
    }
    return this.equipment;
  }

  getEarliestTime() {
    return this.earliestTime;
  }

  getLatestTime() {
    return this.latestTime;
  }

  getSegmentMarkers() {
    var markers = []; 
    for (var i = 0; i < this.media.length; i++) {
      markers.push(this.media[i].startTime);
      markers.push(this.media[i].endTime);
    }
    return markers;
  }

  // OTHER METHODS
  // Sort by video obj start time
  sortMedia() {
    this.media.sort((a,b) => { return a.startTime - b.startTime; });
  }
  
  addMedia(newMedia) {
    // can take single video obj or array of video objects
    this.media.push(newMedia);
    this.sortMedia();
    this.updateTimeRange(); //might not even need this
  }

  
  updateTimeRange() {

    // console.log(this.media[0].startTime + " and " + this.media[this.media.length - 1].endTime);
    this.earliestTime = this.media[0].startTime;
    this.latestTime = this.media[this.media.length - 1].endTime;
  }
  
  // return media object that exists at the currentTime parameter
  // returns NULL if there is no media at that time
  getMediaAtTime = (currentTime) => {
    //check if within range of this stream
    if (currentTime < this.earliestTime || currentTime > this.latestTime) {
      return null;
    }
    
    //iterate over all media objects in array if in range
    for (const entry of this.media) {
      if (currentTime >= entry.startTime && currentTime <= entry.startTime.endTime) {
        return entry;
      }
    }
    return null;
    //return media object or NULL 
    
  }

}