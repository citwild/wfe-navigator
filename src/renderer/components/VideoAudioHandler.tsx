//@ts-nocheck

// Libraries
import React, { Component } from 'react';
import ReactPlayer from 'react-player';

// Class objects
import Media from '../classes/Media';


interface IProps {
  keyID:            any
  media:            Media
  url:              string
  masterTime:       number
  updateMasterTime: (t: number) => void
  playing:          boolean
  playbackSpeed:    number
  muteMedia:        boolean
  audioContext:     AudioContext
  gainNode:         GainNode
  isFocus:          boolean
  mediaDir:         string
}

interface IState {}

/////////////////////////////////////////////////////////////

class VideoAudioHandler extends Component<IProps, IState> {
  playerRef: React.RefObject<unknown>;
  audioSource: MediaElementAudioSourceNode; 
  prevMasterTime: number;
  constructor(props: IProps) {
    super(props);
    this.playerRef = React.createRef();
    this.audioSource = null;
    this.prevMasterTime = this.props.masterTime;
  }

  componentDidMount(): void {
    this.syncWithMasterTime();
  }

  componentDidUpdate(): void {
    if (Math.abs(this.prevMasterTime - this.props.masterTime) > (1.5 * 1000 * this.props.playbackSpeed)) {
      // 1.5 = margin of error
      // (1000)*(speed) = step in ms for each progress interval
      this.syncWithMasterTime();
    }
    this.prevMasterTime = this.props.masterTime; 
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
    if (!this.props.isFocus && this.audioSource === null) {
      let audioCxt = this.props.audioContext;
      const sourceType = this.props.media.mediaType;
      // select the HTMLMediaElement to create a MediaElementAudioSourceNode
      const thisAudioSource = document.querySelector('#player-' + this.props.keyID + ' > div.react-player > ' + sourceType);
      this.audioSource = audioCxt.createMediaElementSource(thisAudioSource);

      // connect the AudioSourceNode to the gainNode passed from StreamManager
      this.audioSource.connect(this.props.gainNode);
    }
    
  }
  
  render() { 
    return (
      <div id={"player-" + this.props.keyID}>
        {this.props.media.mediaType === 'Audio' && <img className="speaker_img" src="speaker_icon.svg" alt="audio visuals"></img>}
        <ReactPlayer
          ref={this.ref}
          className='react-player'
          width='100%'
          height='100%'
          url={this.props.mediaDir + this.props.media.getSource()}
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