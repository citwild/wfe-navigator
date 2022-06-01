// Libraries
import React, { Component } from 'react';
import * as d3 from 'd3';
import * as d3Slider from 'd3-simple-slider';

// Styling 
import './App.css';

// Class objects
import Media from './Classes/Media';
import Stream from './Classes/Stream';

// Components
import StreamTimelines from './Components/StreamTimelines';
import MainSlider from './Components/MainSlider';
import StreamManager from './Components/StreamManager';

const rootDir = "http://localhost:8080/static/";


// TODO: potentially new central object structure
// allStreams = [
//   {
//     id: 0,
//     stream: new Stream(),
//     timelineInput: this.streamToTimeline(stream), <= transform stream object to timeline input's foprmat
//     playerRef: React.createRef(),
//     showMedia: true,    <= user can toggle hide the player without removing stream
//     muteMedia: false,
//     playing: false   <= this should water fall down through stream and video component
//   }
// ]

// type State = {
//   sliderRange: {
//     minTime: number,
//     maxTime: number
//   },
//   masterTime: number, 
//   allStreams: Stream[],
//   playbackIntervalObject: number | null
// }

class App extends Component {
  constructor() {
    super();
    this.state = {
      //TODO: save to and load from JSON config file?
      // configuration: {
      //   rootDir: "http://localhost:8080/static/",
      //   allStreams: [],
      //   masterTime: 0
      // },
      sliderRange: {
        minTime: null,
        maxTime: null,
        
        // playTimeline: false
      },
      masterTime: 0,
      allStreams: [],
      localFiles: [],
      playbackIntervalObject: null
    };
  }


  componentDidMount() {
    // initialize some states from config file when applicable 

  }

  startPlayback = (speedFactor) => {
    //start repeating functio to move scrubber line
    // by speedfactor*1sec(or 1000ms) per 1sec
    var intervalObject = setInterval(() => {this.firePlaybackEvent(speedFactor)}, 1000);
    this.setState({ playbackIntervalObject: intervalObject });
    
    var playButtons = document.getElementsByClassName('toggle-play');
    
    //forEach should work with NodeList but did not
    for (var i = 0; i < playButtons.length ; i++) {
      playButtons[i].click();
    }
    //start all streams
  }


  firePlaybackEvent = (speedFactor) => {
    this.setState(prevState => ({
      masterTime: prevState.masterTime + (1000*speedFactor)
    }));
  }

  
  stopPlayback = () => {
    //clear the repeating function
    clearInterval(this.state.playbackIntervalObject);
    this.setState({ playbackIntervalObject: null });
    //stop all streams 
    var playButtons = document.getElementsByClassName('toggle-play');
    for (var i = 0; i < playButtons.length ; i++) {
      playButtons[i].click();
    }
  }


  addStream = (streamDate, streamLocation, streamEquipment) => {
    ///// TEMP path creator, based on COMPRESSED VERSION of files
    var path = [streamDate];
    if (streamLocation !== "Unknown") { 
      path.push(streamLocation);
    }
    if (streamEquipment !== "Unknown") {
      path.push(streamEquipment);
    }
    path = path.join('/') + "/";

    var fileSuffix = "";
    if (streamLocation == 'Huddle') {
      fileSuffix = "-320";
    } else if (streamEquipment == 'gopro') {
      fileSuffix = "-320";
    } else if (streamEquipment == 'zoom') {
      fileSuffix = "-128";
    }
    ///////////////

    var stream = new Stream(streamDate, streamLocation, streamEquipment);
    window.api.receive("sendFiles", (data) => {
      data.forEach(file => {
        stream.addMedia(
          new Media(
            file.time_begin, 
            file.time_end,
            path + file.file_name.split('.')[0] + fileSuffix + "." + file.file_ext, 
            file.file_name, 
            file.nominal_date, 
            file.location, 
            file.equipment
          )
        );
      })
      // console.log({stream});
      this.setState({
        allStreams: [...this.state.allStreams, stream]
      }, () => {
        console.log(this.state.allStreams);
        this.updateMasterSliderRange(); 
      });
    });
    window.api.send("getFiles", [streamDate, streamLocation, streamEquipment]);
  }

  // execute every time a video is added
  updateMasterSliderRange = () => {
    var getAllMins = this.state.allStreams.map( (thisStream) => thisStream.getEarliestTime() );
    var getAllMaxs = this.state.allStreams.map( (thisStream) => thisStream.getLatestTime() );
    var newMin = d3.min(getAllMins);
    var newMax = d3.max(getAllMaxs);
    // console.log("MIN/MAX: " + newMin + "-" + newMax);
    this.setState({
      sliderRange: {
        minTime: newMin,
        maxTime: newMax
      }
    });
  }

  updateMasterTime = (newMasterTime) => {
    this.setState({
      masterTime: newMasterTime
    });
  }

  addPlayerRef = (videoID, endTimeMS) => {
    console.log("adding player ref of id " + videoID + " and endTime of " + endTimeMS);
    //add player reference, and endtime when they are created in the child component
    this.setState(prevState => ({
      videos: prevState.videos.map((vid) => {
        if (vid.id === videoID) {
          return {
            ...vid, 
            endTime: endTimeMS
          }
        }
        return vid; 
      })
    }));
    // this.updateMasterSliderRange();
  }


  selectVideo = (event) => {
    var files = event.target.files; // FileList object
    this.setState({
      localFiles: files
    });
  }


