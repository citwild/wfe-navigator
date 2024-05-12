# wfe-navigator (Wide-Field Ethnography Navigator)
A standalone cross-platform system for navigating large, multi-modal, multi-stream datasets with 
large numbers (e.g., hundreds or thousands) or video, auidio, image, and other types of media files,
such as the BeamCoffer dataset https://sites.uw.edu/socha/beamcoffer-dataset/.

# How to run
## Build 🛠
To build for your current OS, you would need to clone the repository, install node modules into your local clone, and package the application as follow: 
1. Clone the repository
2. Install node modules at the first level of the repository 
```terminal
cd wfe-navigator
npm install
```
3. **For MacOS**, you may need to install the `dmg-license` node module as well. This is included as an [optional dependency](https://github.com/electron-userland/electron-builder/issues/6489), because it is only required for MacOS
```terminal
npm install dmg-license
```
4. Install native node modules at `wfe-navigator/release/app` (see [native modules](https://electron-react-boilerplate.js.org/docs/native-modules))
```terminal
cd wfe-navigator/release/app
npm install
```
5. At the first level of the repository, package the application
```terminal
cd wfe-navigator
npm run package
```
6. Find the packaged application installer at `wfe-navigator/release/app/build`


## Configuration file ⚙
When the application starts, user will be prompted with a dialog to select a wfe-navigator configuration file.

config file must use the `.config.wfen` extension, and uses the following format:
```js
{
  "database": {
    "filePath": "C:/path/to/database.db",  //escape each backslash
    "client": "sqlite3"
  },
  "media": {
    "directoryPath": "C:/path/to/media/directory",
    "fileConfig": [                 
      {
        "fileProp": "media_type",   //name of property to be compared
        "propValue": "video",       //value of aforementioned property
        "prefix": "",               //prefix to add to base_name
        "suffix": "-320"            //suffix to add to base_name
      },
      {
        "fileProp": "media_type",
        "propValue": "audio",
        "prefix": "",
        "suffix": "-64",
        "ext" : "mp3"               //extension of actual media file if different from specified in the database
      }
    ]
  },
  "querybuilder" : {
    "fields" : []   //follows queryBuilder's format
  }
}
```
where the **querybuilder** object can be specified following this [format](https://react-querybuilder.js.org/docs/api/valueeditor#example), and **fileConfig** object specifies the actual file path/name/type for the player to read if different from that in the database. This specification must be done conditionally, 

i.e.
```
  {
    "fileProp": "media_type",
    "propValue": "audio",
    "prefix": "",
    "suffix": "-compressed"
  }
```
is equivalent to adding `-compressed` to the end of the file name for every file with `media_type` value of `audio`.


## View file 🔬
`.view.wfen` extension
