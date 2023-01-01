import { readdir } from "node:fs/promises";
import path from "path";
import { SubtitleGenerator } from "srt-js";
import AppConfig from "./AppConfig";

const appConfig = new AppConfig().validate();

(async () => {
  const files = await readdir(appConfig.pathToWavFiles);

  const promises: Promise<void>[] = [];
  for (const file of files) {
    const extension = path.extname(file).slice(1).toLowerCase();
    if (extension !== "wav") {
      continue;
    }

    const fullPath = path.join(appConfig.pathToWavFiles, file);
    const subtitleGenerator = new SubtitleGenerator(
      fullPath,
      appConfig.subscriptionKey,
      appConfig.serviceRegion,
      appConfig.language
    );

    promises.push(subtitleGenerator.generateAsync());
  }

  Promise.allSettled(promises).then(() => process.exit());
})();
