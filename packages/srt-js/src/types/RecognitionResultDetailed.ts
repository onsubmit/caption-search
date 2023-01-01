export interface RecognitionResultDetailed {
  Id: string;
  RecognitionStatus: number;
  Offset: number;
  Duration: number;
  Channel: number;
  DisplayText: string;
  NBest: NBest[];
}

export interface NBest {
  Confidence: number;
  Lexical: string;
  ITN: string;
  MaskedITN: string;
  Display: string;
  Words: Word[];
}

export interface Word {
  Word: string;
  Offset: number;
  Duration: number;
}
