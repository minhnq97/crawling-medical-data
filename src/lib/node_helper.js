const mongoose = require("mongoose");
const get_uuid = require("uuid").v1;
const os = require("os");
const fs = require("fs");
const { exec } = require("child_process");
const crypto = require("crypto");
const path = require("path");
const parserCMD = require("minimist");
const { MyError } = require("./error");
const { config } = require("../config");

const NodeHelper = {
  async runCmd(cmd) {
    return new Promise((resolve, reject) => {
      exec(cmd, async (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          return reject(MyError.ServerError(`cant start '${cmd}' ${err}`, err));
        }

        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        return resolve(stdout);
      });
    });
  },

  async wait(milisecond) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, milisecond);
    });
  },
  getNewMongoId() {
    return new mongoose.Types.ObjectId();
  },
  getNewUuid() {
    return get_uuid();
  },
  getSliceStringWithWord(yourString, maxLength = 30, options = {}) {
    if (typeof yourString !== "string") {
      return "";
    }
    let { add3dot = false, separator = " " } = options;
    if (yourString.length <= maxLength) {
      return yourString;
    } else {
      if (add3dot) {
        return yourString.substr(0, yourString.lastIndexOf(separator, maxLength)) + "...";
      }
      return yourString.substr(0, yourString.lastIndexOf(separator, maxLength));
    }
  },
  getAllCmdParams() {
        return parserCMD(process.argv.slice(2));
    },
  getFileExtension(filepath) {
    return filepath.split(".").pop();
  },
  getSecondsFromDuration(str) {
    // hh:mm:ss
    let a = str.split(":"); // split it at the colons
    return +a[0] * 60 * 60 + +a[1] * 60 + +a[2];
  },
  checkFileExists(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        //file exists
        return true;
      }
    } catch (err) {
      return false;
    }
  },
  getSha1(text) {
    const key = "secretkeyxx";
    return crypto.createHmac("sha1", key).update(text).digest("hex");
  },
  randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },
  getPathFromProject(...relativePath) {
    return path.join(config.PROJECT_DIR, ...relativePath);
  },

  async isAccessAblePath(input_path) {
    let accessAble = true;
    try {
      await fs.promises.access(input_path);
    } catch (err) {
      accessAble = false;
    }
    return accessAble;
  },

  mathGetMeanAndStd(array) {
    const n = array.length;
    const mean = array.reduce((a, b) => a + b) / n;
    const std = Math.sqrt(array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
    return { mean, std };
  },

  systemShowStatus() {
    console.log("process.env.NODE_ENV: ", process.env.NODE_ENV);
    console.table([
      {
        memoryUsage: Math.round((process.memoryUsage().heapUsed / (1024 * 1024)) * 100) / 100 + " mb",
        // cpus:os .cpus(),
        totalmem: Math.round((os.totalmem() / (1024 * 1024)) * 100) / 100 + " mb",
        freemem: Math.round((os.freemem() / (1024 * 1024)) * 100) / 100 + " mb",
      },
    ]);
  },
  getFileName(fullPath) {
    if (typeof fullPath === "string") {
      return fullPath.replace(/^.*[\\\/]/, "");
    }
    return "";
  },
};

module.exports = { NodeHelper };
