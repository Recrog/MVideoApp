var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@ffmpeg-installer/ffmpeg/lib/verify-file.js
var require_verify_file = __commonJS({
  "node_modules/@ffmpeg-installer/ffmpeg/lib/verify-file.js"(exports2, module2) {
    var fs2 = require("fs");
    function verifyFile(file) {
      try {
        var stats = fs2.statSync(file);
        return stats.isFile();
      } catch (ignored) {
        return false;
      }
    }
    module2.exports = verifyFile;
  }
});

// node_modules/@ffmpeg-installer/ffmpeg/package.json
var require_package = __commonJS({
  "node_modules/@ffmpeg-installer/ffmpeg/package.json"(exports2, module2) {
    module2.exports = {
      name: "@ffmpeg-installer/ffmpeg",
      version: "1.1.0",
      main: "index.js",
      scripts: {
        lint: "jshint *.js",
        preversion: "npm run lint",
        types: "tsc",
        preupload: "npm run types",
        upload: "npm --userconfig=.npmrc publish --access public",
        test: "tsd"
      },
      types: "types/index.d.ts",
      keywords: [
        "ffmpeg",
        "binary",
        "installer",
        "audio",
        "sound"
      ],
      author: "Kristoffer Lund\xE9n <kristoffer.lunden@gmail.com>",
      license: "LGPL-2.1",
      description: "Platform independent binary installer of FFmpeg for node projects",
      optionalDependencies: {
        "@ffmpeg-installer/darwin-arm64": "4.1.5",
        "@ffmpeg-installer/darwin-x64": "4.1.0",
        "@ffmpeg-installer/linux-arm": "4.1.3",
        "@ffmpeg-installer/linux-arm64": "4.1.4",
        "@ffmpeg-installer/linux-ia32": "4.1.0",
        "@ffmpeg-installer/linux-x64": "4.1.0",
        "@ffmpeg-installer/win32-ia32": "4.1.0",
        "@ffmpeg-installer/win32-x64": "4.1.0"
      },
      devDependencies: {
        jshint: "^2.9.3",
        tsd: "^0.14.0",
        typescript: "^4.2.3"
      },
      repository: {
        type: "git",
        url: "git+https://github.com/kribblo/node-ffmpeg-installer.git"
      },
      bugs: {
        url: "https://github.com/kribblo/node-ffmpeg-installer/issues"
      },
      homepage: "https://github.com/kribblo/node-ffmpeg-installer#readme"
    };
  }
});

// node_modules/@ffmpeg-installer/ffmpeg/index.js
var require_ffmpeg = __commonJS({
  "node_modules/@ffmpeg-installer/ffmpeg/index.js"(exports2, module2) {
    "use strict";
    var os2 = require("os");
    var path2 = require("path");
    var verifyFile = require_verify_file();
    var platform = os2.platform() + "-" + os2.arch();
    var packageName = "@ffmpeg-installer/" + platform;
    if (!require_package().optionalDependencies[packageName]) {
      throw "Unsupported platform/architecture: " + platform;
    }
    var binary = os2.platform() === "win32" ? "ffmpeg.exe" : "ffmpeg";
    var topLevelPath = path2.resolve(__dirname.substr(0, __dirname.indexOf("node_modules")), "node_modules", "@ffmpeg-installer", platform);
    var npm3Path = path2.resolve(__dirname, "..", platform);
    var npm2Path = path2.resolve(__dirname, "node_modules", "@ffmpeg-installer", platform);
    var topLevelBinary = path2.join(topLevelPath, binary);
    var npm3Binary = path2.join(npm3Path, binary);
    var npm2Binary = path2.join(npm2Path, binary);
    var topLevelPackage = path2.join(topLevelPath, "package.json");
    var npm3Package = path2.join(npm3Path, "package.json");
    var npm2Package = path2.join(npm2Path, "package.json");
    var ffmpegPath2;
    var packageJson;
    if (verifyFile(npm3Binary)) {
      ffmpegPath2 = npm3Binary;
      packageJson = require(npm3Package);
    } else if (verifyFile(npm2Binary)) {
      ffmpegPath2 = npm2Binary;
      packageJson = require(npm2Package);
    } else if (verifyFile(topLevelBinary)) {
      ffmpegPath2 = topLevelBinary;
      packageJson = require(topLevelPackage);
    } else {
      throw 'Could not find ffmpeg executable, tried "' + npm3Binary + '", "' + npm2Binary + '" and "' + topLevelBinary + '"';
    }
    var version = packageJson.ffmpeg || packageJson.version;
    var url2 = packageJson.homepage;
    module2.exports = {
      path: ffmpegPath2,
      version,
      url: url2
    };
  }
});

// electron-src/main.ts
var import_electron = require("electron");
var import_node_path = __toESM(require("node:path"), 1);
var import_node_url = __toESM(require("node:url"), 1);
var import_promises = __toESM(require("node:fs/promises"), 1);
var import_node_os = __toESM(require("node:os"), 1);
var import_node_child_process = require("node:child_process");
var import_ffmpeg = __toESM(require_ffmpeg(), 1);
var mainWindow = null;
async function createWindow() {
  mainWindow = new import_electron.BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: import_node_path.default.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    await mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    const indexHtml = import_node_url.default.pathToFileURL(import_node_path.default.join(__dirname, "../dist/index.html")).toString();
    await mainWindow.loadURL(indexHtml);
  }
  import_electron.globalShortcut.register("F4", () => {
    mainWindow?.webContents.send("toggle-record");
  });
}
import_electron.app.whenReady().then(createWindow);
import_electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    import_electron.app.quit();
  }
});
import_electron.app.on("activate", () => {
  if (import_electron.BrowserWindow.getAllWindows().length === 0) createWindow();
});
import_electron.ipcMain.handle("dialog:openFiles", async (_e, filters) => {
  const res = await import_electron.dialog.showOpenDialog({ properties: ["openFile", "multiSelections"], filters });
  return res.canceled ? [] : res.filePaths;
});
import_electron.ipcMain.handle("fs:saveTempBlob", async (_e, buffer, ext) => {
  const dir = await import_promises.default.mkdtemp(import_node_path.default.join(import_node_os.default.tmpdir(), "promo-"));
  const file = import_node_path.default.join(dir, `capture_${Date.now()}.${ext.replace(/^\./, "")}`);
  await import_promises.default.writeFile(file, Buffer.from(buffer));
  return file;
});
import_electron.ipcMain.handle("ffmpeg:exportTimeline", async (_e, items) => {
  const dir = await import_promises.default.mkdtemp(import_node_path.default.join(import_node_os.default.tmpdir(), "promo-export-"));
  const out = import_node_path.default.join(dir, "export.mp4");
  const imageInputs = items.filter((i) => i.type === "image");
  const audio = items.find((i) => i.type === "audio");
  const listPath = import_node_path.default.join(dir, "list.txt");
  const lines = imageInputs.map((it) => `file '${it.path.replace(/'/g, "'\\''")}'
duration 3`).join("\n");
  await import_promises.default.writeFile(listPath, lines + "\n");
  const args = [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listPath
  ];
  if (audio) {
    args.push("-i", audio.path);
  }
  args.push(
    "-vf",
    "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black",
    "-r",
    "30",
    "-pix_fmt",
    "yuv420p"
  );
  if (audio) {
    args.push("-shortest");
  }
  args.push(out);
  await new Promise((resolve, reject) => {
    const child = (0, import_node_child_process.spawn)(import_ffmpeg.default.path, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error("ffmpeg failed")));
  });
  return out;
});
//# sourceMappingURL=main.js.map
