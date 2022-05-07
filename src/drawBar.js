// implementation details for drawing svg elements in the rep bar component 
// native D3.js syntax can be used 

import * as d3 from 'd3';
const drawBar = {};

drawBar.create = (el, data, configuration) => {
    // D3 Code to create the chart
    // var data = d3.range(this.props.overallStartTime, this.props.overallEndTime, 1);
    // let linearScale = d3.scaleLinear()
    //     .domain([this.props.overallStartTime, this.props.overallEndTime])
    //     .range([0, svgWidth]); //visual

    // let threshold = d3.scaleThreshold()
    //     .domain(markers)
    //     .range(colorCoder); //visual    

    // this.bar = d3.select(this.svg)
    //   .attr("width", svgWidthAndPadding)
    //   .attr("height", svgHeightAndPadding);
    
    // this.bar
    //   .append('g')
    //   .attr("transform", "translate(" + (horizontalPadding) + ", 0 )")
    //   .selectAll('rect')
    //   .data(data)
    //   .join('rect')
    //   .attr('x', (d) => {
    //     return linearScale(d);
    //   })
    //   .attr('width', rectWidth)
    //   .attr('height', (d) => {
    //     if (d == this.props.masterTime) { return svgHeightAndPadding;}
    //     return barHeight;
    //   })
    //   .style('fill', (d) => {
    //     if (d == this.props.masterTime) { return 'red';}
    //     return threshold(d);
    //   });
};

drawBar.update = (el, data, configuration, chart) => {
    // D3 Code to update the chart
};

drawBar.destroy = () => {
    // Cleaning code here
};

export default drawBar;
