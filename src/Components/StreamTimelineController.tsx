import React, { Component } from 'react';

import Stream from './../Classes/Stream';
import Checkbox from '@mui/material/Checkbox';


interface IProps {
  allStreams:       Array<StreamChannel>
  showMediaToggle:  any
  muteMediaToggle:  any
  moveStreamUp:     any
  moveStreamDown:   any
  removeStream:     any
}

interface IState {
  columns:    Array<any>
}

interface StreamChannel {
  uniqueId:       number,
  stream:         Stream,
  timelineInput:  StreamTimeline,
  playerRef:      HTMLInputElement,
  showMedia:      boolean,
  muteMedia:      boolean
}

type StreamTimeline = { times: Array<TimeSegment> }
type TimeSegment = {
  starting_time:  number,
  ending_time:    number
}

class StreamTimelineController extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      columns: []
    }
  }

  componentDidMount(): void {
    const tableColumns = [
      {
        Header: 'location',  
        accessor: 'location'
      },
      {
        Header: 'stream',  
        accessor: 'showMedia'
      },
      {
        Header: 'audio',  
        accessor: 'muteMedia'
      },
      {
        Header: '',  
        accessor: 'moveUp'
      },
      {
        Header: '',  
        accessor: 'moveDown'
      },
      {
        Header: 'Remove',  
        accessor: 'remove'
      }
    ];
    this.setState({ columns: tableColumns });
  }
  
  render() {
    return (
      <React.Fragment>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th></th>
              <th><img style={{width: "10pt"}} src="onoff.svg" alt="availability"></img></th> 
              <th>👁</th>
              <th>🔊</th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
            {this.props.allStreams.map((thisChannel: StreamChannel, index: number) => {
              return <tr className="controller-row" key={"controller-" + thisChannel.uniqueId}>
                  <td style={{textAlign: 'left'}}>{thisChannel.stream.getLocation()}</td>
                  <td style={{textAlign: 'left'}}>{thisChannel.stream.getEquipment() !== 'Unknown' && thisChannel.stream.getEquipment()}</td>
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
                      key = {'video-checkbox-' + thisChannel.uniqueId.toString()}
                      // size="small"
                      checked
                      // ={thisChannel.showMedia} 
                      disabled
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
                    <button className="controller" onClick={() => {this.props.removeStream(thisChannel.uniqueId, index)}}>❌</button>
                  </td>
                </tr>
            })}
          </tbody>
        </table>
      </React.Fragment>
    );
  }
}

export default StreamTimelineController;