// Libraries
import React, { Component } from 'react';
import * as d3 from 'd3';
// Components


// Class objects
import Media from '../Classes/Media';
import Stream from '../Classes/Stream';

const rootDir = "C:/Users/Irene/Desktop/BeamCoffer/";

interface IProps {
  datetimeMS:     number
  text:           string
  textColor:      string
}

interface IState {
  datetimeMS:   number
  datetime:     Date
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

class TimelineValueDisplay extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {  
      datetimeMS: 0,
      datetime: null
    }
  }

  
  static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
    if(nextProps.datetimeMS !== prevState.datetimeMS) {
      return {
        datetimeMS: nextProps.datetimeMS,
        datetime: new Date(nextProps.datetimeMS)
      };
    } else {
      return null;
    }
  }


  render() { 
    const dateFormat = d3.timeFormat('%B %e, %Y (%a)');
    const timeFormat = d3.timeFormat('%H:%M:%S');
    const timeZoneFormat = d3.timeFormat('GMT%Z');

    const zeroTime: boolean = (this.props.datetimeMS === 0) || (this.props.datetimeMS === null)

    return (
      <div className="slider-value-display" style={{'color': this.props.textColor}}>
        <u><b>{this.props.text}</b></u>
        <br/>
        {!zeroTime && dateFormat(this.state.datetime)}
        <br/>
        <strong>{!zeroTime && timeFormat(this.state.datetime)}</strong>
        <br/>
        {!zeroTime && timeZoneFormat(this.state.datetime)}
      </div>
    );
  }
}
 
export default TimelineValueDisplay;