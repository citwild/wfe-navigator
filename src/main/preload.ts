const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    // whitelist channels
    const validChannels = [
      'toMain',
      'getFiles',
      'reqFileInDir',
      'queryStreams',
      'findMediaInStream',
      'getMediaDir',
    ];

    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  sendSync: (channel, data) => {
    const validChannels = [
      'getQueryFields',
      'getMediaFileConfig',
      'doesFileExist'
    ];

    if (validChannels.includes(channel)) {
      // Strip event as it includes `sender`
      return ipcRenderer.sendSync(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = [
      'fromMain',
      'sendFiles',
      'selectFileInDir',
      'foundStreams',
      'allMediaInStream',
      'mediaDir',
    ];

    if (validChannels.includes(channel)) {
      // Strip event as it includes `sender`
      ipcRenderer.once(channel, (event, ...args) => func(...args));
    }
  },
  receiveAsPromise: (channel, data) => {
    const validChannels = [
      'getStreamContents',
    ];

    if (validChannels.includes(channel)) {
      // Strip event as it includes `sender`
      console.log('invoke api');
      return ipcRenderer.invoke(channel, data);
    }
  },
});
