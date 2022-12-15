/* eslint-disable react/destructuring-assignment */
// Libraries
import React, { Component } from 'react';

// Components
import VideoAudioHandler from './VideoAudioHandler';
import AudioController from './AudioController';

// Class objects
import Media from '../classes/Media';
import Stream from '../classes/Stream';

// Interfaces & Types
import { StreamChannel } from './interfaces/StreamChannel.interface';

interface IProps {
  stream: StreamChannel;
  masterTime: number;
  updateMasterTime: (t: number) => void;
  playing: boolean;
  playbackSpeed: number;
  showFileInDir: any;
  audioContext: AudioContext;
  updateGainValue: (streamID: number, g: number) => void;
  updatePannerValue: (streamID: number, p: number) => void;
  isFocus: boolean;
  mediaDir: string;
}

interface IState {
  mediaAtMasterTime: Media | null;
}


/// //////////////////////////////////////////////////////////

class StreamManager extends Component<IProps, IState> {
  pannerNode: StereoPannerNode | null;

  gainNode: GainNode | null;

  constructor(props: IProps) {
    super(props);
    this.state = {
      mediaAtMasterTime: null,
    };
    this.pannerNode = null;
    this.gainNode = null;
  }

  componentDidMount(): void {
    const audioCxt = this.props.audioContext;
    this.gainNode = audioCxt.createGain();
    this.pannerNode = audioCxt.createStereoPanner();
    this.gainNode.connect(this.pannerNode).connect(audioCxt.destination);
  }

  componentWillUnmount(): void {
    this.pannerNode.disconnect();
    this.gainNode.disconnect();
  }

  static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
    const sourceAtNewMasterTime: Media = nextProps.stream.stream.getMediaAtTime(
      nextProps.masterTime
    );

    if (sourceAtNewMasterTime !== null) {
      return {
        mediaAtMasterTime: sourceAtNewMasterTime,
      };
    }
    return {
      mediaAtMasterTime: null,
    };
  }

  NoMedia = (): React.ReactElement => {
    return (
      <div className="no-media">
        <i>no media to display</i>
      </div>
    );
  };

  HiddenMedia = (): React.ReactElement => {
    return (
      <div className="no-media hidden-media">
        <i>media is hidden by user</i>
      </div>
    );
  };

  updatePannerControl = (newValue: number) => {
    this.pannerNode.pan.value = newValue;
    this.props.updatePannerValue(this.props.stream.uniqueId, newValue);
  };

  updateGainControl = (newValue: number) => {
    this.gainNode.gain.value = newValue;
    this.props.updateGainValue(this.props.stream.uniqueId, newValue);
  };

  render() {
    return (
      <>
        <div
          className={
            this.props.isFocus ? 'focus-player-wrapper' : 'player-wrapper'
          }
        >
          <div>
            <b>{this.props.stream.stream.getLocation()}</b>
          </div>

          {this.props.stream.showMedia ? (
            this.state.mediaAtMasterTime !== null ? (
              <>
                <VideoAudioHandler
                  key={this.props.stream.uniqueId}
                  keyID={this.props.stream.uniqueId}
                  media={this.state.mediaAtMasterTime}
                  url={
                    this.props.mediaDir +
                    this.state.mediaAtMasterTime.getSource()
                  }
                  masterTime={this.props.masterTime}
                  updateMasterTime={this.props.updateMasterTime}
                  playing={this.props.playing}
                  muteMedia={this.props.stream.muteMedia}
                  playbackSpeed={this.props.playbackSpeed}
                  audioContext={this.props.audioContext}
                  gainNode={this.gainNode}
                  isFocus={this.props.isFocus}
                  mediaDir={this.props.mediaDir}
                />
                {!this.props.isFocus && (
                  <AudioController
                    key={`${this.props.stream.uniqueId}-audio-controls`}
                    keyID={this.props.stream.uniqueId}
                    muteMedia={
                      this.props.isFocus ? true : this.props.stream.muteMedia
                    }
                    gainValue={this.props.stream.gainValue}
                    pannerValue={this.props.stream.pannerValue}
                    updateGainControl={this.updateGainControl}
                    updatePannerControl={this.updatePannerControl}
                  />
                )}
              </>
            ) : (
              <this.NoMedia />
            )
          ) : (
            <this.HiddenMedia />
          )}
        </div>
      </>
    );
  }
}

export default StreamManager;
