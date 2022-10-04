// Libraries
import React, { Component } from 'react';
import * as d3 from 'd3';

// Components
import StreamManager from './StreamManager';

// Class objects
import Media from '../Classes/Media';
import Stream from '../Classes/Stream';

interface IProps {
  allStreams:           StreamChannel[]
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
}

interface IState {
}

interface StreamChannel {
  uniqueId:       any
  stream:         Stream
  timelineInput:  StreamTimeline
  playerRef:      HTMLInputElement
  showMedia:      boolean
  muteMedia:      boolean
  gainValue:      number
  pannerValue:    number
}

type StreamTimeline = { times: Array<TimeSegment> }
type TimeSegment = {
  starting_time:  number,
  ending_time:    number
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