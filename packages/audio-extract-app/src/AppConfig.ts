import fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export default class AppConfig {
  private _pathToVideos: string;
  private _extensions: string[];

  constructor() {
    const argv = yargs(hideBin(process.argv))
      .options({
        input: { describe: "Input path", alias: "i", type: "string", demandOption: true },
        extensions: { describe: "Extensions", alias: "e", type: "string", demandOption: true },
      })
      .parseSync();

    this._pathToVideos = argv.input;
    this._extensions = argv.extensions.split(",").map((e) => e.toLowerCase());
  }

  get pathToVideos(): string {
    return this._pathToVideos;
  }

  get extensions(): string[] {
    return this._extensions;
  }

  validate = (): this => {
    if (!this._pathToVideos) {
      console.log("usage: index.js -i {pathToVideos} -e {ext1,ext2}");
      throw "No filename";
    }

    if (!fs.existsSync(this._pathToVideos)) {
      throw `No path found at ${this._pathToVideos}`;
    }

    if (!this._extensions.length) {
      console.log("usage: index.js -i {pathToVideos} -e {ext1,ext2}");
      throw "No extensions";
    }

    return this;
  };
}
