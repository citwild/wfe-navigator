// Libraries
import React, { Component } from 'react';
import * as d3 from 'd3';


// Libraries - styling
import Checkbox from '@mui/material/Checkbox';


// Styling 
import './App.css';

// Class objects
import Media from './Classes/Media';
import Stream from './Classes/Stream';

// Components
import MainSlider from './Components/MainSlider';
import StreamTimelines from './Components/StreamTimelines';
import StreamManager from './Components/StreamManager';
import StreamTimelineController from './Components/StreamTimelineController';
import QueryController from './Components/QueryController';


import { lightBlue } from '@mui/material/colors';
import TimelineValueDisplay from './Components/TimelineValueDisplay';

// const rootDir = "http://localhost:8080/static/";
const rootDir = "C:/Users/Irene/Desktop/BeamCoffer/";


interface IState {
  configuration:          any,
  sliderRange: {
    minTime:              number,
    maxTime:              number
  },
  masterTime:             number, 
  playing:                boolean,
  playbackSpeed:          number,
  allStreams:             Array<StreamChannel>,
  playbackIntervalObject: ReturnType<typeof setInterval>,
  audioContext:           any,
  focusStream:            any
}

interface StreamChannel {
    uniqueId:       number,
    stream:         Stream,
    timelineInput:  StreamTimeline,
    playerRef:      HTMLInputElement,
    showMedia:      boolean,
    muteMedia:      boolean
}

type StreamTimeline = { times: Array<TimeSegment> }
type TimeSegment = {
  starting_time:  number,
  ending_time:    number
}

/////////////////////////////////////////////////////////////

class App extends Component<{}, IState> {
  constructor() {
    super({});
    this.state = {
      //TODO: save to and load from JSON config file
      configuration: {
        rootDir: "",
        allStreams: [],
        masterTime: 0
      },
      sliderRange: {
        minTime: null,
        maxTime: null,
      },
      masterTime: 0,
      playing: false,
      playbackSpeed: 1,   
      allStreams: [],
      playbackIntervalObject: null,
      audioContext: new window.AudioContext(),
      focusStream: null
    };
  }

  componentDidMount() {
    // initialize some states from config file when applicable 
    if (this.state.sliderRange.minTime !== null) {
      this.updateMasterTime(this.state.sliderRange.minTime);
    } 
  }

  componentDidUpdate() {
    if (this.state.masterTime === 0 && this.state.sliderRange.minTime !== null) {
      this.updateMasterTime(this.state.sliderRange.minTime);
    }
  }

  startPlayback = (speedFactor: number): void => {
    //start repeating functio to move scrubber line
    //by speedfactor*1sec(or 1000ms) per 1sec
    if (speedFactor === 0) {
      const factorFromState = this.state.playbackSpeed;
      var intervalObject: ReturnType<typeof setInterval> = setInterval(() => {this.firePlaybackEvent(factorFromState)}, 1000);
      this.setState({ 
        playbackIntervalObject: intervalObject,
        playing: true,
      });
    } else {
      var intervalObject: ReturnType<typeof setInterval> = setInterval(() => {this.firePlaybackEvent(speedFactor)}, 1000);
      this.setState({ 
        playbackIntervalObject: intervalObject,
        playing: true,
        // playbackSpeed: speedFactor
      });
    }
    

    


    // var playButtons: HTMLCollection = document.getElementsByClassName('toggle-play');
    
    // //forEach should work with NodeList but did not
    // for (var i = 0; i < playButtons.length ; i++) {
    //   //@ts-expect-error
    //   playButtons[i].click();
    // }
    //start all streams
  }


