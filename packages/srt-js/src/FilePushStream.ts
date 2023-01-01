import fs from "fs";
import { AudioInputStream, AudioStreamFormat, PushAudioInputStream } from "microsoft-cognitiveservices-speech-sdk";

export class FilePushStream {
  private _filename: string;

  constructor(filename: string) {
    this._filename = filename;
  }

  openPushStream = (): PushAudioInputStream => {
    const format = this.getWavFileFormat();
    const pushStream = AudioInputStream.createPushStream(format);

    const wavHeaderSizeInBytes = 44;
    fs.createReadStream(this._filename, { start: wavHeaderSizeInBytes })
      .on("data", (arrayBuffer: string | Buffer) => {
        if (typeof arrayBuffer === "string") {
          throw "data event should emit a buffer, not a string";
        }

        pushStream.write(arrayBuffer.subarray());
      })
      .on("end", () => {
        pushStream.close();
      });

    return pushStream;
  };

  private getWavFileFormat = (): AudioStreamFormat => {
    const descriptor = fs.openSync(this._filename, "r");

    if (this.readString(descriptor, 4) != "RIFF") {
      throw "Error reading .wav file header. Expected 'RIFF' tag.";
    }

    // File length
    this.readInt32(descriptor);
    if (this.readString(descriptor, 4) != "WAVE") {
      throw "Error reading .wav file header. Expected 'WAVE' tag.";
    }

    if (this.readString(descriptor, 4) != "fmt ") {
      throw "Error reading .wav file header. Expected 'fmt ' tag.";
    }

    // Format size
    const formatSize = this.readInt32(descriptor);
    if (formatSize > 16) {
      throw `Error reading .wav file header. Expected format size 16 bytes. Actual size: ${formatSize}`;
    }

    // Format tag
    this.readUInt16(descriptor);
    const channels = this.readUInt16(descriptor);
    const samplesPerSecond = this.readUInt32(descriptor);

    // Average bytes per second
    this.readUInt32(descriptor);

    // Block align
    this.readUInt16(descriptor);

    const bitsPerSample = this.readUInt16(descriptor);

    fs.closeSync(descriptor);

    return AudioStreamFormat.getWaveFormatPCM(samplesPerSecond, bitsPerSample, channels);
  };

  private readInt32 = (descriptor: number): number => {
    return this.read(descriptor, 4).readInt32LE();
  };

  private readUInt16 = (descriptor: number): number => {
    return this.read(descriptor, 2).readUInt16LE();
  };

  private readUInt32 = (descriptor: number): number => {
    return this.read(descriptor, 4).readUInt32LE();
  };

  private readString = (descriptor: number, length: number): string => {
    return this.read(descriptor, length).toString();
  };

  private read = (descriptor: number, length: number): Buffer => {
    const buffer = Buffer.alloc(length);
    const bytesRead = fs.readSync(descriptor, buffer);
    if (length != bytesRead) {
      throw `Error reading bytes from .wav file header. Expected ${length} bytes. Actual bytes read: ${bytesRead}`;
    }

    return buffer;
  };
}
