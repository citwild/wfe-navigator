// Libraries
import React, { Component } from 'react';
import * as d3 from 'd3';
import timelines from '../lib/timelines.js'; //examples = https://codepen.io/manglass/pen/MvLBRz

// Class objects
import Stream from '../classes/Stream';

// Interfaces & Types
import { StreamChannel } from './interfaces/StreamChannel.interface';
import { StreamTimeline } from './interfaces/StreamTimeline.type';
import { TimeSegment } from './interfaces/TimeSegment.type';


interface IProps {
  sliderRange: {
    minTime: number
    maxTime: number
  },
  masterTime: number
  allStreams: StreamChannel[]
}

interface IState {
  allTimelineInput: Array<StreamTimeline>
}

/////////////////////////////////////////////////////////////

class StreamTimelines extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      allTimelineInput: new Array<StreamTimeline>()
    }
  }

  componentDidMount() {
    if (document.querySelector('div#stream-timelines > svg') != null) {
      d3.select('div#stream-timelines').selectAll('svg').remove();
    }

    this.createTimelines();
  }

  // FIX
  // currently deletes the entire timeline and redraws on every update to masterTime
  // should only update the changes in SVG
  componentDidUpdate() {
    if (document.querySelector('div#stream-timelines > svg') != null) {
      d3.select('div#stream-timelines').selectAll('svg').remove();
    }

    this.createTimelines();
  }


  createTimelines = (): void => {
    const itemHeight: number = 14;
    const itemMargin: number = 4;
    const itemColor: string = "lightpink";
    const backgroundColor: string = "#f2f2f2";
    const margin = {
      left: 20,
      right: 20,
      top: 0,
      bottom: 0
    };
    const svgWidth: number = 950;
    const svgHeight: number =
        this.state.allTimelineInput.length === 0
        ? 0
        : (this.state.allTimelineInput.length + 2) * (itemHeight + itemMargin);


    var xScale: any = d3.scaleLinear()
      .domain([this.props.sliderRange.minTime, this.props.sliderRange.maxTime])
      .range([margin.left, svgWidth - margin.right]);

    var chart: any = timelines()
      .stack()
      .orient("bottom")
      //@ts-expect-error
      .itemHeight(itemHeight)
      .itemMargin(itemMargin)
      .margin(margin)
      .colors(() => {return itemColor})
      .background(backgroundColor)
      .showTimeAxis()
      .hover((d: any, i: number, datum: any) =>  {
        const timeAtHover = xScale.invert(d.offsetX);
        var tooltip = document.getElementById('timeline-tooltip');
        tooltip.style.left  = d.clientX - tooltip.offsetWidth - 2 + "px";
        tooltip.style.top = d.clientY - tooltip.offsetHeight - 2 + "px";

        const mediaObj = this.props.allStreams[i].stream.getMediaAtTime(timeAtHover);
        const fileName = mediaObj === null ? "" : mediaObj.getName();
        d3.select('#timeline-tooltip')
          .text(fileName);

      });



    d3.select("#stream-timelines")
      .append("svg")
      // .attr("id", "timeline-svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight) //needs to make dynamic
      .datum(this.state.allTimelineInput)
      .call(chart)
      .append('rect')
      .classed("scrubber-line", true)
      .attr("width", 1)
      .attr("height", '100%')
      .attr('x', xScale(this.props.masterTime))
      .style('fill', "red");

    //Add indicator of currently playing media
    d3.selectAll("rect[id^='timelineItem']")
    .style("fill", (d: TimeSegment, index: number) => {
      if (this.props.masterTime >= d.starting_time && this.props.masterTime <= d.ending_time) {
        return "purple";
      }
      return itemColor;
    })
    .on("mouseenter", (d: any, i: number) => {
      d3.select('#timeline-tooltip').style('visibility', 'visible');
    })
    .on("mouseleave", (d: any, i: number) => {
      d3.select('#timeline-tooltip').style('visibility', 'hidden');
    });

    this.props.allStreams.forEach((thisStream: StreamChannel, index: number) => {
      if (!thisStream.showMedia) {
        d3.selectAll("rect.timelineSeries_" + index)
          .style("fill", "#999999");
      }
    });

  }


  // check for changes in stream in view
  // redraws if there are changes, do nothing otherwise
  static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
    let newTimelineInput: StreamTimeline[] = [];
      nextProps.allStreams.forEach( (eachChannel: StreamChannel) => {
        newTimelineInput.push(eachChannel.timelineInput);
      }) ;
    if(newTimelineInput !== prevState.allTimelineInput){
      //Change in props
      return {
        allTimelineInput: newTimelineInput
      };
    }
    return null; // No change to state
  }


  render() {
    return (
      <div id='stream-timelines'>
        <div id="timeline-tooltip">tooltip</div>
      </div>
    );
  }
}

export default StreamTimelines;
