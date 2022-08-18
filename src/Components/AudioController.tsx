// Libraries
import React, { Component } from 'react';

// Class objects
import Media from '../Classes/Media';
import Stream from '../Classes/Stream';

const rootDir = "C:/Users/Irene/Desktop/BeamCoffer/";

interface IProps {
  keyID:              number,
  muteMedia:          boolean,
  gainValue:          number,
  pannerValue:        number,
  updateGainControl:  any,
  updatePannerControl:any
}

interface IState {
  mediaAtMasterTime:  Media
}

/////////////////////////////////////////////////////////////

class AudioController extends Component<IProps, IState> {
  pannerNode: any;
  gainNode: any;
  constructor(props: IProps) {
    super(props);
    this.state = {  
      mediaAtMasterTime: null
    }
    this.pannerNode = null;
    this.gainNode = null;
  }
  
  componentDidMount(): void {
  }

  changePannerValue = (e: any) => {
    this.props.updatePannerControl(e.target.value);
  }

  changeGainValue = (e: any) => {
    this.props.updateGainControl(e.target.value);
  }

  render() { 
    console.log(this.props.pannerValue);
    return (
      <div>
      <table className='range-table center'>
        <tr>
          <td className='range-pre-label'>{Math.floor(50 - this.props.pannerValue * 50) + "%"}</td>
          <td>
            <input id={"panning-control-" + this.props.keyID} 
              type="range" 
              min="-1" 
              max="1" 
              step="0.05" 
              value={this.props.pannerValue} 
              onChange={this.changePannerValue}
              disabled={this.props.muteMedia}
            ></input>
          </td>
          <td>{Math.ceil(this.props.pannerValue * 50 + 50) + "%"}</td>
        </tr>
        <tr>
          <td className='range-pre-label'>Volume</td>
          <td>
            <input id={"gain-control-" + this.props.keyID} 
              type="range" 
              min="0" 
              max="5" 
              step="0.01" 
              value={this.props.gainValue} 
              onChange={this.changeGainValue}
              disabled={this.props.muteMedia}
            ></input>
          </td> 
          <td>{Math.round(this.props.gainValue * 100) + "%"}</td>
        </tr>
      </table>
    </div>
    );
  }
}
 
export default AudioController;