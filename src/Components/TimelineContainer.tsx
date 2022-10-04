// Libraries
import React, { Component } from 'react';
import * as d3 from 'd3';

// Class objects
import Media from '../Classes/Media';
import Stream from '../Classes/Stream';

// Components
import MainSlider from './MainSlider';
import StreamTimelines from './StreamTimelines';
import StreamTimelineController from './StreamTimelineController';
import TimelineValueDisplay from './TimelineValueDisplay';

interface IProps {
  allStreams:       Array<StreamChannel>
  showMediaToggle:  (streamID: number) => void
  muteMediaToggle:  (streamID: number) => void
  moveStreamUp:     (index: number) => void
  moveStreamDown:   (index: number) => void
  removeStream:     (streamIDs: number[]) => void
  focusStream:      number
  setFocusStream:   (index: number) => void
  sliderRange: {
    minTime:        number
    maxTime:        number
  },
  masterTime:       number
  updateMasterTime: (t: number) => void
}

interface IState {
}

interface StreamChannel {
  uniqueId:       any,
  stream:         Stream,
  timelineInput:  StreamTimeline,
  playerRef:      HTMLInputElement,
  showMedia:      boolean,
  muteMedia:      boolean,
  gainValue:      number,
  pannerValue:    number
}

interface Channel {
  streamID:       number,
  channelOrder:   number,
  timelineInput:  StreamTimeline,
  playerRef:      HTMLInputElement, //TO DELETE
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

class TimelineContainer extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);
    this.state = {  

    }
  }


  render() { 

    return (
      <>
          
        <div id="stream-controllers">
          {this.props.allStreams.length > 0 &&
          <StreamTimelineController
            allStreams = {this.props.allStreams}
            showMediaToggle = {this.props.showMediaToggle}
            muteMediaToggle = {this.props.muteMediaToggle}
            moveStreamUp = {this.props.moveStreamUp}
            moveStreamDown = {this.props.moveStreamDown}
            removeStream = {this.props.removeStream}
            focusStream = {this.props.focusStream}
            setFocusStream = {this.props.setFocusStream}
          />
          }
        </div>

        <div id="timelines">
          <div id="slider-value">
            <TimelineValueDisplay
              datetimeMS = {this.props.sliderRange.minTime}
              text = {"slider starts at..."}
              textColor = {"auto"}
            />
            <TimelineValueDisplay
              datetimeMS = {this.props.masterTime}
              text = {"Current playback time:"}
              textColor = {"auto"}
            />
            <TimelineValueDisplay
              datetimeMS = {this.props.sliderRange.maxTime}
              text = {"slider ends at..."}
              textColor = {"auto"}
            />
          </div>

          <MainSlider
            sliderRange = {this.props.sliderRange}
            masterTime = {this.props.masterTime}
            updateMasterTime = {this.props.updateMasterTime}
          />

          <StreamTimelines
            sliderRange = {this.props.sliderRange}
            allStreams = {this.props.allStreams}
            masterTime = {this.props.masterTime}
          />
        </div>
        
          
          
      </>
    );
  }
}
 
export default TimelineContainer;