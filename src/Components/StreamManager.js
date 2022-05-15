import { randomIrwinHall } from 'd3';
import React, { Component } from 'react';
import VideoHandler from './VideoHandler';

const rootDir = "C:/Users/Irene/Desktop/BeamCoffer/";

class StreamManager extends Component {
  constructor(props) {
    super(props);
    this.state = {  
      mediaAtMasterTime: null,
      playing: false
    }
  }
  
  componentDidUpdate() {
  }

  NoMedia = () => {
    return (
      <div className="no-media">
        [ no media to display ]
      </div>
    );
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    var sourceAtNewMasterTime = nextProps.stream.getMediaAtTime(nextProps.masterTime);
    // if(sourceAtNewMasterTime !== prevState.mediaAtMasterTime){
    // }

    if(sourceAtNewMasterTime !== null) {
      return {
        mediaAtMasterTime: sourceAtNewMasterTime
      };
    } else {
      return {
        mediaAtMasterTime: null
      };
    }
    return null; // No change to state
  }


  render() { 
    console.log("MASTER TIME = " + this.props.masterTime);
    return (
      <div className='player-wrapper'>
        <p>{this.props.stream.getLocation()}</p>
        {this.state.mediaAtMasterTime === null ? "" : this.state.mediaAtMasterTime.name}
        {
          this.state.mediaAtMasterTime === null 
          ? <this.NoMedia/> 
          : <VideoHandler
              media = {this.state.mediaAtMasterTime}
              url = {rootDir + this.state.mediaAtMasterTime.getSource()}
              masterTime = {this.props.masterTime}
              updateMasterTime = {this.props.updateMasterTime}
            />
        }
      </div>
    );
  }
}
 
export default StreamManager;