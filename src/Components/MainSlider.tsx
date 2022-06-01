import React, { Component, PropsWithChildren } from 'react';
import * as d3 from 'd3';
import * as d3Slider from 'd3-simple-slider';

interface IProps {
  sliderRange: {
    minTime: number,
    maxTime: number
  },
  masterTime: number,
  updateMasterTime: any
}

interface IState {
  minTime: number;
  maxTime: number;
}

/////////////////////////////////////////////////////////////

class MainSlider extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      minTime: 0,
      maxTime: 0
    }
  }
  
  componentDidMount() {
    if (this.props.sliderRange.maxTime - this.props.sliderRange.minTime !== 0) {
      this.createMainSlider();
    }
    
  }

  componentDidUpdate() {
    if (document.querySelector('div#main-slider > svg') != null) {
      d3.select('div#main-slider').selectAll('svg').remove();
    }
    
    this.createMainSlider();
  }

  createMainSlider = (): void => {
    console.log('drawing main-slider...');
    
    d3.select("#main-slider > svg").remove();

    const sliderHeight: number = 50;
    const sliderWidth: number = 1000;

    var xScale = d3.scaleLinear()
      .domain([this.state.minTime, this.state.maxTime])
      .range([20, 1000]);
    
    var slider = d3Slider
      .sliderTop()
      .min(this.state.minTime)
      .max(this.state.maxTime)
      .step(1)
      .default(this.props.masterTime)
      .width(sliderWidth - (2 * 20))
      .displayValue(false)
      .tickFormat(d3.timeFormat("%H:%M:%S")) //time zone based on system settings
      .on('onchange', (val: number) => {
        d3.select('#slider-value').text(new Date(val).toString);
        // d3.select('#value').text(val);
        
        
      })
      .on('end', (value: number) => {
        this.props.updateMasterTime(value);
        // d3.select('rect#scrubber-line')
        // .attr('x', xScale.invert(this.props.masterTime))
        var seekButtons: any = document.getElementsByClassName('seek');
        for (var i = 0; i < seekButtons.length ; i++) {
          seekButtons[i].click();
        }
      });

    var g = d3
      .select('#main-slider')
      .append('svg')
      .attr('width', sliderWidth)
      .attr('height', sliderHeight)
      .append('g')
      .attr('transform', 'translate(20,40)');
    
    g.call(slider);
  }

  static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
    //adapt Stream object into d3-timelines format to display
    if(nextProps.sliderRange.minTime !== prevState.minTime ||
      nextProps.sliderRange.maxTime !== prevState.maxTime){
      //Change in props
      if (document.querySelector('div#main-slider > svg') != null) {
        d3.select('div#main-slider').selectAll('svg').remove();
      }
    
      return {
        minTime: nextProps.sliderRange.minTime,
        maxTime: nextProps.sliderRange.maxTime
      };
    }
    return null; // No change to state
  }

  render() { 

    d3.select('#slider-value')
      .text(new Date(this.props.masterTime).toString);
    return (
      <div id="slider-container">
        <div id="slider-value"></div>
        <div id="main-slider"></div>
      </div>
    );
  }
}
 
export default MainSlider;