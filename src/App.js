import './App.css';
import React, { Component } from 'react';
import * as d3 from 'd3';
import * as d3Slider from 'd3-simple-slider';

//Components
import ReactPlayerVideo from './Components/ReactPlayerVideo.js';
import RepBar from './Components/RepBar.js';
// Class objects
import Video from './Classes/Video.js';
import Stream from './Classes/Stream.js';


class App extends Component {
  constructor() {
    super();
    this.state = {
      masterSlider: {
        minTime: 0,
        maxTime: 0,
        
        // playTimeline: false
      },
      masterTime: 0,
      streams: [],
      localFiles: []
    };
  }


  componentDidMount() {
    // console.log(this.state.streams);
    this.createMasterSlider();
    this.updateMasterSliderRange();

    // this.dbTest();
  }

  // dbTest = () => {
  //   const db = new Database('.\..\BeamCoffer\BeamCoffer_meta.db', { fileMustExist: true, readonly: true, verbose: console.log });


  //   // const fields = "id, startTime, endTime";
  //   // const table = "media data";
  //   // const condition = ["location == Hub", "equipment == zoom"]
  //   // const allConditions = condition.join(" AND ");

  //   // let qry = [];
  //   // qry.push("SELECT");
  //   // qry.push(fields);
  //   // qry.push("FROM");
  //   // qry.push(table);
  //   // qry.push("WHERE");
  //   // qry.push(allConditions);

  //   // // const statement = qry.join(" ");

  //   const statement = "SELECT * FROM media_files";

  //   const stmt = db.prepare(statement);

  //   const result = stmt.all();
  //   console.log(result);
  // }


  addStream1 = () => {
    var stream = new Stream("2017-03-15", "PS A", "gopro");
    stream.addMedia(new Video(1, 50,"source", "vid1",  "2017-03-15", "PS A", "gopro"));
    stream.addMedia(new Video(57, 203,"source", "vid2",  "2017-03-15", "PS A", "gopro"));
    stream.addMedia(new Video(220, 460,"source", "vid3",  "2017-03-15", "PS A", "gopro"));

    this.setState({
      streams: [...this.state.streams, stream]
    }, () => {
      this.updateMasterSliderRange();    
    });
  }
  
  addStream2 = () => {
    var stream = new Stream("2017-03-15", "PS B", "gopro");
    stream.addMedia(new Video(10, 20,"source", "vid1",  "2017-03-15", "PS A", "gopro"));
    stream.addMedia(new Video(23, 45,"source", "vid2",  "2017-03-15", "PS A", "gopro"));
    stream.addMedia(new Video(30, 35,"source", "vid3",  "2017-03-15", "PS A", "gopro"));
    stream.addMedia(new Video(74, 250,"source", "vid3",  "2017-03-15", "PS A", "gopro"));
    stream.addMedia(new Video(251, 400,"source", "vid3",  "2017-03-15", "PS A", "gopro"));

    this.setState({
      streams: [...this.state.streams, stream]
    }, () => {
      this.updateMasterSliderRange();    
    });
  }

  addStream3 = () => {
    var stream = new Stream("2017-03-15", "Hub", "gopro");
    stream.addMedia(new Video(20, 345,"source", "vid1",  "2017-03-15", "PS A", "gopro"));
    stream.addMedia(new Video(375, 566,"source", "vid2",  "2017-03-15", "PS A", "gopro"));
    this.setState({
      streams: [...this.state.streams, stream]
    }, () => {
      this.updateMasterSliderRange(); 
    });
  }

  // execute every time a video is added
  updateMasterSliderRange = () => {
    var getAllMins = this.state.streams.map( (thisStream) => thisStream.getEarliestTime() );
    var getAllMaxs = this.state.streams.map( (thisStream) => thisStream.getLatestTime() );
    var newMin = d3.min(getAllMins);
    var newMax = d3.max(getAllMaxs);
    console.log("MIN/MAX: " + newMin + "-" + newMax);
    this.setState({
      masterSlider: {
        minTime: newMin,
        maxTime: newMax
      }
    });
  }

  updateMasterTime = (newMasterTime) => {
    this.setState({
      masterTime: newMasterTime
    });
  }

  addPlayerRef = (videoID, endTimeMS) => {
    console.log("adding player ref of id " + videoID + " and endTime of " + endTimeMS);
    //add player reference, and endtime when they are created in the child component
    this.setState(prevState => ({
      videos: prevState.videos.map((vid) => {
        if (vid.id === videoID) {
          return {
            ...vid, 
            endTime: endTimeMS
          }
        }
        return vid; 
      })
    }));
    // this.updateMasterSliderRange();
  }

  createMasterSlider = () => {
    console.log('creating master slider...');
    d3.select("#master-slider > svg").remove();

    const sliderHeight = 50;
    const sliderWidth = 800;

    // var linearScale = d3.scaleLinear()
    //   .domain([0, 24])
    //   .range([0, 500]);
    
    var slider = d3Slider
      .sliderTop()
      .min(this.state.masterSlider.minTime)
      .max(this.state.masterSlider.maxTime)
      .step(1)
      .default(this.state.masterTime)
      .width(sliderWidth)
      .displayValue(false)
      .on('onchange', (val) => {
        // d3.select('#value').text(new Date(val));
        d3.select('#value').text(val);
        
      })
      .on('end', (value) => {
        this.updateMasterTime(value);
      });;

    var g = d3
      .select('#master-slider')
      .append('svg')
      .attr('width', sliderWidth + 20)
      .attr('height', sliderHeight)
      .append('g')
      .attr('transform', 'translate(10,40)');
    
    g.call(slider);
  }


