import 'dotenv/config';

import arcjet, { shield, detectBot, slidingWindow } from '@arcjet/node';

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: 'LIVE' }),
    detectBot({
      mode: process.env.NODE_ENV === 'development' ? 'DRY_RUN' : 'LIVE',
      allow: [
        'CATEGORY:SEARCH_ENGINE',
        'CATEGORY:PREVIEW',
        'CATEGORY:MONITOR',
        // Allow specific development tools
        'POSTMAN',
        'INSOMNIA',
        'CURL',
        // Allow requests without User-Agent (health checks, internal requests)
        'NO_USER_AGENT'
      ],
    }),
    slidingWindow({
      mode: 'LIVE',
      interval: '2s',
      max: 5,
    })
  ]
});

export default aj;
