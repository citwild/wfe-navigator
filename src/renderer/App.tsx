/* eslint-disable react/destructuring-assignment */
// Libraries
import React, { Component } from 'react';
import * as d3 from 'd3';

// Styling
import './App.css';

// Class objects
import Media from './classes/Media';
import Stream from './classes/Stream';

// Components
import TimelineContainer from './components/TimelineContainer';
import StreamViewContainer from './components/StreamViewContainer';
import QueryController from './components/QueryController';

// Interfaces & Types
import { Channel } from './interfaces/Channel.interface';
import { StreamChannel } from './interfaces/StreamChannel.interface';
import { StreamTimeline } from './interfaces/StreamTimeline.type';

interface IState {
  dbConfig: any;
  sliderRange: {
    minTime: number | null;
    maxTime: number | null;
  };
  masterTime: number;
  playing: boolean;
  playbackSpeed: number;
  allStreams: Array<StreamChannel>;
  streamsInView: Map<number, Stream>;
  channelOrder: number[];
  channelSettings: Map<number, Channel>;
  focusStream: any;
}

/// //////////////////////////////////////////////////////////

class App extends Component<{}, IState> {
  playbackIntervalObject: ReturnType<typeof setInterval> | null;

  audioContext: AudioContext;

  mediaDir: string;

  // streamsInView: Map<number, Stream>;
  constructor() {
    super({});
    this.state = {
      // TODO: save to and load from JSON config file
      dbConfig: null,
      sliderRange: {
        minTime: null,
        maxTime: null,
      },
      masterTime: 0,
      playing: false,
      playbackSpeed: 1,
      allStreams: [],
      streamsInView: new Map<number, Stream>(),
      channelSettings: new Map<number, Channel>(),
      channelOrder: [],
      focusStream: null,
    };
    this.playbackIntervalObject = null;
    this.audioContext = new window.AudioContext();
    this.mediaDir = '';
    // this.streamsInView = new Map<number, Stream>();
  }

  componentDidMount() {
    // initialize some states from config file when applicable
    if (this.state.sliderRange.minTime !== null) {
      this.updateMasterTime(this.state.sliderRange.minTime);
    }
    // @ts-expect-error
    window.api.receive('mediaDir', (data) => {
      console.log(data);
      this.mediaDir = data;
    });
    // @ts-expect-error
    window.api.send('getMediaDir');
  }

  componentDidUpdate() {
    if (
      this.state.masterTime === 0 &&
      this.state.sliderRange.minTime !== null
    ) {
      this.updateMasterTime(this.state.sliderRange.minTime);
    }
  }

  startPlayback = (speedFactor: number): void => {
    // start repeating function to move scrubber line
    // by speedfactor*1sec(or 1000ms) per 1sec
    if (speedFactor === 0) {
      const factorFromState = this.state.playbackSpeed;
      this.playbackIntervalObject = setInterval(() => {
        this.firePlaybackEvent(factorFromState);
      }, 1000);
    } else {
      // in case of separate buttons with different speedFactor
      this.playbackIntervalObject = setInterval(() => {
        this.firePlaybackEvent(speedFactor);
      }, 1000);
    }
    this.setState({
      playing: true,
    });
  };

  firePlaybackEvent = (speedFactor: number): void => {
    this.updateMasterTime(this.state.masterTime + 1000 * speedFactor);
  };

  stopPlayback = (): void => {
    // clear the repeating function
    clearInterval(this.playbackIntervalObject);
    this.playbackIntervalObject = null;
    this.setState({
      playing: false,
    });
  };

  showMediaToggle = (streamID: number): void => {
    const newState = this.state.allStreams.map((eachStream) => {
      if (eachStream.uniqueId === streamID) {
        return { ...eachStream, showMedia: !eachStream.showMedia };
      }
      return eachStream;
    });
    this.setState({
      allStreams: newState,
    });
  };

