// Libraries
import React, { Component } from 'react';
import * as d3 from 'd3';

// Styling 
import './App.css';

// Class objects
import Media from './Classes/Media';
import Stream from './Classes/Stream';

// Components
import MainSlider from './Components/MainSlider';
import StreamTimelines from './Components/StreamTimelines';
import StreamManager from './Components/StreamManager';

const rootDir = "http://localhost:8080/static/";

interface IState {
  configuration: any,
  sliderRange: {
    minTime: number,
    maxTime: number
  },
  masterTime: number, 
  playing: boolean,
  allStreams: any, //TODO: StreamChannel[]
  playbackIntervalObject: ReturnType<typeof setInterval>
}

interface StreamChannel {
    id: number,
    stream: Stream,
    timelineInput: StreamTimeline[],
    playerRef: HTMLInputElement,
    showMedia: boolean,
    muteMedia: boolean,
    playing: boolean
}

type StreamTimeline = { times: Array<TimeSegment> }
type TimeSegment = {
  starting_time: number,
  ending_time: number
}

/////////////////////////////////////////////////////////////

class App extends Component<{}, IState> {
  constructor() {
    super({});
    this.state = {
      //TODO: save to and load from JSON config file?
      configuration: {
        rootDir: "http://localhost:8080/static/",
        allStreams: [],
        masterTime: 0
      },
      sliderRange: {
        minTime: null,
        maxTime: null,
      },
      masterTime: 0,
      playing: false,   //<= this should water fall down through stream and video component
      allStreams: [],
      playbackIntervalObject: null
    };
  }

// TODO: potentially new central object structure
// allStreams = [
//   {
//     id: 0,
//     stream: new Stream(),
//     timelineInput: this.streamToTimeline(stream), <= transform stream object to timeline input's foprmat
//     playerRef: React.createRef(),
//     showMedia: true,    <= user can toggle hide the player without removing stream
//     muteMedia: false,
//   }
// ]


  componentDidMount() {
    // initialize some states from config file when applicable 

  }


  startPlayback = (speedFactor: number): void => {
    //start repeating functio to move scrubber line
    // by speedfactor*1sec(or 1000ms) per 1sec
    var intervalObject: ReturnType<typeof setInterval> = setInterval(() => {this.firePlaybackEvent(speedFactor)}, 1000);
    this.setState({ playbackIntervalObject: intervalObject });
    
    var playButtons: HTMLCollection = document.getElementsByClassName('toggle-play');
    
    //forEach should work with NodeList but did not
    for (var i = 0; i < playButtons.length ; i++) {
      //@ts-expect-error
      playButtons[i].click();
    }
    //start all streams
  }


  firePlaybackEvent = (speedFactor: number): void => {
    this.setState(prevState => ({
      masterTime: prevState.masterTime + (1000*speedFactor)
    }));
  }

  
  stopPlayback = (): void => {
    //clear the repeating function
    clearInterval(this.state.playbackIntervalObject);
    this.setState({ playbackIntervalObject: null });
    //stop all streams 
    var playButtons: HTMLCollection = document.getElementsByClassName('toggle-play');
    for (var i = 0; i < playButtons.length ; i++) {
      //@ts-expect-error
      playButtons[i].click();
    }
  }


  addStream = (streamDate: string, streamLocation: string, streamEquipment: string): void => {

    ///// TEMP path creator, based on COMPRESSED VERSION of files
    var pathConstruct: string[] = [streamDate];
    if (streamLocation !== "Unknown") { 
      pathConstruct.push(streamLocation);
    }
    if (streamEquipment !== "Unknown") {
      pathConstruct.push(streamEquipment);
    }
    var path: string = pathConstruct.join('/') + "/";

    var fileSuffix = "";
    if (streamLocation == 'Huddle') {
      fileSuffix = "-320";
    } else if (streamEquipment == 'gopro') {
      fileSuffix = "-320";
    } else if (streamEquipment == 'zoom') {
      fileSuffix = "-128";
    }
    ////////////////////////////////////////////////////////////

    var stream = new Stream(streamDate, streamLocation, streamEquipment);
    //@ts-expect-error
    window.api.receive("sendFiles", (data) => {
      //@ts-expect-error
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
    //@ts-expect-error
    window.api.send("getFiles", [streamDate, streamLocation, streamEquipment]);
  }

  // execute every time a video is added
  updateMasterSliderRange = (): void => {
    var getAllMins: number[] = this.state.allStreams.map( (thisStream: Stream) => thisStream.getEarliestTime() );
    var getAllMaxs: number[] = this.state.allStreams.map( (thisStream: Stream) => thisStream.getLatestTime() );
    var newMin: number = d3.min(getAllMins);
    var newMax: number = d3.max(getAllMaxs);
    // console.log("MIN/MAX: " + newMin + "-" + newMax);
    this.setState({
      sliderRange: {
        minTime: newMin,
        maxTime: newMax
      }
    });
  }

  updateMasterTime = (newMasterTime: number): void => {
    this.setState({
      masterTime: newMasterTime
    });
  }

  
  render() {
    // 1,000 ms = 1 sec
    // 60,000 ms = 1 min
    // 3,600,000 ms = 1 hr
    // 86,400,000 ms = 1 day

 
    return (
      <div style={{padding: 50}}>
        
        <div>
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
          <button onClick={() => {this.startPlayback(1)}}>start playback</button>
          <button onClick={this.stopPlayback}>stop playback</button>
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
          {this.state.allStreams.map( (thisStream: Stream) => {
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
