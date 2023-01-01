import { extract } from "audio-extract";
import fs from "fs";
import path from "path";
import AppConfig from "./AppConfig";

const appConfig = new AppConfig().validate();

fs.readdir(appConfig.pathToVideos, (err, files) => {
  if (err) {
    throw err;
  }

  for (const file of files) {
    const extension = path.extname(file).slice(1).toLowerCase();
    if (!appConfig.extensions.includes(extension)) {
      continue;
    }

    const fullPath = path.join(appConfig.pathToVideos, file);
    extract(fullPath);
  }
});
