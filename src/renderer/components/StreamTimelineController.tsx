import React, { Component } from 'react';
import VideocamIcon from '@mui/icons-material/Videocam';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

// Interfaces & Types
import { StreamChannel } from './interfaces/StreamChannel.interface';

interface IProps {
  allStreams:       Array<StreamChannel>
  showMediaToggle:  (streamID: number) => void
  muteMediaToggle:  (streamID: number) => void
  moveStreamUp:     (index: number) => void
  moveStreamDown:   (index: number) => void
  removeStream:     (streamIDs: number[]) => void
  focusStream:      number
  setFocusStream:   (index: number) => void
}

interface IState {}

/////////////////////////////////////

class StreamTimelineController extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  // render a table of Stream timeline controls
  render() {
    return (
      <>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th><VideocamIcon/></th>
              <th><VolumeUpIcon/></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
            {this.props.allStreams.map((thisChannel: StreamChannel, index: number) => {
              return <tr className="controller-row" key={"controller-" + thisChannel.uniqueId}>
                  <td style={{textAlign: 'left'}}>{thisChannel.stream.getLocation() + ", " + thisChannel.stream.getEquipment()}</td>
                  <td>
                    <input
                      type="checkbox"
                      key = {'stream-checkbox-' + thisChannel.uniqueId.toString()}
                      // size="small"
                      checked={thisChannel.showMedia}
                      onChange={() => this.props.showMediaToggle(thisChannel.uniqueId)}
                      style={{padding: 0}}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      key = {'audio-checkbox-' + thisChannel.uniqueId.toString()}
                      // size="small"
                      checked={!thisChannel.muteMedia}
                      disabled={!thisChannel.showMedia}
                      onChange={() => this.props.muteMediaToggle(thisChannel.uniqueId)}
                      style={{padding: 0}}
                    />
                  </td>
                  <td>
                    <button className="controller" onClick={() => {this.props.moveStreamUp(index)}} disabled={index === 0}>▲</button>
                  </td>
                  <td>
                    <button className="controller" onClick={() => {this.props.moveStreamDown(index)}} disabled={index === this.props.allStreams.length - 1}>▼</button>
                  </td>
                  <td>
                    <button className="controller" onClick={() => {this.props.setFocusStream(index)}} disabled={index === this.props.focusStream}>🔍</button>
                  </td>
                  <td>
                    <button className="controller" onClick={() => {this.props.removeStream([thisChannel.uniqueId])}}>❌</button>
                  </td>
                </tr>
            })}
          </tbody>
        </table>
      </>
    );
  }
}

export default StreamTimelineController;