  muteMediaToggle = (streamID: number): void => {
    const newState = this.state.allStreams.map((eachStream) => {
      if (eachStream.uniqueId === streamID) {
        return { ...eachStream, muteMedia: !eachStream.muteMedia };
      }
      return eachStream;
    });
    this.setState({
      allStreams: newState,
    });
  };

  addStream = (
    streamDate: string,
    streamLocation: string,
    streamEquipment: string
  ): void => {
    /// // TEMP path creator, based on COMPRESSED VERSION of files
    const pathConstruct: string[] = [streamDate];
    if (streamLocation !== 'Unknown') {
      pathConstruct.push(streamLocation);
    }
    if (streamEquipment !== 'Unknown') {
      pathConstruct.push(streamEquipment);
    }
    const path = `${pathConstruct.join('/')}/`;

    let fileSuffix = '';
    if (streamLocation === 'Huddle') {
      fileSuffix = '-320';
    } else if (streamEquipment === 'gopro') {
      fileSuffix = '-320';
    } else if (streamEquipment === 'zoom') {
      fileSuffix = '-128';
    }
    /// /////////////////////////////////////////////////////////
    console.log(path);
    const stream = new Stream(streamDate, streamLocation, streamEquipment);
    // @ts-expect-error
    window.api.receive('sendFiles', (data) => {
      // @ts-expect-error
      data.forEach((file) => {
        stream.addMedia(
          new Media(
            file.time_begin,
            file.time_end,
            `${path + file.file_name.split('.')[0] + fileSuffix}.${
              file.media_type === 'Video' ? file.file_ext : 'mp3'
            }`,
            file.file_name,
            file.nominal_date,
            file.location,
            file.equipment,
            file.media_type,
            file.media_id
          )
        );
      });
      // console.log({stream});
      const newStreamChannel: StreamChannel = {
        uniqueId: Date.now(),
        stream,
        timelineInput: this.transformStreamToTimelineFormat(stream),
        playerRef: null,
        showMedia: true,
        muteMedia: false,
        gainValue: 1,
        pannerValue: 0,
      };
      this.setState(
        {
          allStreams: [...this.state.allStreams, newStreamChannel],
        },
        () => {
          console.log(this.state.allStreams);
          this.updateMasterSliderRange();
        }
      );
    });
    // @ts-expect-error
    window.api.send('getFiles', [streamDate, streamLocation, streamEquipment]);
  };

  addNewStreamToStreamTimeline = (newStreamList: Stream[]) => {
    const channelsToAdd: StreamChannel[] = [];
    newStreamList.forEach((newStream) => {
      const newChannel: StreamChannel = {
        uniqueId: newStream.dbItemID,
        stream: newStream,
        timelineInput: this.transformStreamToTimelineFormat(newStream),
        playerRef: null,
        showMedia: true,
        muteMedia: false,
        gainValue: 1,
        pannerValue: 0,
      };
      channelsToAdd.push(newChannel);
    });
    // let newChannel: StreamChannel = {
    //   uniqueId:       newStream.dbItemID,
    //   stream:         newStream,
    //   timelineInput:  this.transformStreamToTimelineFormat(newStream),
    //   playerRef:      null,
    //   showMedia:      true,
    //   muteMedia:      false,
    //   gainValue:      1,
    //   pannerValue:    0
    // };
    this.setState(
      {
        allStreams: this.state.allStreams.concat(channelsToAdd),
      },
      () => {
        console.log(this.state.allStreams);
        this.updateMasterSliderRange();
      }
    );
  };

  removeStream = (streamIDs: number[]) => {
    // handle focusStream interaction with remove
    // if (this.state.focusStream !== null && index === this.state.focusStream) {
    //   this.setState({ focusStream: null });
    // } else if (this.state.focusStream !== null && index < this.state.focusStream) {
    //   this.setState( prevState => ({
    //     focusStream: prevState.focusStream - 1
    //   }));
    // }
    // about to delete the last one
    if (this.state.allStreams.length == 1) {
      this.stopPlayback();
      this.updateMasterTime(0);
      this.setState({
        sliderRange: {
          minTime: null,
          maxTime: null,
        },
        playing: false,
        allStreams: [],
      });
    } else {
      this.setState(
        (prevState) => ({
          allStreams: prevState.allStreams.filter(
            (thisStream) => !streamIDs.includes(thisStream.uniqueId)
          ),
        }),
        () => {
          this.updateMasterSliderRange();
        }
      );
    }
  };

