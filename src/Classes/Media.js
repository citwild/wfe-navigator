export default class Media {
  
  //must have startTime & endTime
  constructor(
    startTime, 
    endTime, 
    source = "", 
    name = "",
    date = "", 
    location = "Unknown", 
    equipment = "Unknown",
    mediaType = "video", //video, audio, image
    dbItemID = null
    ) {
    this.source = source; //the video path/source e.g. localhost:5000/media/file_name
    this.name = name;
    this.startTime = startTime;
    this.endTime = endTime
    this.date = date;
    this.location = location;
    this.equipment = equipment;
    this.mediaType = mediaType;
    this.dbItemID = dbItemID;
  }


  // GETTERS
  getName() {
    return this.name;
  }

  getDate() {
    return this.date;
  }

  getLocation() {
    if (this.location == null) { 
      return 'Unknown'
    }
    return this.location;
  }

  getEquipment() {
    if (this.equipment == null) {
      return 'Unknown'
    }
    return this.equipment;
  }

  getSource() {
    return this.source;
  }


  // METHODS
  isInRange(currentTime) {
    return (currentTime >= this.startTime && currentTime <= this.endTime);
  }

}