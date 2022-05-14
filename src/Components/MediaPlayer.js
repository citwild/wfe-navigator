// TODO: 
// separate d3 into react lifecycles

import React, { Component } from 'react';
import ReactPlayer from 'react-player';

// Class objects
import Media from '../Classes/Media.js';
import Stream from '../Classes/Stream.js';

const rootDir = "C:/Users/Irene/Desktop/BeamCoffer/";

class MediaPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: null,
      sourceObject: new Media(),
      // pip: false,
      playing: false,
      controls: false,
      // light: false,
      volume: 0.8,
      muted: false,
      played: 0,
      loaded: 0,
      duration: 0,
      playbackRate: 1.0,
      loop: false,
      progressInterval: 1000
    };
    // this.player = React.createRef();
  }

  componentDidMount() {
    
  }

  componentDidUpdate() {
  }

  componentWillUnmount() {
  }

  // load = (url) => {
  //   this.setState({
  //     url,
  //     played: 0,
  //     loaded: 0,
  //     pip: false
  //   })
  // }

  handlePlayPause = () => {
    this.setState({ playing: !this.state.playing })
  }

  handleStop = () => {
    this.setState({ url: null, playing: false })
  }

  handleToggleControls = () => {
    const url = this.state.url
    this.setState({
      controls: !this.state.controls,
      url: null
    }, () => this.load(url))
  }

  // handleToggleLight = () => {
  //   this.setState({ light: !this.state.light })
  // }

  // handleToggleLoop = () => {
  //   this.setState({ loop: !this.state.loop })
  // }

  handleVolumeChange = e => {
    this.setState({ volume: parseFloat(e.target.value) })
  }

  handleToggleMuted = () => {
    this.setState({ muted: !this.state.muted })
  }

  handleSetPlaybackRate = e => {
    this.setState({ playbackRate: parseFloat(e.target.value) })
  }

  handleOnPlaybackRateChange = (speed) => {
    this.setState({ playbackRate: parseFloat(speed) })
  }

  // handleTogglePIP = () => {
  //   this.setState({ pip: !this.state.pip })
  // }

  handlePlay = () => {
    console.log('onPlay')
    this.setState({ playing: true })
  }

  // handleEnablePIP = () => {
  //   console.log('onEnablePIP')
  //   this.setState({ pip: true })
  // }

  // handleDisablePIP = () => {
  //   console.log('onDisablePIP')
  //   this.setState({ pip: false })
  // }

  handlePause = () => {
    console.log('onPause')
    this.setState({ playing: false })

    var seekPosition = this.findSeekPosition(this.state.sourceObject, this.props.masterTime);
    this.player.seekTo(seekPosition, "seconds")
    
  }

  handleSeekMouseDown = e => {
    this.setState({ seeking: true })
  }

  handleSeekChange = e => {
    this.setState({ played: parseFloat(e.target.value) })
  }

  handleSeekMouseUp = e => {
    this.setState({ seeking: false })
    this.player.seekTo(parseFloat(e.target.value))
  }

  handleProgress = state => {
    console.log('onProgress', state)
    // We only want to update time slider if we are not currently seeking
    // var newTime = state.playedSeconds*1000 + this.state.sourceObject.startTime;
    // this.props.updateMasterTime(newTime);

    if (!this.state.seeking) {
      this.setState(state)
    }
  }

  handleEnded = () => {
    console.log('onEnded')
    this.setState({ 
      // playing: this.state.loop,
      sourceObject: null
    })
  }

  handleDuration = (duration) => {
    console.log('onDuration', duration)
    this.setState({ duration })
  }

  // renderLoadButton = (url, label) => {
  //   return (
  //     <button onClick={() => this.load(url)}>
  //       {label}
  //     </button>
  //   )
  // }

  ref = (player) => {
    this.player = player;
  }

  setURL = () => {
    var str = this.props.stream.getMediaAtTime(this.props.masterTime);
    if (str !== null) {
      var currentSource = str.getSource();
      console.log({currentSource});
      this.setState({ url: currentSource });
    } else {
      this.setState({ url: null });
    }

  }

  static getDerivedStateFromProps(nextProps, prevState) {
    var sourceAtNewMasterTime = nextProps.stream.getMediaAtTime(nextProps.masterTime);
    if(sourceAtNewMasterTime !== prevState.sourceObject){
      //Change in props
      if(sourceAtNewMasterTime !== null) {
        return {
          url: rootDir + sourceAtNewMasterTime.getSource(),
          sourceObject: sourceAtNewMasterTime
        };
      } else {
        return {
          url: null,
          sourceObject: null
        };
      }
      
    }
    return null; // No change to state
  }

  findSeekPosition = () => {
    // mediaObject must not be NULL 
    if (this.state.sourceObject == null) {
      return 0;
    }
    var secondsFromStart = this.props.masterTime - this.state.sourceObject.startTime;
    console.log(secondsFromStart / 1000);
    return secondsFromStart / 1000;
  }

  Player = () => {
    // this.player.seekTo(seekPosition, "seconds")
    
    return (
      <React.Fragment>
        <button onClick={() => this.player.seekTo(this.findSeekPosition(), "seconds")}>seek test</button>
        <ReactPlayer
          ref={this.ref}
          className='react-player'
          width='100%'
          height='144px'
          url={this.state.url}
          // pip={this.state.pip}
          playing={this.state.playing}
          controls={this.state.controls}
          // light={this.state.light}
          loop={this.state.loop}
          playbackRate={this.state.playbackRate}
          volume={this.state.volume}
          muted={this.state.muted}
          onReady={() => console.log('onReady')}
          onStart={() => console.log('onStart')}
          onPlay={this.handlePlay}
          // onEnablePIP={this.handleEnablePIP}
          // onDisablePIP={this.handleDisablePIP}
          onPause={this.handlePause}
          onBuffer={() => console.log('onBuffer')}
          onPlaybackRateChange={this.handleOnPlaybackRateChange}
          onSeek={e => console.log('onSeek', e)}
          onEnded={this.handleEnded}
          onError={e => console.log('onError', e)}
          onProgress={this.handleProgress}
          onDuration={this.handleDuration}
        />
        <button onClick={this.handlePlayPause}>toggle play</button>
        <button onClick={this.handleToggleMuted}>toggle mute</button>
      {/* <button onClick={() => this.props.removeVideo(this.props.videoInfo.id)}>remove video</button> */}

      </React.Fragment>

    );
  }

  NoMedia = () => {
    return (
      <React.Fragment>
        <span style={{ backgroundColor: 'black', color: 'white', textAlign: 'center', width: '240px'}}>[ no media to display ] </span>
      </React.Fragment>
    );
    
  }


  render() {
    // access through {this.props.videoInfo}
    // console.log(this.state.sourceObject == null ? "no" : this.state.sourceObject.getSource());
    <div>Master time = {this.props.masterTime} | URL state = {this.state.url}</div>
    return (
      <div className='player-wrapper' style={{display: 'inline-block', marginLeft: '2px',  padding: 2}}>
        {this.props.stream.getLocation()}<br/>
        {this.props.stream.getMediaAtTime(this.props.masterTime) === null ?
        <this.NoMedia/> :
        <this.Player/>}
      </div>
      );
  }
}

export default MediaPlayer
