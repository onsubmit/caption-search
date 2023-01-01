import fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export default class AppConfig {
  private _pathToVideo: string;
  private _extract: boolean;

  constructor() {
    const argv = yargs(hideBin(process.argv))
      .options({
        input: { describe: "Input filename", alias: "i", type: "string" },
        extract: { describe: "Extract", alias: "e", type: "boolean", default: false },
      })
      .parseSync();

    this._pathToVideo = argv.input || "";
    this._extract = argv.extract;
  }

  get pathToVideo(): string {
    return this._pathToVideo;
  }

  get extract(): boolean {
    return this._extract;
  }

  validate = (): this => {
    if (this._extract) {
      if (!this._pathToVideo) {
        console.log("usage: index.js -i {pathToVideo} [-e]");
        throw "No filename";
      }

      if (!fs.existsSync(this._pathToVideo)) {
        throw `No file found at ${this._pathToVideo}`;
      }
    }

    return this;
  };
}
