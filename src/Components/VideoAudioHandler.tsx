//@ts-nocheck

// Libraries
import React, { Component } from 'react';
import ReactPlayer from 'react-player';

// Class objects
import Media from '../Classes/Media';

const rootDir = "C:/Users/Irene/Desktop/BeamCoffer/";


interface IProps {
  keyID:            number
  media:            Media
  url:              string
  masterTime:       number
  updateMasterTime: (t: number) => void
  playing:          boolean
  playbackSpeed:    number
  muteMedia:        boolean
  audioContext:     AudioContext
  gainNode:         GainNode
}

interface IState {
  previousMasterTime: number
}

/////////////////////////////////////////////////////////////

class VideoAudioHandler extends Component<IProps, IState> {
  playerRef: React.RefObject<unknown>;
  audioSource: MediaElementAudioSourceNode;
  constructor(props: IProps) {
    super(props);
    this.state = {
      previousMasterTime: 0,
    }
    this.playerRef = React.createRef();
    this.audioSource = null;
  }

  componentDidMount(): void {
    this.syncWithMasterTime();
    this.setState({ previousMasterTime: this.props.masterTime });
  }

  componentDidUpdate(): void {
    if (Math.abs(this.state.previousMasterTime - this.props.masterTime) > 2000) {
      this.setState({ previousMasterTime: this.props.masterTime });
      this.syncWithMasterTime();
    }
  }

  componentWillUnmount(): void {
    if (this.audioSource)  {
      this.audioSource.disconnect();
    }
  }

  handlePause = (e: Event) => {
    console.log('onPause')
    // this.syncWithMasterTime();
  }

  syncWithMasterTime = () => {
    this.playerRef.seekTo(this.findSeekPosition(), "seconds");
  }

  findSeekPosition = () => {
    // this.props.media is never NULL 
    var msFromStart = this.props.masterTime - this.props.media.startTime;
    // console.log({msFromStart});
    return msFromStart / 1000;
  }

  handleProgress = state => {
    console.table(state);
  }

  ref = (player: any) => {
    this.playerRef = player
  }

  connectWebAudioAPI = () => {
    let audioCxt = this.props.audioContext;
    // Create a MediaElementAudioSourceNode
    // Feed the HTMLMediaElement into it\
    const sourceType = this.props.media.mediaType;
    if (this.audioSource == null) {
      const thisAudioSource = document.querySelector('#player-' + this.props.keyID + ' > div.react-player > ' + sourceType);
      this.audioSource = audioCxt.createMediaElementSource(thisAudioSource);
      // connect the AudioSourceNode to the gainNode passed from StreamManager
      this.audioSource.connect(this.props.gainNode);
    }
  }
  
  render() { 
    return (
      <div id={"player-" + this.props.keyID}>
        {this.props.media.mediaType === 'Audio' && <img className="speaker_img" src="speaker_icon.svg"></img>}
        <ReactPlayer
          ref={this.ref}
          className='react-player'
          width='100%'
          height='100%'
          url={rootDir + this.props.media.getSource()}
          playing={this.props.playing}
          playbackRate={this.props.playbackSpeed}
          muted={this.props.muteMedia}
          onLoadedData={this.connectWebAudioAPI}
          onPause={this.handlePause}
          // onReady={() => {console.log('onReady')}}
          // onPlay={() => console.log('onPlay')}
          // onProgress={this.handleProgress}
          // onSeek={e => console.log('onSeek', e)}
          onStart={() => console.warn("FILE " + this.props.media.getName() + " Started")}
          onEnded={() => console.warn("FILE " + this.props.media.getName() + " Ended")}
          onError={e => console.log('onError', e)}
        />
      </div>
    );
  }
}
 
export default VideoAudioHandler;