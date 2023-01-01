import fs from "fs";
import lineReader from "line-reader";
import path from "path";
import { Group } from "./types/Group";

export const parse = (srtFile: string) => {
  const groups: Group[] = [];

  let index = 0;
  let start = "";
  let end = "";
  let text = "";

  lineReader.eachLine(srtFile, (line, last) => {
    if (last) {
      groups.push({ index, start, end, text });
      const json = JSON.stringify(groups, null, 2);
      const outputFile = getOutputFilename(srtFile);
      fs.writeFile(outputFile, json, (err) => {
        if (err) {
          throw err;
        }

        console.log(`JSON written successfully: ${outputFile}`);
        process.exit();
      });

      return false;
    }

    if (!line) {
      groups.push({ index, start, end, text });
      index = 0;
      start = "";
      end = "";
      text = "";
      return;
    }

    if (line.match(/^\d+$/)) {
      index = parseInt(line, 10);
      return;
    }

    const timeRegex = /^(?<start>\d+:\d+:\d+,\d+) --> (?<end>\d+:\d+:\d+,\d+)$/;
    const matches = line.match(timeRegex);
    if (matches?.groups?.start && matches?.groups?.end) {
      start = matches.groups.start;
      end = matches.groups.end;
      return;
    }

    text += line;
  });
};

function getOutputFilename(srtFile: string): string {
  const dir = path.dirname(srtFile);
  const extension = path.extname(srtFile);
  const pathWithoutExtension = path.basename(srtFile, extension);

  return path.join(dir, `${pathWithoutExtension}.json`);
}
