import { spawn } from "child_process";
import path from "path";

export const extract = (pathToVideo: string) => {
  const args = [
    "-i",
    pathToVideo,
    "-y", // overwrite
    "-ar",
    "16000", // 16 kHz
    "-ac",
    "1", // mono
    getOutputFilename(pathToVideo),
  ];

  console.log(`ffmpeg ${args.join(" ")}`);
  const ffmpeg = spawn("ffmpeg", args);

  ffmpeg.stdout.on("data", (data) => {
    console.log(`${data}`);
  });

  ffmpeg.stderr.on("data", (data) => {
    console.error(`${data}`);
  });

  ffmpeg.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
  });
};

function getOutputFilename(pathToVideo: string): string {
  const dir = path.dirname(pathToVideo);
  const extension = path.extname(pathToVideo);
  const pathWithoutExtension = path.basename(pathToVideo, extension);

  return path.join(dir, `${pathWithoutExtension}.wav`);
}
