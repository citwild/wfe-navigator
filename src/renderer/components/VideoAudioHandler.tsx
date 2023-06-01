/* eslint-disable prefer-template */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable prettier/prettier */
// @ts-nocheck


// Libraries
import React, { Component } from 'react';
import ReactPlayer from 'react-player';

// Class objects
import Media from '../classes/Media';

import speaker_img from "../Speaker_Icon.png"


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

interface IState {
  fileError:     boolean
  fileNotFound:  boolean
}

/////////////////////////////////////////////////////////////

class VideoAudioHandler extends Component<IProps, IState> {
  playerRef: React.RefObject<unknown>;
  audioSource: MediaElementAudioSourceNode;
  prevMasterTime: number;
  constructor(props: IProps) {
    super(props);
    this.state = {
      fileError: false,
      fileNotFound: false,
    }

    this.playerRef = React.createRef();
    this.audioSource = null;
    this.prevMasterTime = this.props.masterTime;
  }


  componentDidMount(): void {
    this.syncWithMasterTime();
  }



  componentDidUpdate(): void {
    // the player will continue to play even if the elapsed time is not exactly
    // correct but still within the margin of error
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

  // checkFileExist = (): boolean => {
  //   // @ts-expect-error
  //   const fc = window.api.sendSync('getMediaFileConfig');
  // }

  handlePause = (e: Event) => {
    console.log('onPause')
    // this.syncWithMasterTime();
  }

  // sync the media player to masterTime
  // usually used when playback is completed or user jumps to different times
  syncWithMasterTime = () => {
    this.playerRef.seekTo(this.findSeekPosition(), "seconds");
  }

  // find elapsed time of the Media Object based on masterTime
  findSeekPosition = () => {
    // this.props.media is never NULL
    const msFromStart = this.props.masterTime - this.props.media.startTime;
    // console.log({msFromStart});
    return msFromStart / 1000;
  }

  handleProgress = state => {
    console.table(state);
  }

  // store a reference to this player
  ref = (player: any) => {
    this.playerRef = player;
  }

  // creates MediaElementAudioSourceNode with the passed Media OBJECT as the source
  // then connects the source to gainNode
  connectWebAudioAPI = () => {
    if (!this.props.isFocus && this.audioSource === null) {
      let audioCxt = this.props.audioContext;
      const sourceType = this.props.media.mediaType;
      // select the HTMLMediaElement to create a MediaElementAudioSourceNode
      const thisAudioSource = document.querySelector('#player-' + this.props.keyID + ' > div.react-player > ' + sourceType);
      this.audioSource = audioCxt.createMediaElementSource(thisAudioSource);

      // connect the AudioSourceNode to the gainNode passed from StreamManager
      console.log(this.audioSource);

      this.audioSource.connect(this.props.gainNode);
    }
  }

  handleError = (e) => {
    console.log('onError', e);
    // const noFileMessage = document.querySelector("#player-" + this.props.keyID + " > div.no-file");
    // console.log(noFileMessage);
    // noFileMessage.setAttribute('display', 'block');

     // @ts-expect-error
    const fileExists = window.api.sendSync('doesFileExist', this.props.mediaDir + this.props.media.getSource());
    if (fileExists) {
      this.setState({
        fileNotFound: false,
        fileError: true
      });
    } else {
      this.setState({
        fileNotFound: true,
        fileError: false
      });
    }

  }

  resetErrorHandling = () => {
    this.setState({
      fileNotFound: false,
      fileError: false
    });
  }

  render() {
    return (
      <div id={"player-" + this.props.keyID} className="player-container">
        {this.props.media.mediaType === 'Audio' && <div className="speaker_img"><img src={speaker_img} style={{opacity: '0.5', height: '100%'}} alt="audio visuals" /></div>}
        {this.state.fileError && <div className="no-file no-source">error loading file</div>}
        {this.state.fileNotFound && <div className="no-file no-source">file not found</div>}
        <ReactPlayer
          ref={this.ref}
          className='react-player'
          width='100%'
          height='100%'
          url={this.props.mediaDir + this.props.media.getSource()}
          playing={this.props.playing}
          playbackRate={this.props.playbackSpeed}
          // onPlaybackRateChange={this.resetErrorHandling}
          muted={this.props.muteMedia}
          onLoadStart={this.resetErrorHandling}
          onLoadedData={this.connectWebAudioAPI}
          onPause={this.handlePause}
          // onReady={() => {console.log('onReady')}}
          // onPlay={() => console.log('onPlay')}
          // onProgress={this.handleProgress}
          // onSeek={e => console.log('onSeek', e)}
          onStart={() => console.warn("FILE " + this.props.media.getName() + " Started")}
          onEnded={() => console.warn("FILE " + this.props.media.getName() + " Ended")}
          onError={this.handleError}
        />
      </div>
    );
  }
}

export default VideoAudioHandler;
