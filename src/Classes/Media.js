export default class Media {
  //must have startTime & endTime
  constructor(
    startTime, 
    endTime, 
    source = "", 
    name = "",
    date = "", 
    location = null, 
    equipment = null,
    mediaType = "video", //video, audio, image
    dbItemID= null
    ) {
    this.source = source; //the video path/source e.g. "/media/file_name"
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
    if (this.equipment) {
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








// export default class Media {
//   startTime:  number;
//   endTime:    number; 
//   source:     string; 
//   name:       string;
//   date:       string; 
//   location:   string | null; 
//   equipment:  string | null;
//   mediaType:  string; //video, audio, image
//   dbItemID:   number | null;

//   //must have startTime & endTime
//   constructor(
//     startTime: number, 
//     endTime: number, 
//     source: string = "", 
//     name: string = "",
//     date: string = "", 
//     location: string | null = null, 
//     equipment: string | null = null,
//     mediaType: string = "video", //video, audio, image
//     dbItemID: number | null = null
//     ) {
//     this.source = source; //the video path/source e.g. "/media/file_name"
//     this.name = name;
//     this.startTime = startTime;
//     this.endTime = endTime
//     this.date = date;
//     this.location = location;
//     this.equipment = equipment;
//     this.mediaType = mediaType;
//     this.dbItemID = dbItemID;
//   }


//   // GETTERS
//   getName(): string {
//     return this.name;
//   }

//   getDate(): string {
//     return this.date;
//   }

//   getLocation(): string {
//     if (this.location == null) { 
//       return 'Unknown'
//     }
//     return this.location;
//   }

//   getEquipment(): string | null {
//     if (this.equipment) {
//       return 'Unknown'
//     }
//     return this.equipment;
//   }

//   getSource(): string {
//     return this.source;
//   }


//   // METHODS
//   isInRange(currentTime: number): boolean {
//     return (currentTime >= this.startTime && currentTime <= this.endTime);
//   }

// }
