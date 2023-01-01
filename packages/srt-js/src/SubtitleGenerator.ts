import fs from "fs";
import {
  AudioConfig,
  CancellationReason,
  NoMatchDetails,
  NoMatchReason,
  OutputFormat,
  RecognitionEventArgs,
  Recognizer,
  ResultReason,
  SessionEventArgs,
  SpeechConfig,
  SpeechRecognitionCanceledEventArgs,
  SpeechRecognitionEventArgs,
  SpeechRecognizer,
} from "microsoft-cognitiveservices-speech-sdk";
import os from "os";
import path from "path";
import Deferred from "./Deferred";
import { FilePushStream } from "./FilePushStream";
import { Subtitle } from "./Subtitle";
import { Subtitles } from "./Subtitles";
import { RecognitionResultDetailed } from "./types/RecognitionResultDetailed";

/**
 * Generate subtitles in SRT (SubRip file format) from a WAV file using the Microsoft Azure Speech Service.
 *
 * @export
 * @class SubtitleGenerator
 */
export class SubtitleGenerator {
  private _speechRecognizer: SpeechRecognizer;
  private _results: Subtitles[] = [];
  private _outputFilename: string;
  private _deferred = new Deferred();

  /**
   * Creates an instance of SubtitleGenerator.
   * @param {string} wavFilename The path to the WAV file to transcribe.
   * @param {string} subscriptionKey The Microsoft Azure Cognitive Services API key.
   * @param {string} serviceRegion The Azure region in which the Speech services resides.
   * @param {string} language The speech recognition language.
   * @memberof SubtitleGenerator
   */
  constructor(wavFilename: string, subscriptionKey: string, serviceRegion: string, language: string) {
    const speechConfig = SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
    speechConfig.speechRecognitionLanguage = language;
    speechConfig.outputFormat = OutputFormat.Detailed;
    speechConfig.requestWordLevelTimestamps();

    const filePushStream = new FilePushStream(wavFilename);
    const audioStream = filePushStream.openPushStream();
    const audioConfig = AudioConfig.fromStreamInput(audioStream);

    this._speechRecognizer = this.getSpeechRecognizer(speechConfig, audioConfig);
    this._outputFilename = this.getOutputFilename(wavFilename);
  }

  /**
   * Generates captions in SRT file.
   *
   * @memberof SubtitleGenerator
   */
  generateAsync = async (): Promise<void> => {
    this._speechRecognizer.startContinuousRecognitionAsync();
    return this._deferred.promise;
  };

  private stop = (error?: string) => {
    const logger = fs
      .createWriteStream(this._outputFilename, {
        flags: "w",
      })
      .on("open", () => {
        let index = 1;
        for (const result of this._results) {
          const groups = result.getGroupStrings(3);
          for (const group of groups) {
            logger.write(`${index}`);
            logger.write(os.EOL);
            logger.write(group);
            logger.write(os.EOL);
            logger.write(os.EOL);

            index++;
          }
        }

        logger.end();

        if (error) {
          console.warn(`Error encountered while transcribing. SRT file may be incomplete.`);
          logger.close(() => {
            this._deferred.reject(error);
          });

          return;
        }

        console.log(`SRT written successfully: ${this._outputFilename}`);
        logger.close(() => {
          this._deferred.resolve();
        });
      })
      .on("error", (err) => {
        console.error(err);
        logger.end();
        logger.close(() => {
          this._deferred.reject(err);
        });
      });
  };

  private getSpeechRecognizer = (speechConfig: SpeechConfig, audioConfig: AudioConfig): SpeechRecognizer => {
    const speechRecognizer = new SpeechRecognizer(speechConfig, audioConfig);

    speechRecognizer.recognizing = (sender: Recognizer, event: SpeechRecognitionEventArgs): void => {
      console.debug(`(recognizing) Reason: ${ResultReason[event.result.reason]} Text: ${event.result.text}`);
    };

    speechRecognizer.recognized = (sender: Recognizer, event: SpeechRecognitionEventArgs): void => {
      if (event.result.reason === ResultReason.NoMatch) {
        const noMatchDetail = NoMatchDetails.fromResult(event.result);
        console.debug(
          `(recognized) Reason: ${ResultReason[event.result.reason]} NoMatchReason: ${
            NoMatchReason[noMatchDetail.reason]
          }`
        );

        return;
      }

      console.debug(`(recognized) Reason: ${ResultReason[event.result.reason]} Text: ${event.result.text}`);

      const details = JSON.parse(event.result.json) as RecognitionResultDetailed;
      if (!details?.NBest?.length) {
        console.warn(event.result.json);
        throw "Invalid JSON";
      }

      const best = details.NBest[0];
      const subtitles = new Subtitles(best.Words.map((w) => new Subtitle(w.Word, w.Offset, w.Duration)));

      this._results.push(subtitles);
    };

    speechRecognizer.canceled = (sender: Recognizer, event: SpeechRecognitionCanceledEventArgs): void => {
      console.debug(`(canceled) Reason: ${CancellationReason[event.reason]}`);
      if (event.reason === CancellationReason.Error) {
        console.debug(`(canceled) Details: ${event.errorDetails}`);
      }
    };

    speechRecognizer.sessionStarted = (sender: Recognizer, event: SessionEventArgs): void => {
      console.debug(`(sessionStarted) SessionId: ${event.sessionId}`);
    };

    speechRecognizer.sessionStopped = (sender: Recognizer, event: SessionEventArgs): void => {
      console.debug(`(sessionStopped) SessionId: ${event.sessionId}`);
      speechRecognizer.stopContinuousRecognitionAsync(this.stop, this.stop);
    };

    speechRecognizer.speechStartDetected = (sender: Recognizer, event: RecognitionEventArgs): void => {
      console.debug(`(speechStartDetected) SessionId: ${event.sessionId}`);
    };

    speechRecognizer.speechEndDetected = (sender: Recognizer, event: RecognitionEventArgs): void => {
      console.debug(`(speechEndDetected) SessionId: ${event.sessionId}`);
    };

    return speechRecognizer;
  };

  private getOutputFilename = (wavFilename: string): string => {
    const dir = path.dirname(wavFilename);
    const extension = path.extname(wavFilename);
    const pathWithoutExtension = path.basename(wavFilename, extension);

    return path.join(dir, `${pathWithoutExtension}.json`);
  };
}
