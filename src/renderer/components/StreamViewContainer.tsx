// Libraries
import React, { Component } from 'react';
import * as d3 from 'd3';

// Components
import StreamManager from './StreamManager';

// Class objects
import Media from '../classes/Media';
import Stream from '../classes/Stream';

// Interfaces & Types
import { StreamChannel } from './interfaces/StreamChannel.interface';

interface IProps {
  allStreams:       StreamChannel[]
  masterTime:       number
  updateMasterTime: (t: number) => void
  playing:          boolean
  playbackSpeed:    number
  showFileInDir:    any
  audioContext:     AudioContext
  updateGainValue:  (streamID: number, g: number) => void
  updatePannerValue:(streamID: number, p: number) => void
  focusStream:      number
  resetFocusStream: any
  mediaDir:         string
}

interface IState {
}

/////////////////////////////////////////////////////////////

class StreamViewContainer extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);
    this.state = {  

    }
  }


  render() { 
    return (
      <>
      <div id="focus-area">
        {this.props.focusStream !== null && 
          <div id="focus-Stream">
            <StreamManager
              key = {"focus-stream"}
              stream = {this.props.allStreams[this.props.focusStream]}
              masterTime = {this.props.masterTime}
              updateMasterTime = {this.props.updateMasterTime}
              playing = {this.props.playing}
              showFileInDir = {this.props.showFileInDir}
              playbackSpeed = {this.props.playbackSpeed}
              audioContext = {this.props.audioContext}
              updateGainValue = {this.props.updateGainValue}
              updatePannerValue = {this.props.updatePannerValue}
              isFocus = {true}
              mediaDir = {this.props.mediaDir}
            />
            <div><button onClick={this.props.resetFocusStream}>unfocus</button></div>
          </div>
        }
      </div>
      
      
      <div id="stream-view-area">
        
        {this.props.allStreams.map( (thisChannel: StreamChannel, index: number) => {
          return (
            <>
              <StreamManager
                key = {thisChannel.uniqueId}
                stream = {thisChannel}
                masterTime = {this.props.masterTime}
                updateMasterTime = {this.props.updateMasterTime}
                playing = {this.props.playing}
                showFileInDir = {this.props.showFileInDir}
                playbackSpeed = {this.props.playbackSpeed}
                audioContext = {this.props.audioContext}
                updateGainValue = {this.props.updateGainValue}
                updatePannerValue = {this.props.updatePannerValue}
                isFocus = {false}
                mediaDir = {this.props.mediaDir}
              />
            </>
          )
        })}
      </div>



      </>

    );
  }
}
 
export default StreamViewContainer;