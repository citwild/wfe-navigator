const { contextBridge, ipcRenderer } = require("electron");
console.log("preload.js");

contextBridge.exposeInMainWorld(
  "api", {
    send: (channel, data) => {
        // whitelist channels
        let validChannels = ["toMain", "getFiles", "reqFileInDir", "getFields", "queryStreams", "findMediaInStream"];

        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        let validChannels = ["fromMain", "sendFiles", "selectFileInDir", "allFields", "foundStreams", "allMediaInStream"];

        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender` 
            ipcRenderer.once(channel, (event, ...args) => func(...args)); 
        }
    }
  }
);

document.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.receive("allFields", (data) => {

  })

  ipcRenderer.send("getFields", "C:\Users\Irene\source\repos\citwild\src\dbConfig.wfenav.json")

})