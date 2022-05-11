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
      // pip: false,
      playing: false,
      controls: false,
      // light: false,
      volume: 0.8,
      muted: false,
      played: 0.5,
      loaded: 0,
      duration: 0,
      playbackRate: 1.0,
      loop: false,
      progressInterval: 1000
    };
    this.player = React.createRef();
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
    if (!this.state.seeking) {
      this.setState(state)
    }
  }

  handleEnded = () => {
    console.log('onEnded')
    this.setState({ playing: this.state.loop })
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
    this.player = player
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
    if(sourceAtNewMasterTime !== prevState.url){
      //Change in props
      if(sourceAtNewMasterTime !== null) {
        return {
          url: sourceAtNewMasterTime.getSource()
        };
      } else {
        return {
          url: null
        };
      }
      
    }
    return null; // No change to state
  }

  Player = () => {
    
    return (
      <React.Fragment>
        {ReactPlayer.canPlay(rootDir + this.state.url) ? 
        <ReactPlayer
          ref={this.ref}
          className='react-player'
          width='100%'
          height='100%'
          url={rootDir + this.state.url}
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
        : <div>{console.log("Master time = " + this.props.masterTime + " | URL state = " +  this.state.url)}</div> }
        {/* <button onClick={this.handlePlayPause}>toggle play</button>
        <button onClick={this.handleToggleMuted}>toggle mute</button> */}
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
    var str = this.props.stream.getMediaAtTime(this.props.masterTime);
    console.log(str == null ? "no" : str.getSource());
    <div>{console.log("Master time = " + this.props.masterTime + " | URL state = " +  this.state.url)}</div>
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
