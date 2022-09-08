// Libraries
import { resolve } from 'node:path/win32';
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
  addNewStreamToStreamTimeline: (s: Stream) => void
}

interface IState {
  query:          RuleGroupType
  queryFields:    Field[]
  fieldsFetched:  boolean
}

interface StreamChannel {
  uniqueId:       any,
  stream:         Stream,
  timelineInput:  StreamTimeline,
  playerRef:      HTMLInputElement,
  showMedia:      boolean,
  muteMedia:      boolean,
  gainValue:      number,
  pannerValue:    number
}

type StreamTimeline = { times: Array<TimeSegment> }
type TimeSegment = {
  starting_time:  number,
  ending_time:    number
}

/////////////////////////////////////////////////////////////

const fields: Field[] = [
  {
      name: "media_files.media_type",
      label: "Media Type",
      valueSource: [
          "media_type"
      ],
      datatype: "text",
      valueEditorType: "select",
      values: [
        {name: "Video", label: "Video"},
        {name: "Audio", label: "Audio"}
      ]
  },
  {
      name: "media_files.location",
      label: "Location",
      valueSource: [
          "location"
      ],
      datatype: "text"
  },
  {
      name: "media_files.equipment",
      label: "Equipment",
      datatype: "text",
      valueEditorType: "select",
      values: [
        {name: "gopro", label: "GoPro"},
        {name: "zoom", label: "Zoom"}
      ]
  },
  {
      name: "media_files.file_ext",
      label: "File Ext",
      valueSource: [
          "file_ext"
      ],
      datatype: "text"
  },
  {
      name: "media_files.year",
      label: "Year",
      valueSource: [
          "year"
      ],
      datatype: "integer"
  },
  {
      name: "media_files.month",
      label: "Month",
      valueSource: [
          "month"
      ],
      datatype: "integer"
  },
  {
      name: "media_files.date",
      label: "Date",
      valueSource: [
          "date"
      ],
      datatype: "integer"
  },
  {
      name: "media_files.nominal_date",
      label: "Date",
      valueSource: [
          "nominal_date"
      ],
      datatype: "date",
      inputType: "date"
  },
  {
      name: "media_files.recording_mode",
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
  returnedStreams: any;
  returnedMedia: any;

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
    this.returnedStreams = [];
    this.returnedMedia = new Map<number, any>();
  }
  
  componentDidMount() {
    // this.getQueryFields("media_files");

  }



  // getQueryFields = (tableName: string) => {
  //   console.log("trying to get fields");
  //   var fields: any[] = [];
  //   //dynamically gets all distinct fields from db 
  //   //@ts-expect-error
  //   window.api.receive("allFields", (data) => {
  //     console.log(Object.keys(data));
  //     Object.keys(data).forEach(columnName => {
  //       const columnStartCase = columnName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  //       const thisField = 
  //       { 
  //         name: columnName, 
  //         label: columnStartCase,
  //         valueSources: [columnName],
  //         datatype: data[columnName].type
  //       };
  //       fields.push(thisField);
  //     });
      
      
  //     console.log(fields);
  //   });
  //   //@ts-expect-error
  //   window.api.send("getFields", tableName);
  // }

  setQuery = (input: any) => {
    this.setState({ query: input });
  }


  queryStreams = ()  => {
    const subquery: String = formatQuery(this.state.query, 'sql');
    console.warn(subquery);
    //@ts-expect-error
    window.api.receive("foundStreams", (streamList) => {
      this.returnedStreams = streamList;
      console.log(this.returnedStreams);
      console.warn(streamList.length + " stream(s) found.");
    });
    //@ts-expect-error
    window.api.send("queryStreams", subquery);
  }


  //WORKING VERSION
  addStreamsToView = async () => {
    
    const rStreams = this.returnedStreams;
    
    const results = await Promise.all(rStreams.map( async (thisStream: { stream_id: number; }) => {
      
      console.log(thisStream.stream_id);
      //@ts-expect-error
      return [thisStream.stream_id, await window.api.receiveAsPromise("test", thisStream.stream_id)];
    }));
    console.log(await results);

  }

  removeStreamsToView = () => {}

  testInvoke = async () => {
    console.log("test invoke");
    //@ts-expect-error
    const test =  await window.api.receiveAsPromise("test", 1);
    console.log(test);
  }

  queryAllMediaInStream = (sm_stream_id: number) => {
    console.log("getAllMediaInStream ID: " + sm_stream_id);
    //@ts-expect-error
    window.api.receive("allMediaInStream", (mediaList) => {
      console.log(mediaList);

      //create stream object from all media

        // add all media objects to this stream 

      // add to stream timeline
      // this.addToStreamTimeline(sm_stream_id, mediaList);
      // mediaList.forEach(m => {

      // })
      this.returnedMedia.set(sm_stream_id, mediaList);
      return; 
    });
    //@ts-expect-error
    window.api.send("findMediaInStream", sm_stream_id);
  }


  addToStreamTimeline = (stream_id: any, mediaListJSON: any) => {
    //check if this stream already exist in allStreams 
    if (!(stream_id in this.props.allStreams.map(s => s.uniqueId))) {
      //if does not already exist, then do all this:
      //create list of media objects
      const mediaObjectList: Array<Media> = this.createMediaListFromJSON(mediaListJSON);

      //create stream from media objects
      const newStream: Stream = this.createStreamFromMediaList(stream_id, mediaObjectList);
      //create streamchannel from stream
      // const newChannel: StreamChannel = this.createStreamChannelFromStream(stream_id, newStream);
      this.props.addNewStreamToStreamTimeline(newStream);

      
    }
    // new Promise((resolve, reject) => {
    //   if (!(stream_id in this.props.allStreams.map(s => s.uniqueId))) {
    //     resolve(mediaListJSON);
    //   } else {
    //     reject();
    //   }
    // })
    // .then((mediaListJSON) => {
    //   return this.createMediaListFromJSON(mediaListJSON);
    // })
    // .then((mediaObjectList) => {
    //   return this.createStreamFromMediaList(stream_id, mediaObjectList);
    // })
    // .then((newStream) => {
    //   this.props.addNewStreamToStreamTimeline(newStream);
    // });
  }


  createStreamFromMediaList= (stream_id: any, mediaList: Array<Media>): Stream => {
    //get all uniques values of Date, Location, Equipment from this media list
    let allDates: String[]= mediaList.map(m => m.date);
    let allLocations: String[] = mediaList.map(m => m.location);
    let allEquipments: String[] = mediaList.map(m => m.equipment);
    let uniqueDates: string = [...new Set(allDates)].join(',');
    let uniqueLocations: string = [...new Set(allLocations)].join(',');
    let uniqueEquipments: string = [...new Set(allEquipments)].join(',');
    return new Stream(uniqueDates, uniqueLocations, uniqueEquipments, mediaList, undefined, undefined, undefined, undefined, stream_id);
  }

  createMediaListFromJSON = (mediaListJSON :any): Media[] => {
    var mediaObjectList: Media[] = mediaListJSON.map((mediaItem: any) => {

      /// TEMP path creator, based on COMPRESSED VERSION of files
      var pathConstruct: string[] = [mediaItem.nominal_date];
      if (mediaItem.location !== "Unknown") { 
        pathConstruct.push(mediaItem.location);
      }
      if (mediaItem.equipment !== "Unknown") {
        pathConstruct.push(mediaItem.equipment);
      }
      var path: string = pathConstruct.join('/') + "/";

      var fileSuffix = "";
      if (mediaItem.location === 'Huddle') {
        fileSuffix = "-320";
      } else if (mediaItem.equipment === 'gopro') {
        fileSuffix = "-320";
      } else if (mediaItem.equipment === 'zoom') {
        fileSuffix = "-128";
      }
      /////////////////////////////////////////////////////////////
      return new Media(
        mediaItem.time_begin, 
        mediaItem.time_end,
        path + mediaItem.file_name.split('.')[0] + fileSuffix + "." + (mediaItem.media_type === 'Video' ? mediaItem.file_ext : "mp3"), 
        mediaItem.file_name, 
        mediaItem.nominal_date, 
        mediaItem.location, 
        mediaItem.equipment,
        mediaItem.media_type,
        mediaItem.media_id
      )
    });
    console.log({mediaObjectList});
    return mediaObjectList;
  }

  render() { 
    // const fields: Field[] = [
    //   { name: 'date', label: 'Date' },
    //   { name: 'location', label: 'Location' },
    //   { name: 'equipment', label: 'Equipment' },
    // ];

    return (
      <div className='query-builder'>
        
        <QueryBuilder 
          fields={fields} 
          onQueryChange={(q) => this.setState({ query : q })}
          query={this.state.query}
        />
        <pre>{formatQuery(this.state.query, 'sql')}</pre>
        <button onClick={() => this.testInvoke()}>query then add</button>
        <button onClick={() => this.queryStreams()}>query then add</button>
        <button onClick={() => this.addStreamsToView()}>+ streams that apply</button>
        <button onClick={() => this.removeStreamsToView()}>- streams that apply</button>
        
      </div>
    );
  }
}
 
export default QueryController;