  firePlaybackEvent = (speedFactor: number): void => {
    // this.setState(prevState => ({
    //   masterTime: prevState.masterTime + (1000*speedFactor)
    // }));
    this.updateMasterTime(this.state.masterTime + (1000*speedFactor));
  }

  
  stopPlayback = (): void => {
    //clear the repeating function
    clearInterval(this.state.playbackIntervalObject);
    this.setState({ 
      playbackIntervalObject: null,
      playing: false
    });
    // //stop all streams 
    // var playButtons: HTMLCollection = document.getElementsByClassName('toggle-play');
    // for (var i = 0; i < playButtons.length ; i++) {
    //   //@ts-expect-error
    //   playButtons[i].click();
    // }
  }


  showMediaToggle = (streamID: number): void => {
    var newState = this.state.allStreams.map( eachStream => {
      if (eachStream.uniqueId === streamID) {
        return {...eachStream, showMedia: !eachStream.showMedia};
      } else {
        return eachStream;
      }
    });
    this.setState({
      allStreams: newState
    })
  } 

  muteMediaToggle = (streamID: number): void => {
    var newState = this.state.allStreams.map( eachStream => {
      if (eachStream.uniqueId === streamID) {
        return {...eachStream, muteMedia: !eachStream.muteMedia};
      } else {
        return eachStream;
      }
    });
    this.setState({
      allStreams: newState
    })
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
    if (streamLocation === 'Huddle') {
      fileSuffix = "-320";
    } else if (streamEquipment === 'gopro') {
      fileSuffix = "-320";
    } else if (streamEquipment === 'zoom') {
      fileSuffix = "-128";
    }
    ////////////////////////////////////////////////////////////
    console.log(path);
    var stream = new Stream(streamDate, streamLocation, streamEquipment);
    //@ts-expect-error
    window.api.receive("sendFiles", (data) => {
      //@ts-expect-error
      data.forEach(file => {
        stream.addMedia(
          new Media(
            file.time_begin, 
            file.time_end,
            path + file.file_name.split('.')[0] + fileSuffix + "." + (file.media_type === 'Video' ? file.file_ext : "mp3"), 
            file.file_name, 
            file.nominal_date, 
            file.location, 
            file.equipment,
            file.media_type,
            file.media_id
          )
        );
      })
      // console.log({stream});
      var newStreamChannel: StreamChannel = {
        uniqueId: Date.now(),
        stream: stream,
        timelineInput:  this.transformStreamToTimelineFormat(stream),
        playerRef: null,
        showMedia: true,
        muteMedia: false
      };
      this.setState({
        allStreams: [...this.state.allStreams, newStreamChannel]
      }, () => {
        console.log(this.state.allStreams);
        this.updateMasterSliderRange(); 
      });
    });
    //@ts-expect-error
    window.api.send("getFiles", [streamDate, streamLocation, streamEquipment]);
  }


  removeStream = (streamID: number, index: number) => {
    // handle focusStream interaction with remove
    if (this.state.focusStream !== null && index === this.state.focusStream) {
      this.setState({ focusStream: null });
    } else if (this.state.focusStream !== null && index < this.state.focusStream) {
      this.setState( prevState => ({ 
        focusStream: prevState.focusStream - 1 
      }));
    }

    // about to delete the last one 
    if (this.state.allStreams.length == 1) {
      this.stopPlayback();
      this.updateMasterTime(0);
      this.setState({ 
        sliderRange: {minTime: null, maxTime: null},
        playing: false,
        playbackIntervalObject: null,
        allStreams: []
      });
    } else {
      this.setState( prevState => ({ 
        allStreams: prevState.allStreams.filter( thisStream => thisStream.uniqueId !== streamID) 
      }), () => {
        this.updateMasterSliderRange();
      });
    }
    
  }


