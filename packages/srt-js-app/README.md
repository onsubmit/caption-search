# srt-js-app

Generate subtitles in SRT (SubRip file format) from a WAV file using Microsoft Azure Speech Service

# Prerequisites

1. A Microsoft Azure account. https://portal.azure.com
2. A "Speech service" resource. https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/

# Getting started

1. `npm install` from root
2. Create a `.env` file in `srt-js-app/`.

```
SUBSCRIPTION_KEY="<COGNITIVE SERVICES API KEY>"
SERVICE_REGION="eastus"
LANGUAGE="en-us"
```

# Example

- Place your WAV file(s) in a folder, then invoke:

```
npm run start -- -i C:\git\caption-search\packages\audio-extract-app\input
```
