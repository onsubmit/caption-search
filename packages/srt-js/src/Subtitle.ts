import os from "os";
import { sprintf } from "sprintf-js";

export class Subtitle {
  private _text: string;
  private _startInSeconds: number;
  private _endInSeconds: number;
  private _startInSecondsString: string;
  private _endInSecondsString: string;

  constructor(text: string, offset: number, duration: number) {
    this._text = text;
    this._startInSeconds = offset / 1e7;
    this._endInSeconds = this._startInSeconds + duration / 1e7;
    this._startInSecondsString = this.formatSeconds(this._startInSeconds);
    this._endInSecondsString = this.formatSeconds(this._endInSeconds);
  }

  get text(): string {
    return this._text;
  }

  get startInSeconds(): number {
    return this._startInSeconds;
  }

  get endInSeconds(): number {
    return this._endInSeconds;
  }

  get startInSecondsString(): string {
    return this._startInSecondsString;
  }

  get endInSecondsString(): string {
    return this._endInSecondsString;
  }

  toString = (): string => {
    return `${this._startInSecondsString} --> ${this._endInSecondsString}${os.EOL}${this._text}`;
  };

  private formatSeconds = (seconds: number): string => {
    const secondsTimes1000 = seconds * 1000;
    const hours = Math.floor(secondsTimes1000 / 3600000);
    let milliseconds = secondsTimes1000 % 3600000;

    const minutes = Math.floor(milliseconds / 60000);
    milliseconds = milliseconds % 60000;

    seconds = milliseconds / 1000;
    return sprintf("%02i:%02i:%06.3f", hours, minutes, seconds).replace(".", ",");
  };
}