  moveStreamUp = (streamIndex: number) => {
    if (streamIndex > 0) {
      //move up by one index
      const newAllStreams: StreamChannel[] = [];
      for (var i = 0; i < streamIndex - 1; i++) {
        newAllStreams.push(this.state.allStreams[i]);
      }
      newAllStreams.push(this.state.allStreams[streamIndex]);
      newAllStreams.push(this.state.allStreams[streamIndex - 1]);
      for (var i = streamIndex + 1; i < this.state.allStreams.length; i++) {
        newAllStreams.push(this.state.allStreams[i]);
      }
      this.setState({ allStreams: newAllStreams});

      //handler for moving streams adjacent to the focusStream
      if (this.state.focusStream !== null && streamIndex === this.state.focusStream ) {
        this.setState( prevState => ({ 
          focusStream: prevState.focusStream - 1 
        }));
      } else if (this.state.focusStream !== null && streamIndex === this.state.focusStream + 1) {
        this.setState( prevState => ({ 
          focusStream: prevState.focusStream + 1 
        }));
      }
    }
  }


  moveStreamDown = (streamIndex: number) => {
    //if not the last in order
    if (streamIndex < this.state.allStreams.length - 1) {
      
      //move down by one index
      const newAllStreams: StreamChannel[] = [];
      for (var i = 0; i < streamIndex; i++) {
        newAllStreams.push(this.state.allStreams[i]);
      }
      newAllStreams.push(this.state.allStreams[streamIndex + 1]);
      newAllStreams.push(this.state.allStreams[streamIndex]);
      for (var i = streamIndex + 2; i < this.state.allStreams.length; i++) {
        newAllStreams.push(this.state.allStreams[i]);
      }
      this.setState({ allStreams: newAllStreams});
      //handler for moving streams adjacent to the focusStream
      if (streamIndex === this.state.focusStream) {
        this.setState( prevState => ({ 
          focusStream: prevState.focusStream + 1 
        }));
      } else if (streamIndex === this.state.focusStream - 1) {
        this.setState( prevState => ({ 
          focusStream: prevState.focusStream - 1 
        }));
      }
    }
  }

  //probably not needed
  showFileInDir = (filePath: string): void => {
    console.log( rootDir + filePath);
    //@ts-expect-error
    window.api.send("selectFileInDir", rootDir + filePath);
  }

  // MAY be able to pass this as props to StreamTimelines
  transformStreamToTimelineFormat = (thisStream: Stream): StreamTimeline => {
    let channel: StreamTimeline = {
      times: []
    };
    thisStream.media.map( thisMedia => {
      channel.times.push(
        {
          "starting_time": thisMedia.startTime, 
          "ending_time": thisMedia.endTime
        }
      );
    });
    return channel;
  }

  // execute every time a video is added
  updateMasterSliderRange = (): void => {
    var getAllMins: number[] = this.state.allStreams.map( (thisChannel: StreamChannel) => thisChannel.stream.getEarliestTime() );
    var getAllMaxs: number[] = this.state.allStreams.map( (thisChannel: StreamChannel) => thisChannel.stream.getLatestTime() );
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
    // console.log(newMasterTime + " " +  this.state.sliderRange.minTime);
    if (this.state.sliderRange.minTime === null) {
      this.setState({
        masterTime: 0
      });
    }
    else if (this.state.sliderRange.minTime !== null && newMasterTime < this.state.sliderRange.minTime) {
      this.stopPlayback();
      this.setState({
        masterTime: this.state.sliderRange.minTime
      });
    } else if (this.state.sliderRange.maxTime !== null && this.state.sliderRange.maxTime < newMasterTime) {
      this.stopPlayback();
      this.setState({
        masterTime: this.state.sliderRange.maxTime
      });
    } else {
      this.setState({
        masterTime: newMasterTime
      });
    }
  }


  FocusStream = (): React.ReactElement => {
    return (
      <div id="focus-area">
        <div id ="focus-stream"></div>
      </div>
    )
  }

  setFocusStream = (streamIndex: number) => {
    this.setState({ focusStream: streamIndex });
  }

  resetFocusStream = () => {
    this.setState({ focusStream: null });
  }
  
  handlePlaybackSpeedChange = (e: any) => {
    this.setState({ playbackSpeed: e.target.value});
  }


  getQueryFields = () => {
    //dynamically gets all distinct fields from db 
  }


