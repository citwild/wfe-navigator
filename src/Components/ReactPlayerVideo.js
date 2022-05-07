// TODO: 
// separate d3 into react lifecycles

import React, { Component } from 'react'
import ReactPlayer from 'react-player'


class ReactPlayerVideo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: null,
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
      progressInterval: 1000
    };
    this.player = React.createRef();
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }


  // from ReactPlayer
  handlePlayPause = () => {
    this.setState({ playing: !this.state.playing });
  }

  handleStop = () => {
    this.setState({ url: null, playing: false });
  }

  // handleToggleControls = () => {
  //   const url = this.state.url
  //   this.setState({
  //     controls: !this.state.controls,
  //     url: null
  //   }, () => this.load(url))
  // }

  handleVolumeChange = e => {
    this.setState({ volume: parseFloat(e.target.value) });
  }

  handleToggleMuted = () => {
    this.setState({ muted: !this.state.muted });
  }

  handleSetPlaybackRate = e => {
    this.setState({ playbackRate: parseFloat(e.target.value) });
  }

  handleOnPlaybackRateChange = (speed) => {
    this.setState({ playbackRate: parseFloat(speed) });
  }

  handlePlay = () => {
    console.log('videoID: ', this.props.videoInfo.id, " => ", 'onPlay');
    this.setState({ playing: true });
  }

  handlePause = () => {
    console.log('videoID: ', this.props.videoInfo.id, " => ", 'onPause');
    this.setState({ playing: false });
  }

  handleSeekMouseDown = e => {
    this.setState({ seeking: true });
  }

  handleSeekChange = e => {
    this.setState({ played: parseFloat(e.target.value) });
  }

  handleSeekMouseUp = e => {
    this.setState({ seeking: false });
    this.player.seekTo(parseFloat(e.target.value));
  }

  handleProgress = state => {
    console.log('videoID: ', this.props.videoInfo.id, " => ", 'onProgress', state);
    // We only want to update time slider if we are not currently seeking
    if (!this.state.seeking) {
      this.setState(state);
    }
  }

  handleEnded = () => {
    console.log('onEnded');
    this.setState({ playing: this.state.loop });
  }

  handleDuration = (duration) => {
    console.log('videoID: ', this.props.videoInfo.id, " => ", 'onDuration', duration);
    this.setState({ duration: duration });
    this.props.addPlayerRef(this.props.videoInfo.id, this.props.videoInfo.startTime + (this.state.duration * 1000) );
  }

  ref = (ref) => {
    this.player = ref;
  }


  render() {
    console.log();
    // access through {this.props.videoInfo}
    return (
      <div className='player-wrapper' style={{display: 'inline-block'}}>
        <ReactPlayer
          ref={this.ref}
          id={"player-" + this.props.videoInfo.id}
          className='react-player'
          url={this.props.videoInfo.src}
          width='480px'
          // height='100%'

          stopOnUnmount={true}
          progressInterval={this.state.progressInterval}

          playing={this.state.playing}
          controls={this.state.controls}
          light={this.state.light}
          loop={this.state.loop}
          playbackRate={this.state.playbackRate}
          volume={this.state.volume}
          muted={this.state.muted}
          // onReady={() => console.log('onReady')}
          // onStart={() => console.log('onStart')}
          onPlay={this.handlePlay}
          onPause={this.handlePause}
          // onBuffer={() => console.log('onBuffer')}
          onPlaybackRateChange={this.handleOnPlaybackRateChange}
          onSeek={e => console.log('onSeek', e)}
          onEnded={this.handleEnded}
          onError={e => console.log('onError', e)}
          onProgress={this.handleProgress}
          onDuration={this.handleDuration}
        />
        <button onClick={this.handlePlayPause}>toggle play</button>
        <button onClick={this.handleToggleMuted}>toggle mute</button>
        <button onClick={() => this.props.removeVideo(this.props.videoInfo.id)}>remove video</button>
        <div className="d3bars">
          {/* <BarD3 /> */}
        </div>
      </div>
      );
  }
}

export default ReactPlayerVideo