  moveStreamUp = (streamIndex: number) => {
    if (streamIndex > 0) {
      // move up by one index
      const newAllStreams: StreamChannel[] = [];
      for (var i = 0; i < streamIndex - 1; i++) {
        newAllStreams.push(this.state.allStreams[i]);
      }
      newAllStreams.push(this.state.allStreams[streamIndex]);
      newAllStreams.push(this.state.allStreams[streamIndex - 1]);
      for (var i = streamIndex + 1; i < this.state.allStreams.length; i++) {
        newAllStreams.push(this.state.allStreams[i]);
      }
      this.setState({ allStreams: newAllStreams });

      // handler for moving streams adjacent to the focusStream
      if (
        this.state.focusStream !== null &&
        streamIndex === this.state.focusStream
      ) {
        this.setState((prevState) => ({
          focusStream: prevState.focusStream - 1,
        }));
      } else if (
        this.state.focusStream !== null &&
        streamIndex === this.state.focusStream + 1
      ) {
        this.setState((prevState) => ({
          focusStream: prevState.focusStream + 1,
        }));
      }
    }
  };

  moveStreamDown = (streamIndex: number) => {
    // if not the last in order
    if (streamIndex < this.state.allStreams.length - 1) {
      // move down by one index
      const newAllStreams: StreamChannel[] = [];
      for (var i = 0; i < streamIndex; i++) {
        newAllStreams.push(this.state.allStreams[i]);
      }
      newAllStreams.push(this.state.allStreams[streamIndex + 1]);
      newAllStreams.push(this.state.allStreams[streamIndex]);
      for (var i = streamIndex + 2; i < this.state.allStreams.length; i++) {
        newAllStreams.push(this.state.allStreams[i]);
      }
      this.setState({ allStreams: newAllStreams });
      // handler for moving streams adjacent to the focusStream
      if (streamIndex === this.state.focusStream) {
        this.setState((prevState) => ({
          focusStream: prevState.focusStream + 1,
        }));
      } else if (streamIndex === this.state.focusStream - 1) {
        this.setState((prevState) => ({
          focusStream: prevState.focusStream - 1,
        }));
      }
    }
  };

  // probably not needed
  showFileInDir = (filePath: string): void => {
    console.log(rootDir + filePath);
    // @ts-expect-error
    window.api.send('selectFileInDir', rootDir + filePath);
  };

  // MAY be able to pass this as props to StreamTimelines
  transformStreamToTimelineFormat = (thisStream: Stream): StreamTimeline => {
    const channel: StreamTimeline = {
      times: [],
    };
    thisStream.media.map((thisMedia) => {
      channel.times.push({
        starting_time: thisMedia.startTime,
        ending_time: thisMedia.endTime,
      });
    });
    return channel;
  };

  // execute every time a video is added
  updateMasterSliderRange = (): void => {
    const getAllMins: number[] = this.state.allStreams.map(
      (thisChannel: StreamChannel) => thisChannel.stream.getEarliestTime()
    );
    const getAllMaxs: number[] = this.state.allStreams.map(
      (thisChannel: StreamChannel) => thisChannel.stream.getLatestTime()
    );
    const newMin: number = d3.min(getAllMins);
    const newMax: number = d3.max(getAllMaxs);
    this.setState({
      sliderRange: {
        minTime: newMin,
        maxTime: newMax,
      },
    });
  };

