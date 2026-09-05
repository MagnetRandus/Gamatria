"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("gamatria", {
  version: "1.0.0"
});
