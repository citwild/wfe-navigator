// Libraries
import React, { Component } from 'react';

// Components
import VideoAudioHandler from './VideoAudioHandler';
import AudioController from './AudioController';

// Class objects
import Media from '../Classes/Media';
import Stream from '../Classes/Stream';

const rootDir = "C:/Users/Irene/Desktop/BeamCoffer/";

interface IProps {
  stream:           StreamChannel,
  masterTime:       number,
  updateMasterTime: any,
  playing:          boolean,
  playbackSpeed:    number,
  showFileInDir:    any,
  audioContext:     any,
  updateGainValue:  any,
  updatePannerValue:any,
  isFocus:          boolean
}

interface IState {
  mediaAtMasterTime:  Media
  // playing:            boolean
}

interface StreamChannel {
  uniqueId:       number,
  stream:         Stream,
  timelineInput:  StreamTimeline,
  playerRef:      HTMLInputElement,
  showMedia:      boolean,
  muteMedia:      boolean,
  gainValue:      number,
  pannerValue:    number
}

type StreamTimeline = { times: Array<TimeSegment> }
type TimeSegment = {
  starting_time:  number,
  ending_time:    number
}

/////////////////////////////////////////////////////////////

class StreamManager extends Component<IProps, IState> {
  pannerNode: any;
  gainNode: any;
  constructor(props: IProps) {
    super(props);
    this.state = {  
      mediaAtMasterTime: null
    }
    this.pannerNode = null;
    this.gainNode = null;
  }
  
  componentDidMount(): void {
    const audioCxt = this.props.audioContext;
    this.gainNode = audioCxt.createGain();
    this.pannerNode = audioCxt.createStereoPanner();
    this.gainNode.connect(this.pannerNode);
    this.pannerNode.connect(audioCxt.destination);
  }

  componentWillUnmount(): void {
    this.pannerNode.disconnect();
    this.gainNode.disconnect();
  }

  NoMedia = (): React.ReactElement => {
    return (
      <div className="no-media no-source">
        <i>no media to display</i>
      </div>
    );
  }

  HiddenMedia = (): React.ReactElement => {
    return (
      <div className="no-media hidden-media">
        <i>media is hidden by user</i>
      </div>
    );
  }

  static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
    var sourceAtNewMasterTime: Media = nextProps.stream.stream.getMediaAtTime(nextProps.masterTime);

    if(sourceAtNewMasterTime !== null) {
      return {
        mediaAtMasterTime: sourceAtNewMasterTime
      };
    } else {
      return {
        mediaAtMasterTime: null
      };
    }
  }

  updatePannerControl = (newValue: number) => {
    this.pannerNode.pan.value = newValue;
    this.props.updatePannerValue(this.props.stream.uniqueId, newValue);
  }

  updateGainControl = (newValue: number) => {
    this.gainNode.gain.value = newValue;
    this.props.updateGainValue(this.props.stream.uniqueId, newValue);
  }

  render() { 
    return (
      <>
      <div className='player-wrapper'>
        <div><b>{this.props.stream.stream.getLocation()}</b></div>

        {this.props.stream.showMedia ? 
          this.state.mediaAtMasterTime !== null ?
          <>
            <VideoAudioHandler
              key = {this.props.stream.uniqueId}
              keyID = {this.props.stream.uniqueId}
              media = {this.state.mediaAtMasterTime}
              url = {rootDir + this.state.mediaAtMasterTime.getSource()}
              masterTime = {this.props.masterTime}
              updateMasterTime = {this.props.updateMasterTime}
              playing = {this.props.playing}
              muteMedia = {this.props.stream.muteMedia}
              playbackSpeed = {this.props.playbackSpeed}
              audioContext = {this.props.audioContext}
              gainNode = {this.gainNode}
            />
            {!this.props.isFocus && 
              <AudioController
                key = {this.props.stream.uniqueId + "-audio-controls"}
                keyID = {this.props.stream.uniqueId}
                muteMedia = {this.props.isFocus ? true : this.props.stream.muteMedia}
                gainValue = {this.props.stream.gainValue}
                pannerValue = {this.props.stream.pannerValue}
                updateGainControl = {this.updateGainControl}
                updatePannerControl = {this.updatePannerControl}
              />
            }
          </>
            : <this.NoMedia/>
          : <this.HiddenMedia/>  
        }


      </div>
    </>
    );
  }
}
 
export default StreamManager;