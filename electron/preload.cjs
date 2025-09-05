// electron-src/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("api", {
  openFiles: (filters) => import_electron.ipcRenderer.invoke("dialog:openFiles", filters),
  onToggleRecord: (cb) => {
    const listener = () => cb();
    import_electron.ipcRenderer.on("toggle-record", listener);
    return () => import_electron.ipcRenderer.removeListener("toggle-record", listener);
  },
  saveBlob: (buffer, ext) => import_electron.ipcRenderer.invoke("fs:saveTempBlob", buffer, ext),
  exportTimeline: (items) => import_electron.ipcRenderer.invoke("ffmpeg:exportTimeline", items)
});
//# sourceMappingURL=preload.cjs.map
