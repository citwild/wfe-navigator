/* eslint-disable react/destructuring-assignment */

// Libraries
import React, { Component } from 'react';
import {
  QueryBuilder,
  Field,
  RuleGroupType,
  RuleGroup,
  formatQuery,
} from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import Button from '@mui/material/Button';

// Components

// Class objects
import Media from '../classes/Media';
import Stream from '../classes/Stream';

// Interfaces & Types
import { StreamChannel } from './interfaces/StreamChannel.interface';


interface IProps {
  allStreams: StreamChannel[];
  dbConfig: any;
  addStream: any;
  removeStream: any;
  addNewStreamToStreamTimeline: (s: Stream[]) => void;
}

interface IState {
  query: RuleGroupType;
  fieldsFetched: boolean;
  mediaFileConfig: any;
  returnedStreams: any;
}

let qFields: Field[] = [];

class QueryController extends Component<IProps, IState> {
  returnedMedia: any;

  constructor(props: IProps) {
    super(props);
    this.state = {
      fieldsFetched: false,
      mediaFileConfig: null,
      query: {
        id: 'root',
        combinator: 'and',
        rules: [],
      },
      returnedStreams: [],
    };
    this.returnedMedia = new Map<number, any>();
  }

  componentWillMount() {
    this.getQueryFields();
    this.getMediaFileConfig();
  }

  getQueryFields = () => {
    // @ts-expect-error
    const qf = window.api.sendSync('getQueryFields');
    if (qf !== null) {
      qFields = qf;
      this.setState({ fieldsFetched: true });
    }
  }

  getMediaFileConfig = () => {
    // @ts-expect-error
    const fc = window.api.sendSync('getMediaFileConfig');
    if (fc !== null) {
      this.setState({ mediaFileConfig: fc });
    }
  }

  setQuery = (input: any) => {
    this.setState({ query: input });
  };

  queryStreams = () => {
    const subquery: string = formatQuery(this.state.query, 'sql');
    console.warn(subquery);
    // @ts-expect-error
    window.api.receive('foundStreams', (streamList) => {
      this.setState({ returnedStreams: streamList });
      // this.returnedStreams = streamList;
      console.log(this.state.returnedStreams);
      console.warn(`${streamList.length} stream(s) found.`);
    });
    // @ts-expect-error
    window.api.send('queryStreams', subquery);
  };



  // WORKING VERSION
  addStreamsToView = async () => {
    const rStreams = this.state.returnedStreams;

    const currentStreamsAsID = Array.from(
      this.props.allStreams,
      (item) => item.uniqueId
    );
    const distinctStreams = rStreams.filter(
      (item: any) => !currentStreamsAsID.includes(item.stream_id)
    );
    // console.log(currentStreamsAsID);
    // console.log(distinctStreams);

    const results = await Promise.all(
      distinctStreams.map(async (thisStream: { stream_id: number }) => {
        console.log(thisStream.stream_id);
        // @ts-expect-error
        return [
          thisStream.stream_id,
          await window.api.receiveAsPromise(
            'getStreamContents',
            thisStream.stream_id
          ),
        ];
      })
    );
    console.log(results);

    const streamList: Stream[] = [];
    for (let i = 0; i < results.length; i++) {
      const mediaObjectList: Array<Media> = this.createMediaListFromJSON(
        results[i][1]
      );
      const newStream: Stream = this.createStreamFromMediaList(
        results[i][0],
        mediaObjectList
      );
      streamList.push(newStream);
    }
    this.props.addNewStreamToStreamTimeline(streamList);
    console.log(streamList);
  };

  removeStreamsToView = async () => {
    const rStreams = this.state.returnedStreams;

    const currentStreamsAsID = Array.from(
      this.props.allStreams,
      (item) => item.uniqueId
    );
    const distinctStreams = rStreams.filter((item: any) =>
      currentStreamsAsID.includes(item.stream_id)
    );
    const distinctStreamsAsID = Array.from(
      distinctStreams,
      (item: any) => item.stream_id
    );
    this.props.removeStream(distinctStreamsAsID);
  };

  queryAllMediaInStream = (sm_stream_id: number) => {
    console.log(`getAllMediaInStream ID: ${sm_stream_id}`);
    // @ts-expect-error
    window.api.receive('allMediaInStream', (mediaList) => {
      console.log(mediaList);

      // create stream object from all media

      // add all media objects to this stream

      // add to stream timeline
      // this.addToStreamTimeline(sm_stream_id, mediaList);
      // mediaList.forEach(m => {

      // })
      this.returnedMedia.set(sm_stream_id, mediaList);
    });
    // @ts-expect-error
    window.api.send('findMediaInStream', sm_stream_id);
  };

