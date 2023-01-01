import os from "os";
import { Subtitle } from "./Subtitle";

export class Subtitles {
  private _subtitles: Subtitle[];

  constructor(subtitles: Subtitle[] = []) {
    this._subtitles = subtitles;
  }

  get strings(): string[] {
    return this._subtitles.map((s) => s.toString());
  }

  get text(): string {
    return this._subtitles.map((w) => w.text).join(" ");
  }

  get startInSeconds(): number {
    if (this.isEmpty()) {
      throw "No subtitles found.";
    }

    return this._subtitles[0].startInSeconds;
  }

  get endInSeconds(): number {
    if (this.isEmpty()) {
      throw "No subtitles found.";
    }

    return this._subtitles[this._subtitles.length - 1].endInSeconds;
  }

  get startInSecondsString(): string {
    if (this.isEmpty()) {
      throw "No subtitles found.";
    }

    return this._subtitles[0].startInSecondsString;
  }

  get endInSecondsString(): string {
    if (this.isEmpty()) {
      throw "No subtitles found.";
    }

    return this._subtitles[this._subtitles.length - 1].endInSecondsString;
  }

  add = (subtitle: Subtitle): void => {
    this._subtitles.push(subtitle);
  };

  isEmpty = (): boolean => {
    return this._subtitles.length === 0;
  };

  getGroupStrings = (maxTimespan: number): string[] => {
    const groups = this.getGroups(maxTimespan);
    return groups.map((g) => `${g.startInSecondsString} --> ${g.endInSecondsString}${os.EOL}${g.text}`);
  };

  private getGroups = (maxTimespan: number): Subtitles[] => {
    const groups: Subtitles[] = [];

    let subtitles: Subtitles = new Subtitles();
    for (const subtitle of this._subtitles) {
      if (subtitles.isEmpty()) {
        subtitles.add(subtitle);
        continue;
      }

      if (subtitle.endInSeconds - subtitles.startInSeconds > maxTimespan) {
        groups.push(subtitles);
        subtitles = new Subtitles();
      }

      subtitles.add(subtitle);
    }

    groups.push(subtitles);

    return groups;
  };
}
