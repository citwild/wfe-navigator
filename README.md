# wfe-navigator
A web-based system for navigating large, multi-modal, multi-stream datasets with 
large numbers (e.g., hundreds or thousands) or video, auidio, image, and other types of media files,
such as the BeamCoffer dataset https://sites.uw.edu/socha/beamcoffer-dataset/.

# How to run
## Configuration file
When the application starts, user will be prompted with a dialog to select a wfe-navigator configuration file.

config file must use `.config.wfen` extension
```js
{
  "database": {
    "filePath": "C:/path/to/database.db",     // if path contains backslash, make sure to escape each backslash
    "client": "sqlite3"
  },
  "media": {
    "directoryPath": "C:/path/to/media/directory"
  }
}
```