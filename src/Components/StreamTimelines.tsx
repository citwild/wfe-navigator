import React, { Component } from 'react';
import * as d3 from 'd3';
import timelines from '../lib/timelines.js'; //examples = https://codepen.io/manglass/pen/MvLBRz
import Stream from '../Classes/Stream';


interface IProps {
  sliderRange: {
    minTime: number,
    maxTime: number
  },
  masterTime: number,
  allStreams: Stream[]
}

interface IState {
  streams:            Array<Stream>,
  transformedStreams: Array<StreamTimeline>
}

type StreamTimeline = { times: Array<TimeSegment> }
type TimeSegment = {
  starting_time:  number,
  ending_time:    number
}

/////////////////////////////////////////////////////////////

class StreamTimelines extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      streams: new Array<Stream>(),
      transformedStreams: []
    }
  }
  
  componentDidMount() {
    if (document.querySelector('div#stream-timelines > svg') != null) {
      d3.select('div#stream-timelines').selectAll('svg').remove();
    }
    
    this.createTimelines();
  }

  componentDidUpdate() {
    if (document.querySelector('div#stream-timelines > svg') != null) {
      d3.select('div#stream-timelines').selectAll('svg').remove();
    }
    
    this.createTimelines();
  }


  createTimelines = (): void => {
    // var testData = [
    //   {label: "stream a", 
    //     times: [
    //       {"starting_time": 1355752800000, "ending_time": 1355759900000},
    //       {"starting_time": 1355767900000, "ending_time": 1355774400000}
    //     ]
    //   },
    //   {label: "stream b", 
    //     times: [
    //       {"starting_time": 1355759910000, "ending_time": 1355761900000},
    //       {"starting_time": 1355761960000, "ending_time": 1355762020000}
    //     ]
    //   },
    //   {label: "stream c", 
    //     times: [
    //       {"starting_time": 1355761910000, "ending_time": 1355763910000}
    //     ]
    //   },
    //   {label: "stream F", 
    //     times: [
    //       {"starting_time": 1355761910000, "ending_time": 1355763910000}
    //     ]
    //   },
    //   {label: "stream audio only", 
    //     times: [
    //       {"starting_time": 1355752800000, "ending_time": 1355759900000},
    //       {"starting_time": 1355767900000, "ending_time": 1355774400000}
    //     ]
    //   }
    // ];
    

    const itemHeight: number = 12;
    const itemMargin: number = 3;
    const itemColor: string = "lightpink";
    const backgroundColor: string = "#f2f2f2";
    const margin = {
      left: 20, 
      right: 20, 
      top: 0, 
      bottom: 0
    };
    const svgWidth: number = 1700;
    const svgHeight: number = 
        this.state.transformedStreams.length === 0 
        ? 0 
        : (this.state.transformedStreams.length + 2) * (itemHeight + itemMargin);

    
    var chart: any = timelines()
      .stack()
      .orient("bottom")
      //@ts-expect-error
      .itemHeight(itemHeight)
      .itemMargin(itemMargin)
      .margin(margin)
      .colors(() => {return itemColor})
      .background(backgroundColor)
      .showTimeAxis();

    var xScale: any = d3.scaleLinear()
      .domain([this.props.sliderRange.minTime, this.props.sliderRange.maxTime])
      .range([margin.left, svgWidth - margin.right]);

    //TODO: 
    //  make height dynamic
    d3.select("#stream-timelines")
      .append("svg")
      // .attr("id", "timeline-svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight) //needs to make dynamic
      .datum(this.state.transformedStreams)
      .call(chart)
      .append('rect')
      .classed("scrubber-line", true)
      .attr("width", 1)
      .attr("height", '100%')
      .attr('x', xScale(this.props.masterTime))
      .style('fill', "red");
    
    //Add indicator of currently playing media
    d3.selectAll("rect[id^='timelineItem']")
    .style("fill", (d: TimeSegment) => {
      if (this.props.masterTime >= d.starting_time && this.props.masterTime <= d.ending_time) {
        return "purple";
      }
      return itemColor;
    })
  }


  //
  static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
    //adapt Stream object into d3-timelines format to display
    if(nextProps.allStreams !== prevState.streams){
      //Change in props

      let newTransformedStreams: Array<StreamTimeline> = [];
      nextProps.allStreams.map( (thisStream) => {
        let channel: StreamTimeline = {
          times: []
        };
        thisStream.media.map( thisMedia => {
          channel.times.push(
            {
              "starting_time": thisMedia.startTime, 
              "ending_time": thisMedia.endTime
            }
          );
        });
        newTransformedStreams.push(channel);
      }) 
      // console.log({newTransformedStreams});

      return {
        streams: nextProps.allStreams,
        transformedStreams: newTransformedStreams
      };
    }
    return null; // No change to state
  }


  render() { 
    return (
      <div id='stream-timelines'></div>
    );
  }
}
 
export default StreamTimelines;