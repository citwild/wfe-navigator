// Libraries
import React, { Component } from 'react';

// Components
import VideoHandler from './VideoHandler';
import AudioHandler from './AudioHandler';

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
  audioContext:     any
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
  muteMedia:      boolean
}

type StreamTimeline = { times: Array<TimeSegment> }
type TimeSegment = {
  starting_time:  number,
  ending_time:    number
}

/////////////////////////////////////////////////////////////

class StreamManager extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {  
      mediaAtMasterTime: null
      // playing: false
    }
  }
  
  componentDidUpdate() {
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


  render() { 
    return (
      <div className='player-wrapper'>
    
        {this.state.mediaAtMasterTime === null && this.props.stream.showMedia 
          && <this.NoMedia/>}
        { (this.state.mediaAtMasterTime === null || this.state.mediaAtMasterTime !== null) && !this.props.stream.showMedia 
          && <this.HiddenMedia/>}
        {this.state.mediaAtMasterTime !== null && this.props.stream.showMedia 
          && <AudioHandler
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
              /> }

        <div><b>{this.props.stream.stream.getLocation()}</b> {this.state.mediaAtMasterTime !== null && this.props.stream.showMedia && this.state.mediaAtMasterTime.name}</div>
        
      </div>
    );
  }
}
 
export default StreamManager;