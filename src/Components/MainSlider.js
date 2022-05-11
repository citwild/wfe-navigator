import React, { Component } from 'react';
import * as d3 from 'd3';
import * as d3Slider from 'd3-simple-slider';

class MainSlider extends Component {
  constructor(props) {
    super(props);
    this.state = {  }
  }
  
  componentDidMount() {
    this.createMainSlider();
  }

  createMainSlider = () => {
    console.log('creating main-slider...');
    d3.select("#main-slider > svg").remove();

    const sliderHeight = 50;
    const sliderWidth = 1000
    ;

    // var linearScale = d3.scaleLinear()
    //   .domain([0, 24])
    //   .range([0, 500]);
    
    var slider = d3Slider
      .sliderTop()
      .min(this.props.overallStartTime)
      .max(this.props.overallEndTime)
      .step(1)
      .default(this.props.masterTime)
      .width(sliderWidth)
      .displayValue(false)
      .tickFormat(d3.timeFormat("%H:%M:%S")) //time zone based on system settings
      .on('onchange', (val) => {
        d3.select('#value').text(new Date(val));
        // d3.select('#value').text(val);
        
      })
      .on('end', (value) => {
        this.updateMasterTime(value);
      });;

    var g = d3
      .select('#main-slider')
      .append('svg')
      .attr('width', sliderWidth + 20)
      .attr('height', sliderHeight)
      .append('g')
      .attr('transform', 'translate(10,40)');
    
    g.call(slider);
  }

  render() { 
    return (
      <div id="main-slider"></div>
    );
  }
}
 
export default MainSlider;