  render() {
    // 1,000 ms = 1 sec
    // 60,000 ms = 1 min
    // 3,600,000 ms = 1 hr
    // 86,400,000 ms = 1 day
 
    const allGroupings2 = [
      ["2014-02-19", "Huddle", "Unknown"],
      ["2014-02-19", "PS A", "gopro"],
      ["2014-02-19", "PS A", "zoom"],
      ["2014-02-19", "PS B", "gopro"],
      ["2014-02-19", "PS B", "zoom"],
      ["2014-02-19", "PS C", "gopro"],
      ["2014-02-19", "PS C", "zoom"],
      // ["2014-02-19", "PS F", "gopro"],
      ["2014-02-19", "PS F", "zoom"],
      // ["2014-02-19", "PS G", "gopro"],
      // ["2014-02-19", "PS G", "zoom"],
      // ["2014-02-19", "Unknown", "Unknown"],

      ["2014-02-20", "Huddle", "Unknown"],
      ["2014-02-20", "PS A", "gopro"],
      ["2014-02-20", "PS A", "zoom"],
      ["2014-02-20", "PS B", "gopro"],
      ["2014-02-20", "PS B", "zoom"],
      ["2014-02-20", "PS C", "gopro"],
      ["2014-02-20", "PS C", "zoom"],
      ["2014-02-20", "PS D", "zoom"],
      ["2014-02-20", "PS F", "gopro"],
      ["2014-02-20", "PS F", "zoom"],
      // ["2014-02-20", "PS G", "gopro"],
      // ["2014-02-20", "PS G", "zoom"],

      ["2014-02-21", "Huddle", "Unknown"],
      ["2014-02-21", "PS A", "gopro"],
      ["2014-02-21", "PS A", "zoom"],
      ["2014-02-21", "PS B", "gopro"],
      ["2014-02-21", "PS B", "zoom"],
      ["2014-02-21", "PS C", "gopro"],
      ["2014-02-21", "PS C", "zoom"],
      ["2014-02-21", "PS F", "gopro"],
      ["2014-02-21", "PS F", "zoom"],
      // ["2014-02-21", "PS G", "gopro"],
      // ["2014-02-21", "PS G", "zoom"],
      // ["2014-02-21", "Unknown", "Unknown"]
    ];

    // const currentTime = new Date(this.state.masterTime);
    // const dateFormat = d3.timeFormat('%B %e, %Y (%a)');
    // const timeFormat = d3.timeFormat('%H:%M:%S');
    // const timeZoneFormat = d3.timeFormat('GMT%Z');

    return (
      <div style={{padding: 50, paddingBottom: 200}}>
        

        <div id="timeline-area">
          <div id="stream-controllers">
            {this.state.allStreams.length > 0 &&
            <StreamTimelineController
              allStreams = {this.state.allStreams}
              showMediaToggle = {this.showMediaToggle}
              muteMediaToggle = {this.muteMediaToggle}
              moveStreamUp = {this.moveStreamUp}
              moveStreamDown = {this.moveStreamDown}
              removeStream = {this.removeStream}
            />}
          </div>

          <div id="timelines">
            <div id="slider-value">
              <TimelineValueDisplay
                datetimeMS = {this.state.sliderRange.minTime}
                text = {"slider starts at..."}
                textColor = {"lightgrey"}
              />
              <TimelineValueDisplay
                datetimeMS = {this.state.masterTime}
                text = {"Current playback time:"}
                textColor = {"auto"}
              />
              <TimelineValueDisplay
                datetimeMS = {this.state.sliderRange.maxTime}
                text = {"slider ends at..."}
                textColor = {"lightgrey"}
              />
            </div>
            {/* <div id="slider-value">
              <u><b>Current playback time:</b></u><span>{this.state.masterTime !== 0 && 
              <div>
                {dateFormat(currentTime)}
                <br/>
                <strong>{timeFormat(currentTime)}</strong>
                <br/>
                {timeZoneFormat(currentTime)}
              </div> 
            }</span>
            </div> */}
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
          
          
          
          <div id="playback-controller">
            <label>Playback speed multiplier: </label>
            <input 
              type="number" 
              min="0.25"
              style={{width: 50}}
              id="speed-multiplier" 
              // name="speed-multiplier" 
              value={this.state.playbackSpeed} 
              disabled={this.state.playing}
              onChange={this.handlePlaybackSpeedChange}/>
            <button disabled={this.state.playing} onClick={() => {this.startPlayback(0)}}>start playback</button>
            <button disabled={!this.state.playing} onClick={this.stopPlayback}>stop playback</button>
            
          </div>
        </div>


          {/* {this.state.focusStream !== null && this.state.allStreams.length !== 0 && 
            <div style={{width: '800px'}}>
              {this.state.allStreams[this.state.focusStream].stream.getMediaAtTime(this.state.masterTime) === null && this.state.allStreams[this.state.focusStream].showMedia 
                && 
                <div className="no-media no-source" style={{width: '800px', height: '440px'}}>
                  <i>no media to display</i>
                </div>}
              { (this.state.allStreams[this.state.focusStream].stream.getMediaAtTime(this.state.masterTime) === null || this.state.allStreams[this.state.focusStream] !== null) && !this.state.allStreams[this.state.focusStream].showMedia 
                && 
                <div className="no-media hidden-media" style={{width: '800px', height: '440px'}}>
                  <i>media is hidden by user</i>
                </div>}
              {this.state.allStreams[this.state.focusStream].stream.getMediaAtTime(this.state.masterTime) !== null && this.state.allStreams[this.state.focusStream].showMedia 
                && <VideoAudioHandler
                      key = {this.state.allStreams[this.state.focusStream].uniqueId.toString() + "-focus"}
                      keyID = {this.state.allStreams[this.state.focusStream].uniqueId + 1}
                      media = {this.state.allStreams[this.state.focusStream].stream.getMediaAtTime(this.state.masterTime)}
                      url = {rootDir + this.state.allStreams[this.state.focusStream].stream.getMediaAtTime(this.state.masterTime).getSource()}
                      masterTime = {this.state.masterTime}
                      updateMasterTime = {this.updateMasterTime}
                      playing = {this.state.playing}
                      muteMedia = {this.state.allStreams[this.state.focusStream].muteMedia}
                      playbackSpeed = {this.state.playbackSpeed}
                      audioContext = {this.state.audioContext}
                    /> }
            </div>
          } */}
        

        <div id="media-container">
          {this.state.focusStream !== null &&
            <this.FocusStream/>
          }
          {this.state.allStreams.map( (thisChannel: StreamChannel, index: number) => {
            return (
              <React.Fragment>
                <StreamManager
                  key = {thisChannel.uniqueId.toString()}
                  stream = {thisChannel}
                  masterTime = {this.state.masterTime}
                  updateMasterTime = {this.updateMasterTime}
                  playing = {this.state.playing}
                  showFileInDir = {this.showFileInDir}
                  playbackSpeed = {this.state.playbackSpeed}
                  audioContext = {this.state.audioContext}
                />
                
              </React.Fragment>
            )
          })}
        </div>

        
        <div style={{position: 'fixed', bottom: 0, right: 0, backgroundColor: 'lightblue', opacity: 0.7}}> 
          <h4>Sample inputs</h4>
          <ul>
          {allGroupings2.map((g) => 
            <li><button onClick={(e) => {
              this.addStream(g[0], g[1], g[2]);
              e.currentTarget.disabled = true;
              }
            }>{g.toString()}</button></li>
            )}
          </ul>

        </div>
        
        <QueryController
          allStreams = {this.state.allStreams}
          masterTime = {this.state.masterTime}
          updateMasterTime = {this.updateMasterTime}
          playing = {this.state.playing}
          showFileInDir = {this.showFileInDir}
          playbackSpeed = {this.state.playbackSpeed}
          audioContext = {this.state.audioContext}
        />

      </div>
    );
  }
}

export default App
