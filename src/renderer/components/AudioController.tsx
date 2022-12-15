// Libraries
import React, { Component } from 'react';
import SpeakerIcon from '@mui/icons-material/Speaker';

interface IProps {
  keyID:              number
  muteMedia:          boolean
  gainValue:          number
  pannerValue:        number
  updateGainControl:  (g: number) => void
  updatePannerControl:(p: number) => void
}

interface IState {}

/////////////////////////////////////////////////////////////

class AudioController extends Component<IProps, IState> {
  pannerNode: AudioNode;
  gainNode: AudioNode;
  constructor(props: IProps) {
    super(props);
    this.pannerNode = null;
    this.gainNode = null;
  }

  changePannerValue = (e: any) => {
    this.props.updatePannerControl(e.target.value);
  }

  changeGainValue = (e: any) => {
    this.props.updateGainControl(e.target.value);
  }

  render() {
    return (
      <div>
      <table className='range-table center'>
        <thead></thead>
        <tbody>
          <tr>
            <td className='range-pre-label'>L<SpeakerIcon sx={{ fontSize: 20 }}/>{Math.floor(50 - this.props.pannerValue * 50) + "%"}</td>
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

            <td>{Math.ceil(this.props.pannerValue * 50 + 50) + "%"}<SpeakerIcon sx={{ fontSize: 20 }}/>R</td>

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
        </tbody>
      </table>
    </div>
    );
  }
}

export default AudioController;