  selectVideo = (event) => {
    var files = event.target.files; // FileList object
    this.setState({
      localFiles: files
    });
  }


  // TODO: iterate through all files to add 
  addVideo = () => {
    console.log(this.state.localFiles);
    if (this.state.localFiles.length !== 0){
      // this.setState({image: URL.createObjectURL(e.target.files[0])})
      var currentVidCount = this.state.videoCount;
      var newVideos = []
      //cannot use .map() or .forEach() here due to type error
      for (var eachFile of this.state.localFiles) {
        var fileURL = URL.createObjectURL(eachFile);
        console.log(fileURL);
        var blob = {
          id: ++currentVidCount,
          title: eachFile.name,
          src: fileURL.toString(),
          type: eachFile.type,
          startTime: 1644862500000,
          endTime: 1644862500000,
          playerRef: React.createRef()
        }
        newVideos.push(blob);
      }     
      var joined = this.state.videos.concat(newVideos);
      this.setState({
        videos: joined,
        videoCount: currentVidCount
      });
    }
    this.clearSelectedFiles();
  }


  stopAllPlayers = () => {}


  removeVideo = (videoID) => {
    // when remove video when playing, next video player plays 
    console.log('removing videoID ' + videoID);
    const updated = this.state.videos.filter(vid => vid.id !== videoID);
    this.setState({
      videos: updated
    });
  }

  // NOTE: work with forEach loop 
  displaySelectedFile = (f) => {
    return (
      <li><strong>{f.name}</strong> ({f.type || 'n/a'}) - {(f.size/1048576).toFixed(2)} MB</li>
    );
  }


  clearSelectedFiles = () => {
    this.setState({ localFiles: [] });
  }


  togglePlayAll = () => {
    // Calling ReactPlaterVideo component method
    this.state.videos.map(vid => vid.playerRef.current.handlePlayPause());
  }

  
  render() {
    // 1,000 ms = 1 sec
    // 60,000 ms = 1 min
    // 3,600,000 ms = 1 hr
    // 86,400,000 ms = 1 day
    // 31,536,000,000 ms = 1 yr (365 days)... not sure how to account leap year

    // files is a FileList of File objects. List some properties.

    var output = [];
    if (this.state.localFiles.length !== 0) {
      for (var f of this.state.localFiles) {
        output.push(this.displaySelectedFile(f));
      }
    }

    this.createMasterSlider();
    console.log(this.state.masterSlider.minTime + "< >" + this.state.masterSlider.maxTime);

    console.log("currtime = " + this.state.masterTime);
    console.log('running render');
    // this.createSlider();
    return (
      <div style={{padding: 50}}>
        
        <div>
          <h2>masterSlider</h2>
          <div id="value">slider value</div>
          <div id='master-slider'></div>
        </div>
        <div>

          {this.state.streams.map( (thisStream) => {

            var keyGen = [
              thisStream.getDate(), 
              thisStream.getLocation(), 
              thisStream.getEquipment()
            ];

            return (
              <RepBar 
                key = {keyGen.join('|')}
                str = {thisStream}
                overallStartTime = {this.state.masterSlider.minTime}
                overallEndTime = {this.state.masterSlider.maxTime}
                masterTime = {this.state.masterTime}
              />
            );
          })}

        </div>
            
        <div>
          <button onClick={this.addStream1}>Click to add Stream #1</button>
          <button onClick={this.addStream2}>Click to add Stream #2</button>
          <button onClick={this.addStream3}>Click to add Stream #3</button>
        </div>

        <div>
          
          <h1>query filters</h1>
          <form action="#" method="post" className="query" id="query-fields">
            <div>
              <h3>location</h3>
              <p><label><input type="checkbox" name="location[]" value="PS A" />PS A</label></p>
              <p><label><input type="checkbox" name="location[]" value="Hub" />Hub</label></p>
            </div>

            <div>
              <h3>equipment</h3>
              <p><label><input type="checkbox" name="equipment[]" value="GoPro" />GoPro</label></p>
              <p><label><input type="checkbox" name="equipment[]" value="Zoom" />Zoom</label></p>
            </div>

            <div>
              <h3>date</h3>
              <p><label><input type="checkbox" name="date[]" value="2014-03-19" />2014-03-19</label></p>
              <p><label><input type="checkbox" name="date[]" value="2014-03-20" />2014-03-20</label></p>
            </div>
            
          </form>
          <h2>query result</h2>
        
        
        </div>
        
      
        {/* <h2>File Import</h2>
        <input 
          type="file" 
          id="files" 
          name="files[]" 
          style={{color: 'transparent'}} 
          multiple 
          onChange={this.selectVideo}
          onClick={(event)=> {event.target.value = null}}
        />
        <div id="list">
          <ul>{output}</ul>
        </div>
        <button onClick={this.addVideo}>IMPORT video</button>
        <button onClick={this.clearSelectedFiles}>cancel import</button>
        <h2>videos</h2> */}


        {/* <p><button onClick={this.togglePlayAll}>toggle play ALL</button></p> */}
        {/* {this.state.videos.map( (thisVid) => <ReactPlayerVideo 
          key = {thisVid.id}
          ref = {thisVid.playerRef}
          videoInfo = {thisVid} 
          masterSlider = {this.state.masterSlider}
          addPlayerRef = {this.addPlayerRef}
          removeVideo = {this.removeVideo}
          />
        )} */}
        
        
      </div>
    );
  }
}

export default App
