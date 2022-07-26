//@ts-nocheck

// Libraries
import React, { Component } from 'react';
import ReactPlayer from 'react-player';

// Class objects
import Media from '../Classes/Media';

const rootDir = "C:/Users/Irene/Desktop/BeamCoffer/";


interface IProps {
  keyID:            number,
  media:            Media,
  url:              string,
  masterTime:       number,
  updateMasterTime: any,
  playing:          boolean,
  playbackSpeed:    number,
  muteMedia:        boolean,
  audioContext:     any
}

interface IState {
  url:              string | null,
  pip:              boolean,
  // playing:       boolean,
  controls:         boolean,
  light:            boolean,
  volume:           number,
  // muted:          boolean,
  played:           number,
  loaded:           number,
duration:           number,
  // playbackRate: number,
  loop:             boolean,
  seeking:          boolean,
  lastPlayed:       number | null,
  audioPannerValue: number,
  pannerNode:       any,
}


type playerRef = HTMLInputElement;

/////////////////////////////////////////////////////////////

class VideoHandler extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      url: null,
      pip: false,
      // playing: false,
      controls: false,
      light: false,
      volume: 1,
      // muted: false,
      played: 0,
      loaded: 0,
      duration: 0,
      // playbackRate: 1.0,
      loop: false,
      seeking: false,
      lastPlayed: null,
      audioPannerValue: 0,
      pannerNode: null,
    }
    this.playerRef = React.createRef();
  }

  componentDidMount(): void {
    this.syncWithMasterTime();
    this.setState({ 
      playing: this.props.playing,
      muted: this.props.muteMedia,
      playbackRate: this.props.playbackSpeed
    });    
  }

  componentWillUnmount(): void {
    if (this.state.pannerNode)  {
      this.state.pannerNode.disconnect();
    }

  }

  static getDerivedStateFromProps(nextProps: IProps, prevState: IState): any {
    var newState = {};
    
    if(nextProps.playing !== prevState.playing) {
      newState.playing = nextProps.playing;
    } 
    if(nextProps.muteMedia !== prevState.muted) {
      newState.muted = nextProps.muteMedia;
    } 
    return newState;
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
    // console.log({msFromStart});
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
    // console.log('onProgress', state)
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
    // console.log('onDuration', duration)
    this.setState({ duration })
  }

  handleReady = () => {
    // console.log('onReady');
    if (this.state.lastPlayed !== this.state.played) {
      this.syncWithMasterTime();  
    }
  }

  ref = (player: any) => {
    this.playerRef = player
  }

  pannerControl = (e) => {
    console.log("PAN CONTROL changed");
    // console.log(this.state.pannerNode);
    if (this.state.pannerNode !== null) {
      this.setState({ audioPannerValue: e.target.value });
      this.state.pannerNode.pan.value = this.state.audioPannerValue;
    }
  }

  connectWebAudioAPI = () => {
    console.log("executing... connectWebAudioAPI Method");
    let audioCxt = this.props.audioContext;

    // Create a MediaElementAudioSourceNode
    // Feed the HTMLMediaElement into it\
    const sourceType = this.props.media.mediaType;
    const thisVideoSource = document.querySelector('#player-' + this.props.keyID + ' > div.react-player > ' + sourceType);
    // console.log("VIDEO SOURCE " + thisVideoSource.outerHTML);

    // const panControl = document.querySelector('#panning-control-' + this.props.keyID);
    // const panValue = document.querySelector('.panning-value');

    let source = audioCxt.createMediaElementSource(thisVideoSource);
    this.setState({ pannerSource: source });

    // Create a stereo panner
    let panNode = audioCxt.createStereoPanner();
    console.log(panNode);
    panNode.pan.value = this.state.audioPannerValue;
    this.setState({ pannerNode: panNode });

    // connect the AudioBufferSourceNode to the gainNode
    // and the gainNode to the destination, so we can play the
    // music and adjust the panning using the controls
    source.connect(panNode);
    panNode.connect(audioCxt.destination);
  }
  
  render() { 

    return (
      <React.Fragment>
        <div id={"player-" + this.props.keyID}>
          <div id={"panner-container-" + this.props.keyID}>
            <input id={"panning-control-" + this.props.keyID} type="range" min="-1" max="1" step="0.05" value={this.state.audioPannerValue} onChange={this.pannerControl}></input>
            <label id={"panner-value-" + this.props.keyID}>
            {Math.floor(50 - this.state.audioPannerValue*50) + "%"}/{Math.ceil(this.state.audioPannerValue*50+50) + "%"}
            </label>
          </div>
          {/* <button className="seek" onClick={() => this.playerRef.seekTo(this.findSeekPosition(), "seconds")}>seek</button> */}
          {this.state.playing ? " playing..." : " paused"}
        
        <ReactPlayer
          ref={this.ref}
          className='react-player'
          width='100%'
          height='100%'
          url={rootDir + this.props.media.getSource()}
          pip={this.state.pip}
          playing={this.props.playing}
          controls={this.state.controls}
          light={this.state.light}
          loop={this.state.loop}
          playbackRate={this.props.playbackSpeed}
          volume={this.state.volume}
          muted={this.props.muteMedia}
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
          onLoadedData={this.connectWebAudioAPI}
        />
        </div>
      
        </React.Fragment>
    );
  }
}
 
export default VideoHandler;