  updateMasterTime = (newMasterTime: number): void => {
    // console.log(newMasterTime);
    if (this.state.sliderRange.minTime === null) {
      this.setState({
        masterTime: 0,
      });
    } else if (
      this.state.sliderRange.minTime !== null &&
      newMasterTime < this.state.sliderRange.minTime
    ) {
      this.stopPlayback();
      this.setState({
        masterTime: this.state.sliderRange.minTime,
      });
    } else if (
      this.state.sliderRange.maxTime !== null &&
      this.state.sliderRange.maxTime < newMasterTime
    ) {
      this.stopPlayback();
      this.setState({
        masterTime: this.state.sliderRange.maxTime,
      });
    } else {
      this.setState({
        masterTime: newMasterTime,
      });
    }
  };

  updateGainValue = (streamID: number, newGainValue: number) => {
    this.setState((prevState) => ({
      allStreams: prevState.allStreams.map((eachStream) => {
        if (eachStream.uniqueId === streamID) {
          return { ...eachStream, gainValue: newGainValue };
        }
        return eachStream;
      }),
    }));
  };

  updatePannerValue = (streamID: number, newPannerValue: number) => {
    this.setState((prevState) => ({
      allStreams: prevState.allStreams.map((eachStream) => {
        if (eachStream.uniqueId === streamID) {
          return { ...eachStream, pannerValue: newPannerValue };
        }
        return eachStream;
      }),
    }));
  };

  setFocusStream = (streamIndex: number) => {
    this.setState({ focusStream: streamIndex });
  };

  resetFocusStream = () => {
    this.setState({ focusStream: null });
  };

  handlePlaybackSpeedChange = (e: any) => {
    const newSpeed: number = e.target.value;
    this.setState({ playbackSpeed: newSpeed });
  };

  render() {
    // 1,000 ms = 1 sec
    // 60,000 ms = 1 min
    // 3,600,000 ms = 1 hr
    // 86,400,000 ms = 1 day
    
    return (
      <div style={{ padding: 50, paddingBottom: 200 }}>
        <div id="timeline-area">
          <TimelineContainer
            allStreams={this.state.allStreams}
            showMediaToggle={this.showMediaToggle}
            muteMediaToggle={this.muteMediaToggle}
            moveStreamUp={this.moveStreamUp}
            moveStreamDown={this.moveStreamDown}
            removeStream={this.removeStream}
            focusStream={this.state.focusStream}
            setFocusStream={this.setFocusStream}
            sliderRange={this.state.sliderRange}
            masterTime={this.state.masterTime}
            updateMasterTime={this.updateMasterTime}
          />
        </div>

        <div id="playback-controller">
          <label>Playback speed multiplier: </label>
          <input
            type="number"
            min="0.25"
            style={{ width: 50 }}
            id="speed-multiplier"
            value={this.state.playbackSpeed}
            disabled={this.state.playing}
            onChange={this.handlePlaybackSpeedChange}
          />
          <button
            disabled={this.state.playing || this.state.allStreams.length === 0}
            onClick={() => {
              this.startPlayback(0);
            }}
          >
            start playback
          </button>
          <button disabled={!this.state.playing} onClick={this.stopPlayback}>
            stop playback
          </button>
          <p>{this.state.allStreams.length} stream(s) in view</p>
        </div>

        <StreamViewContainer
          allStreams={this.state.allStreams}
          masterTime={this.state.masterTime}
          updateMasterTime={this.updateMasterTime}
          playing={this.state.playing}
          showFileInDir={this.showFileInDir}
          playbackSpeed={this.state.playbackSpeed}
          audioContext={this.audioContext}
          updateGainValue={this.updateGainValue}
          updatePannerValue={this.updatePannerValue}
          focusStream={this.state.focusStream}
          resetFocusStream={this.resetFocusStream}
          mediaDir = {this.mediaDir}
        />

        <div id="query-area">
          {this.state.dbConfig === null && (
            <QueryController
              allStreams={this.state.allStreams}
              dbConfig={this.state.dbConfig}
              addStream={this.addStream}
              removeStream={this.removeStream}
              addNewStreamToStreamTimeline={this.addNewStreamToStreamTimeline}
            />
          )}
        </div>
      </div>
    );
  }
}

export default App;
