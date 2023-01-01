import * as dotenv from "dotenv";
import fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export default class AppConfig {
  private _pathToWavFiles: string;
  private _subscriptionKey: string;
  private _serviceRegion: string;
  private _language: string;

  constructor() {
    const argv = yargs(hideBin(process.argv))
      .options({
        input: { describe: "Input path", alias: "i", type: "string", demandOption: true },
      })
      .parseSync();

    this._pathToWavFiles = argv.input;

    dotenv.config();

    this._subscriptionKey = process.env.SUBSCRIPTION_KEY || "";
    this._serviceRegion = process.env.SERVICE_REGION || "";
    this._language = process.env.LANGUAGE || "en-us";
  }

  get pathToWavFiles(): string {
    return this._pathToWavFiles;
  }

  get subscriptionKey(): string {
    return this._subscriptionKey;
  }

  get serviceRegion(): string {
    return this._serviceRegion;
  }

  get language(): string {
    return this._language;
  }

  validate = (): this => {
    if (!this._pathToWavFiles) {
      console.log("usage: index.js -i {pathToVideos} -e {ext1,ext2}");
      throw "No filename";
    }

    if (!fs.existsSync(this._pathToWavFiles)) {
      throw `No path found at ${this._pathToWavFiles}`;
    }

    if (!this._subscriptionKey) {
      throw "No SUBSCRIPTION_KEY specified in .env";
    }

    if (!this._serviceRegion) {
      throw "No SERVICE_REGION specified in .env";
    }

    return this;
  };
}
