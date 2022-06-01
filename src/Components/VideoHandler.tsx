//@ts-nocheck

// Libraries
import React, { Component } from 'react';
import ReactPlayer from 'react-player';

// Class objects
import Media from '../Classes/Media';

const rootDir = "C:/Users/Irene/Desktop/BeamCoffer/";


interface IProps {
  media:            Media,
  url:              string,
  masterTime:       number,
  updateMasterTime: any
}

interface IState {
  url:          string | null,
  pip:          boolean,
  playing:      boolean,
  controls:     boolean,
  light:        boolean,
  volume:       number,
  muted:        boolean,
  played:       number,
  loaded:       number,
  duration:     number,
  playbackRate: number,
  loop:         boolean,
  seeking:      boolean,
  lastPlayed:   number | null
}


type playerRef = HTMLInputElement;

/////////////////////////////////////////////////////////////

class VideoHandler extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      url: null,
      pip: false,
      playing: false,
      controls: false,
      light: false,
      volume: 0.8,
      muted: false,
      played: 0,
      loaded: 0,
      duration: 0,
      playbackRate: 1.0,
      loop: false,
      seeking: false,
      lastPlayed: null
    }
    this.playerRef = React.createRef();
  }


  handlePlayPause = () => {
    this.setState({ playing: !this.state.playing })
  }

  handleStop = () => {
    this.setState({ url: null, playing: false })
  }

  // handleToggleControls = () => {
  //   const url = this.state.url
  //   this.setState({
  //     controls: !this.state.controls,
  //     url: null
  //   }, () => this.load(url))
  // }

  handleToggleLight = () => {
    this.setState({ light: !this.state.light })
  }

  handleToggleLoop = () => {
    this.setState({ loop: !this.state.loop })
  }

  handleVolumeChange = e => {
    this.setState({ volume: parseFloat(e.target.value) })
  }

  handleToggleMuted = () => {
    this.setState({ muted: !this.state.muted })
  }

  handleSetPlaybackRate = e => {
    this.setState({ playbackRate: parseFloat(e.target.value) })
  }

  handleOnPlaybackRateChange = (speed: number) => {
    this.setState({ playbackRate: parseFloat(speed) })
  }

  handleTogglePIP = () => {
    this.setState({ pip: !this.state.pip })
  }

  handlePlay = () => {
    console.log('onPlay')
    this.setState({ playing: true })
  }

  handleEnablePIP = () => {
    console.log('onEnablePIP')
    this.setState({ pip: true })
  }

  handleDisablePIP = () => {
    console.log('onDisablePIP')
    this.setState({ pip: false })
  }

  handlePause = (e: Event) => {
    console.log('onPause')
    this.setState({ playing: false });
    this.syncWithMasterTime();
    // this.player.seekTo(this.findSeekPosition(), "seconds");
    
  }

  syncWithMasterTime = () => {
    this.playerRef.seekTo(this.findSeekPosition(), "seconds");
    this.setState(prevState => ({ lastPlayed: prevState.played }));
  }

  findSeekPosition = () => {
    // this.props.media is never NULL 
    var msFromStart = this.props.masterTime - this.props.media.startTime;
    console.log({msFromStart});
    return msFromStart / 1000;
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

    // remove source video from player 
    this.setState({ url: null });
    
  }

  handleDuration = (duration: number) => {
    console.log('onDuration', duration)
    this.setState({ duration })
  }

  handleReady = () => {
    console.log('onReady');
    if (this.state.lastPlayed !== this.state.played) {
      this.syncWithMasterTime();  
    }
    
  }

  // renderLoadButton = (url, label) => {
  //   return (
  //     <button onClick={() => this.load(url)}>
  //       {label}
  //     </button>
  //   )
  // }

  ref = (player: any) => {
    this.playerRef = player
  }

  //TODO: 
  // after masterTime is updated
  // re-seek video

  // static getDerivedStateFromProps(nextProps, prevState) {
  //   var msFromStart = nextProps.masterTime - nextProps.media.startTime;
  //   console.log("s from start = " +msFromStart);
  //   var playedFraction = parseFloat(msFromStart / 1000 / prevState.duration);
    
  //   return {
  //     played: playedFraction
  //   };
  // }


  
  render() { 
    // console.log(this.state.played, this.state.lastPlayed);
    
    
    return (
      <React.Fragment>
        <div>
          <button className="toggle-play" onClick={this.handlePlayPause}>toggle play</button>
          <button onClick={this.handleToggleMuted}>toggle mute</button>
          <button className="seek" onClick={() => this.playerRef.seekTo(this.findSeekPosition(), "seconds")}>seek</button>
        </div>
        <ReactPlayer
          ref={this.ref}
          className='react-player'
          width='100%'
          height='100%'
          url={rootDir + this.props.media.getSource()}
          pip={this.state.pip}
          playing={this.state.playing}
          controls={this.state.controls}
          light={this.state.light}
          loop={this.state.loop}
          playbackRate={this.state.playbackRate}
          volume={this.state.volume}
          muted={this.state.muted}
          onReady={this.handleReady}
          onStart={() => console.log('onStart')}
          onPlay={this.handlePlay}
          onEnablePIP={this.handleEnablePIP}
          onDisablePIP={this.handleDisablePIP}
          onPause={this.handlePause}
          onBuffer={() => console.log('onBuffer')}
          onPlaybackRateChange={this.handleOnPlaybackRateChange}
          onSeek={e => console.log('onSeek', e)}
          onEnded={this.handleEnded}
          onError={e => console.log('onError', e)}
          onProgress={this.handleProgress}
          onDuration={this.handleDuration}
        />
        
      
        </React.Fragment>
    );
  }
}
 
export default VideoHandler;