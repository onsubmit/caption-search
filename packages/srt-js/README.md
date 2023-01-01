# srtjs

Generate subtitles in SRT (SubRip file format) from a WAV file using Microsoft Azure Speech Service

# Prerequisites

1. A Microsoft Azure account. https://portal.azure.com
2. A "Speech service" resource. https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/

# Getting started

1. `yarn install`
2. Create a `.env` file in the root.

```
SUBSCRIPTION_KEY="<COGNITIVE SERVICES API KEY>"
SERVICE_REGION="eastus"
LANGUAGE="en-us"
```

# Usage

`yarn run build <path_to.wav>`
