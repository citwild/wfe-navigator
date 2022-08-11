// Libraries
import { format } from 'path';
import React, { Component } from 'react';
import { QueryBuilder, Field, RuleGroupType, RuleGroup, formatQuery } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

// Components

// Class objects
import Media from '../Classes/Media';
import Stream from '../Classes/Stream';

const rootDir = "C:/Users/Irene/Desktop/BeamCoffer/";

interface IProps {
  allStreams:       StreamChannel[],
  dbConfig:         any,
  addStream:        any,
  removeStream:     any
}

interface IState {
  query:          RuleGroupType
  queryFields:    Field[]
  fieldsFetched:  boolean
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

const fields: Field[] = [
  {
      name: "media_type",
      label: "Media Type",
      valueSource: [
          "media_type"
      ],
      datatype: "text",
      valueEditorType: "select",
      values: [
        {name: "video", label: "Video"},
        {name: "audio", label: "Audio"}
      ]
  },
  {
      name: "location",
      label: "Location",
      valueSource: [
          "location"
      ],
      datatype: "text"
  },
  {
      name: "equipment",
      label: "Equipment",
      datatype: "text",
      valueEditorType: "select",
      values: [
        {name: "gopro", label: "GoPro"},
        {name: "zoom", label: "Zoom"}
      ]
  },
  {
      name: "file_ext",
      label: "File Ext",
      valueSource: [
          "file_ext"
      ],
      datatype: "text"
  },
  {
      name: "year",
      label: "Year",
      valueSource: [
          "year"
      ],
      datatype: "integer"
  },
  {
      name: "month",
      label: "Month",
      valueSource: [
          "month"
      ],
      datatype: "integer"
  },
  {
      name: "date",
      label: "Date",
      valueSource: [
          "date"
      ],
      datatype: "integer"
  },
  {
      name: "nominal_date",
      label: "Date",
      valueSource: [
          "nominal_date"
      ],
      datatype: "date",
      inputType: "date"
  },
  {
      name: "recording_mode",
      label: "Recording Mode",
      valueSource: [
          "recording_mode"
      ],
      datatype: "text",
      valueEditorType: "select",
      values: [
        {name: "XY", label: "XY"},
        {name: "MS", label: "MS"},
        {name: "unknown", label: "Unknown"}
      ]
  }
]

class QueryController extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);
    this.state = {  
      fieldsFetched: false,
      query: {
        id: 'root',
        combinator: 'and',
        rules: []
      },
      queryFields: []

    }
  }
  
  componentDidMount() {
    // this.getQueryFields("media_files");

  }



  getQueryFields = (tableName: string) => {
    console.log("trying to get fields");
    var fields: any[] = [];
    //dynamically gets all distinct fields from db 
    //@ts-expect-error
    window.api.receive("allFields", (data) => {
      console.log(Object.keys(data));
      Object.keys(data).forEach(columnName => {
        const columnStartCase = columnName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const thisField = 
        { 
          name: columnName, 
          label: columnStartCase,
          valueSources: [columnName],
          datatype: data[columnName].type
        };
        fields.push(thisField);
      });
      
      
      console.log(fields);
    });
    //@ts-expect-error
    window.api.send("getFields", tableName);
  }

  setQuery = (input: any) => {
    this.setState({ query: input });
  }


  render() { 
    // const fields: Field[] = [
    //   { name: 'date', label: 'Date' },
    //   { name: 'location', label: 'Location' },
    //   { name: 'equipment', label: 'Equipment' },
    // ];
    console.log(this.state.query);
    return (
      <div className='query-builder'>
        <button onClick={() => this.getQueryFields("media_files")}>get all fields</button>
        <QueryBuilder 
          fields={fields} 
          onQueryChange={(q) => this.setState({ query : q })}
          query={this.state.query}
        />
        <pre>{formatQuery(this.state.query, 'sql')}</pre>
      </div>
    );
  }
}
 
export default QueryController;