  addToStreamTimeline = (stream_id: any, mediaListJSON: any) => {
    // check if this stream already exist in allStreams
    if (!(stream_id in this.props.allStreams.map((s) => s.uniqueId))) {
      // if does not already exist, then do all this:
      // create list of media objects
      const mediaObjectList: Array<Media> =
        this.createMediaListFromJSON(mediaListJSON);

      // create stream from media objects
      const newStream: Stream = this.createStreamFromMediaList(
        stream_id,
        mediaObjectList
      );
      // create streamchannel from stream
      // const newChannel: StreamChannel = this.createStreamChannelFromStream(stream_id, newStream);
      // this.props.addNewStreamToStreamTimeline(newStream);
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
  };

  createStreamFromMediaList = (
    stream_id: any,
    mediaList: Array<Media>
  ): Stream => {
    // get all uniques values of Date, Location, Equipment from this media list
    const allDates: string[] = mediaList.map((m) => m.date);
    const allLocations: string[] = mediaList.map((m) => m.location);
    const allEquipments: string[] = mediaList.map((m) => m.equipment);
    const uniqueDates: string = [...new Set(allDates)].join(',');
    const uniqueLocations: string = [...new Set(allLocations)].join(',');
    const uniqueEquipments: string = [...new Set(allEquipments)].join(',');
    return new Stream(
      uniqueDates,
      uniqueLocations,
      uniqueEquipments,
      mediaList,
      undefined,
      undefined,
      undefined,
      undefined,
      stream_id
    );
  };

  createMediaListFromJSON = (mediaListJSON: any): Media[] => {
    const mediaObjectList: Media[] = mediaListJSON.map((mediaItem: any) => {
      /// TEMP path creator, based on COMPRESSED VERSION of files
      const pathConstruct: string[] = [mediaItem.nominal_date];
      if (mediaItem.location !== 'Unknown') {
        pathConstruct.push(mediaItem.location);
      }
      if (mediaItem.equipment !== 'Unknown') {
        pathConstruct.push(mediaItem.equipment);
      }
      const path = `${pathConstruct.join('/')}/`;

      let fileConfig: any;
      this.state.mediaFileConfig.forEach( (mf: any ) => {
        let prop = mf.fileProp; //media_type
        if (mediaItem[prop].toUpperCase() === mf.propValue.toUpperCase()) {
          fileConfig = mf;
        }
      });

      const filePrefix = fileConfig.hasOwnProperty('prefix') ? fileConfig.prefix : '';
      const fileSuffix = fileConfig.hasOwnProperty('suffix') ? fileConfig.suffix : '';

      /// //////////////////////////////////////////////////////////
      return new Media(
        mediaItem.time_begin,
        mediaItem.time_end,
        `${path + filePrefix + mediaItem.base_name + fileSuffix}.${
          fileConfig.hasOwnProperty('ext') ? fileConfig.ext : mediaItem.file_ext
        }`,
        mediaItem.file_name,
        mediaItem.nominal_date,
        mediaItem.location,
        mediaItem.equipment,
        mediaItem.media_type,
        mediaItem.media_id
      );
    });
    console.log({ mediaObjectList });
    return mediaObjectList;
  };

  render() {
    return (
      <div id="query-builder">
        <pre>{formatQuery(this.state.query, 'sql')}</pre>
        <QueryBuilder
          fields={qFields}
          onQueryChange={(q) => this.setState({ query: q })}
          query={this.state.query}
          autoSelectField
          disabled={!this.state.fieldsFetched}
          showLockButtons
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => this.queryStreams()}
        >
            Query Database
        </Button>
        <div>
          {this.state.returnedStreams.length} stream(s) match your query
        </div>

        <div>
          <Button
            variant="outlined"
            color="success"
            onClick={() => this.addStreamsToView()}
            disabled={this.state.returnedStreams.length === 0}
          >
            <strong>ADD</strong>&nbsp;matched streams to View
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => this.removeStreamsToView()}
            disabled={this.state.returnedStreams.length === 0}
          >
            <strong>REMOVE</strong>&nbsp;matched streams from View
          </Button>
        </div>
      </div>
    );
  }
}

export default QueryController;
