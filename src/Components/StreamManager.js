import { randomIrwinHall } from 'd3';
import React, { Component } from 'react';
import VideoHandler from './VideoHandler';

const rootDir = "C:/Users/Irene/Desktop/BeamCoffer/";

class StreamManager extends Component {
  constructor(props) {
    super(props);
    this.state = {  
      mediaAtMasterTime: null,
      play: true
    }
  }
  

  NoMedia = () => {
    return (
      <div style={{ backgroundColor: 'black', color: 'white', textAlign: 'center', width: '240px'}}>
        [ no media to display ]
      </div>
    );
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    var sourceAtNewMasterTime = nextProps.stream.getMediaAtTime(nextProps.masterTime);
    if(sourceAtNewMasterTime !== prevState.mediaAtMasterTime){
      //Change in props
      if(sourceAtNewMasterTime !== null) {
        return {
          mediaAtMasterTime: sourceAtNewMasterTime
        };
      } else {
        return {
          mediaAtMasterTime: null
        };
      }
    }
    return null; // No change to state
  }


  render() { 
    return (
      <React.Fragment>
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
      </React.Fragment>
    );
  }
}
 
export default StreamManager;