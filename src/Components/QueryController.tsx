// Libraries
import React, { Component } from 'react';
import { QueryBuilder, Field, RuleGroupType } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

// Components

// Class objects
import Media from '../Classes/Media';
import Stream from '../Classes/Stream';

const rootDir = "C:/Users/Irene/Desktop/BeamCoffer/";

interface IProps {
  allStreams:       StreamChannel[],
  masterTime:       number,
  updateMasterTime: any,
  playing:          boolean,
  playbackSpeed:    number,
  showFileInDir:    any,
  audioContext:     any
}

interface IState {
  query:    RuleGroupType
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

/////////////////////////////////////////////////////////////

class QueryController extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {  
      query: null
    }
  }
  
  componentDidUpdate() {
  }



  render() { 
    const fields: Field[] = [
      { name: 'date', label: 'Date' },
      { name: 'location', label: 'Location' },
      { name: 'equipment', label: 'Equipment' },
    ];
    
    return (
      <div className='query-builder'>
        <QueryBuilder 
          fields={fields} 
          onQueryChange={(q) => console.log(q)}
          query={this.state.query}
        />

      </div>
    );
  }
}
 
export default QueryController;