  // TODO: iterate through all files to add 
  addVideo = () => {
    console.log(this.state.localFiles);
    if (this.state.localFiles.length !== 0){
      // this.setState({image: URL.createObjectURL(e.target.files[0])})
      var currentVidCount = this.state.videoCount;
      var newVideos = []
      //cannot use .map() or .forEach() here due to type error
      for (var eachFile of this.state.localFiles) {
        var fileURL = URL.createObjectURL(eachFile);
        console.log(fileURL);
        var blob = {
          id: ++currentVidCount,
          title: eachFile.name,
          src: fileURL.toString(),
          type: eachFile.type,
          startTime: 1644862500000,
          endTime: 1644862500000,
          playerRef: React.createRef()
        }
        newVideos.push(blob);
      }     
      var joined = this.state.videos.concat(newVideos);
      this.setState({
        videos: joined,
        videoCount: currentVidCount
      });
    }
    this.clearSelectedFiles();
  }


  stopAllPlayers = () => {}


  removeVideo = (videoID) => {
    // when remove video when playing, next video player plays 
    console.log('removing videoID ' + videoID);
    const updated = this.state.videos.filter(vid => vid.id !== videoID);
    this.setState({
      videos: updated
    });
  }

  // NOTE: work with forEach loop 
  displaySelectedFile = (f) => {
    return (
      <li><strong>{f.name}</strong> ({f.type || 'n/a'}) - {(f.size/1048576).toFixed(2)} MB</li>
    );
  }


  clearSelectedFiles = () => {
    this.setState({ localFiles: [] });
  }


  togglePlayAll = () => {
    // Calling ReactPlaterVideo component method
    this.state.videos.map(vid => vid.playerRef.current.handlePlayPause());
  }

  
  render() {
    // 1,000 ms = 1 sec
    // 60,000 ms = 1 min
    // 3,600,000 ms = 1 hr
    // 86,400,000 ms = 1 day
    // 31,536,000,000 ms = 1 yr (365 days)... not sure how to account leap year

    // files is a FileList of File objects. List some properties.
    var output = [];
    if (this.state.localFiles.length !== 0) {
      for (var f of this.state.localFiles) {
        output.push(this.displaySelectedFile(f));
      }
    }

  
    return (
      <div style={{padding: 50}}>
        
        <div>
          <h2>masterSlider</h2> 
          <button onClick={() => {this.startPlayback(1)}}>start playback</button>
          <button onClick={this.stopPlayback}>stop playback</button>
          
          <MainSlider
            sliderRange = {this.state.sliderRange}
            masterTime = {this.state.masterTime}
            updateMasterTime = {this.updateMasterTime}
            
          />
          <StreamTimelines
            sliderRange = {this.state.sliderRange}
            allStreams = {this.state.allStreams}
            masterTime = {this.state.masterTime}
            
          />
          
        </div>

        <div>
          
          {/* <h1>query filters</h1>
          <form action="#" method="post" className="query" id="query-fields">
            <div>
              <h3>location</h3>
              <p><label><input type="checkbox" name="location[]" value="PS A" />PS A</label></p>
              <p><label><input type="checkbox" name="location[]" value="Hub" />Hub</label></p>
            </div>

            <div>
              <h3>equipment</h3>
              <p><label><input type="checkbox" name="equipment[]" value="GoPro" />GoPro</label></p>
              <p><label><input type="checkbox" name="equipment[]" value="Zoom" />Zoom</label></p>
            </div>

            <div>
              <h3>date</h3>
              <p><label><input type="checkbox" name="date[]" value="2014-03-19" />2014-03-19</label></p>
              <p><label><input type="checkbox" name="date[]" value="2014-03-20" />2014-03-20</label></p>
            </div>
            
          </form>
          <h2>query result</h2> */}
        
        
        </div>

        <div id="media-container">
          {/* <p><button onClick={this.togglePlayAll}>toggle play ALL</button></p> */}
          {this.state.allStreams.map( (thisStream) => {
            var keyGen = [
              thisStream.getDate(), 
              thisStream.getLocation(), 
              thisStream.getEquipment()
            ];

            return <StreamManager
              key = {keyGen.join('|')}
              stream = {thisStream}
              masterTime = {this.state.masterTime}
              updateMasterTime = {this.updateMasterTime}
            />
            
            }
          )}
          
          
        </div>
        
        <div>

          <h4>Sample inputs</h4>
          <ul>
            <li><button onClick={() => this.addStream("2014-02-19", "PS A", "gopro")}>02/19 - A/gopro</button></li>
            <li><button onClick={() => this.addStream("2014-02-19", "Huddle", "Unknown")}>02/19 - Huddle</button></li>
          </ul>
          <ul>
            <li><button onClick={() => this.addStream("2014-02-20", "PS A", "gopro")}>02/20 - A/gopro</button></li>
            <li><button onClick={() => this.addStream("2014-02-20", "PS B", "gopro")}>02/20 - B/gopro</button></li>
            <li><button onClick={() => this.addStream("2014-02-20", "PS C", "gopro")}>02/20 - C/gopro</button></li>
            <li><button onClick={() => this.addStream("2014-02-20", "PS F", "gopro")}>02/20 - F/gopro</button></li>
            <li><button onClick={() => this.addStream("2014-02-20", "PS G", "gopro")}>02/20 - G/gopro</button></li>
            <li><button onClick={() => this.addStream("2014-02-20", "Huddle", "Unknown")}>02/20 - Huddle</button></li>
          </ul>
          <ul>
            <li><button onClick={() => this.addStream("2014-02-21", "PS C", "gopro")}>02/21 - C/gopro</button></li>
          </ul>

        </div>
        
      </div>
    );
  }
}

export default App
