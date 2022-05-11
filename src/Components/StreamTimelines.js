import React, { Component } from 'react';
import * as d3 from 'd3';
import timelines from '../lib/timelines.js'; //examples = https://codepen.io/manglass/pen/MvLBRz

class StreamTimelines extends Component {
  constructor(props) {
    super(props);
    this.state = {  }
  }
  
  componentDidMount() {
    if (document.querySelector('div#stream-timelines > svg') != null) {
      d3.select('div#stream-timelines').selectAll('svg').remove();
    }
    
    this.createTimelines();
  }


  createTimelines = () => {
    var testData = [
      {label: "stream a", 
        times: [
          {"starting_time": 1355752800000, "ending_time": 1355759900000},
          {"starting_time": 1355767900000, "ending_time": 1355774400000}
        ]
      },
      {label: "stream b", 
        times: [
          {"starting_time": 1355759910000, "ending_time": 1355761900000},
          {"starting_time": 1355761960000, "ending_time": 1355762020000}
        ]
      },
      {label: "stream c", 
        times: [
          {"starting_time": 1355761910000, "ending_time": 1355763910000}
        ]
      },
      {label: "stream F", 
        times: [
          {"color":"yellow", "label":"Weeee", "starting_time": 1355761910000, "ending_time": 1355763910000}
        ]
      },
      {label: "stream c", 
        times: [
          {"starting_time": 1355761910000, "ending_time": 1355763910000}
        ]
      },
      {label: "stream a", 
        times: [
          {"starting_time": 1355752800000, "ending_time": 1355759900000},
          {"starting_time": 1355767900000, "ending_time": 1355774400000}
        ]
      },
      {label: "stream a", 
        times: [
          {"starting_time": 1355752800000, "ending_time": 1355759900000},
          {"starting_time": 1355767900000, "ending_time": 1355774400000}
        ]
      },
      {label: "stream audio only", 
        times: [
          {"starting_time": 1355752800000, "ending_time": 1355759900000},
          {"starting_time": 1355767900000, "ending_time": 1355774400000}
        ]
      },
      {label: "stream audio only", 
        times: [
          {"starting_time": 1355752800000, "ending_time": 1355759900000},
          {"starting_time": 1355767900000, "ending_time": 1355774400000}
        ]
      },
      {label: "stream audio only", 
        times: [
          {"starting_time": 1355752800000, "ending_time": 1355759900000},
          {"starting_time": 1355767900000, "ending_time": 1355774400000}
        ]
      }
      ];
    
    //TODO:
    //  add scrubber line 
    //  add eventlistener to get value from slider
    var chart = timelines()
      .stack()
      .orient("bottom")
      .itemHeight(10)
      .itemMargin(3)
      .margin({left:70, right:20, top:0, bottom:0})
      .colors(() => {return "lightpink"})
      .background("#f2f2f2")
      .showTimeAxis();

    console.log({chart});
    
    //TODO: 
    //  make height dynamic
    d3.select("#stream-timelines")
      .append("svg")
      .attr("width", 1000)
      // .attr("height", 300) //needs to make dynamic
      .datum(testData)
      .call(chart)
      .append('rect')
      .attr("width", 1)
      .attr("height", '100%')
      .attr('x', 500)
      .style('fill', "red");
  }


  static getDerivedStateFromProps(nextProps, prevState) {
    //adapt Stream object into d3-timelines format to display
    
    // if(this.props !== this.state){
    //   //Change in props
    //   return{
    //       name: this.props.name
    //   };
    // }
    return null; // No change to state
  }


  render() { 
    return (
      <div id='stream-timelines'></div>
    );
  }
}
 
export default StreamTimelines;