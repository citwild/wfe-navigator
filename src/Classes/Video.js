export default class Video {
  
  //must have startTime & endTime
  constructor(
    startTime, 
    endTime, 
    source = null, 
    name = "",
    date = "", 
    location = "", 
    equipment = ""
    ) {
    this.source = source; //the video path/source e.g. localhost:5000/media/file_name
    this.name = name;
    this.startTime = startTime;
    this.endTime = endTime
    this.date = date;
    this.location = location;
    this.equipment = equipment;
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


  // METHODS
  // isInRange(currentTime) {
  //   return (currentTime >= this.startTime && currentTime <= this.endTime);
  // }

}