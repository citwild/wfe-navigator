import React, { Component } from 'react'
import * as d3 from 'd3';

// Class objects
// import Video from './../Classes/Video.js';
// import Stream from './../Classes/Stream.js';

import drawBar from '../drawBar.js';

export default class RepBar extends Component {
  constructor(props) {
    super(props);
    
    // initialize array of hexData in state
    this.state = { 
      markers: [],
      colorCoder: []
    };
  }

  componentDidMount() {
    //d3 create
    this.createBar();

    console.log(this.props.str);
    console.log("repBar");

    // (el, data, configuration)
    // this._chart = drawBar.create(
    //   this.svg,
    //   d3.range(this.props.overallStartTime, this.props.overallEndTime, 1),
    //   this.props.config
    // );
  }

  
  componentDidUpdate() {
    if (document.querySelector('svg') != null) {
      d3.select(this.svg).selectAll('g').remove();
    }
    
    this.createBar();
  }

  createBar = () => {
    
    const svgWidth = 800;
    const barHeight = 20;
    const fillColor = "orange";
    const emptyColor = "#ccc";

    const verticalPadding = 5;
    const horizontalPadding = 10;
    const labelHeight = 0; 
    //////////////// computed properties ////////////////
    const rectWidth = 
      ((this.props.overallEndTime - this.props.overallStartTime) > 0) &&
      (this.props.overallEndTime - this.props.overallStartTime) < svgWidth ?
      Math.ceil(svgWidth/(this.props.overallEndTime - this.props.overallStartTime)) : 1;
    const svgWidthAndPadding = svgWidth + verticalPadding*2 + horizontalPadding*2;
    const svgHeightAndPadding = barHeight + verticalPadding*2 + labelHeight;
    ////////////////////////////////////////////

    var colorCoder = [];
    var markers = this.props.str.getSegmentMarkers();    
        if (this.props.overallStartTime < markers[0]) {
      markers = [this.props.str.earliestTime].concat(markers);
      colorCoder.push(emptyColor);
    }
    for (var i = 0; i < markers.length + 1; i++) {
      if (i % 2 == 0) {
        colorCoder.push(emptyColor);
      } else {
        colorCoder.push(fillColor);
      }
    }
    if (this.props.overallEndTime >= markers[markers.length]) {
      markers = markers.concat(this.props.str.latestTime);
      colorCoder.push(fillColor);
    }

    var data = d3.range(this.props.overallStartTime, this.props.overallEndTime, 1);

    let linearScale = d3.scaleLinear()
        .domain([this.props.overallStartTime, this.props.overallEndTime])
        .range([0, svgWidth]); //visual
    
    let threshold = d3.scaleThreshold()
        .domain(markers)
        .range(colorCoder); //visual    
    
    this.bar = d3.select(this.svg)
      .attr("width", svgWidthAndPadding)
      .attr("height", svgHeightAndPadding);
    
    this.bar
      .append('g')
      .attr("transform", "translate(" + (horizontalPadding) + ", 0 )")
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', (d) => {
        return linearScale(d);
      })
      .attr('width', rectWidth)
      .attr('height', (d) => {
        if (d == this.props.masterTime) { return svgHeightAndPadding;}
        return barHeight;
      })
      .style('fill', (d) => {
        if (d == this.props.masterTime) { return 'red';}
        return threshold(d);
      });
      
    
    
    // var axis = d3.axisBottom(linearScale).tickValues(markers);
    // this.bar
    //   .append('g')
    //   .classed('x-axis', true)
    //   .attr("transform", "translate(" + (padding + horizontalpadding) + "," + (padding + barHeight) + ")")
    //   .call(axis);
    return true;
  }


  componentWillUnmount() {
    //d3 destroy
  }

  ref = (ref) => {
    this.svg = ref;
  }


  render() {
    // render svg element and use ref callback to store reference
    return (
      <div className='channel-bar'>
        <svg ref={ svg => this.svg = svg } />
      </div>
    );
  }
}