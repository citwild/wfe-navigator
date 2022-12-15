# wfe-navigator
A web-based system for navigating large, multi-modal, multi-stream datasets with 
large numbers (e.g., hundreds or thousands) or video, auidio, image, and other types of media files,
such as the BeamCoffer dataset https://sites.uw.edu/socha/beamcoffer-dataset/.

# How to run
## Build
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


## Configuration file
When the application starts, user will be prompted with a dialog to select a wfe-navigator configuration file.

config file must use the `.config.wfen` extension, and uses the following format:
```js
{
  "database": {
    "filePath": "C:/path/to/database.db",  // if path contains backslash, make sure to escape each backslash
    "client": "sqlite3"
  },
  "media": {
    "directoryPath": "C:/path/to/media/directory"
  },
  "querybuilder" : {
    "fields" : []   //follows queryBuilder's format
  }
}
```
where the query builder's fields can be specified following this [format](https://react-querybuilder.js.org/docs/api/valueeditor#example)
