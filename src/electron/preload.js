const { contextBridge, ipcRenderer } = require("electron");
console.log("preload.js");

contextBridge.exposeInMainWorld(
  "api", {
    send: (channel, data) => {
        // whitelist channels
        let validChannels = ["toMain", "getFiles"];

        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        let validChannels = ["fromMain", "sendFiles"];

        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender` 
            ipcRenderer.once(channel, (event, ...args) => func(...args)); 
        }
    }
  }
);
