// Libraries
import React, { Component } from 'react';
import * as d3 from 'd3';

interface IProps {
  datetimeMS:     number
  text:           string
  textColor:      string
}

interface IState {
  datetimeMS:   number
  datetime:     Date
}


/////////////////////////////////////////////////////////////

class TimelineValueDisplay extends Component<IProps, IState> {
  dateFormat: (date: Date) => string;
  hourFormat: (date: Date) => string;
  timeZoneFormat: (date: Date) => string;
  constructor(props: IProps) {
    super(props);
    this.state = {  
      datetimeMS: 0,
      datetime: null
    }
    this.dateFormat = d3.timeFormat('%B %e, %Y (%a)');
    this.hourFormat = d3.timeFormat('%H:%M:%S');
    this.timeZoneFormat = d3.timeFormat('GMT%Z');
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
    const zeroTime: boolean = (this.props.datetimeMS === 0) || (this.props.datetimeMS === null)

    return (
      <div className="slider-value-display" style={{'color': this.props.textColor}}>
        <u><b>{this.props.text}</b></u>
        <br/>
        {!zeroTime && this.dateFormat(this.state.datetime)}
        <br/>
        <strong>{!zeroTime && this.hourFormat(this.state.datetime)}</strong>
        <br/>
        {!zeroTime && this.timeZoneFormat(this.state.datetime)}
      </div>
    );
  }
}
 
export default TimelineValueDisplay;