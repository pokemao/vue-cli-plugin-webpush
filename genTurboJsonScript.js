const fs = require('fs');
const {resolve} = require('path');

const prefix = "SYZ_";
const envKeys = Object.keys(process.env).filter(key => key.startsWith(prefix));

const turboJson = {
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "serve": {
      "persistent": true,
      "dependsOn": [],
      "cache": false,
      "inputs": [".env.development"],
      "env": envKeys
    },
    "cleardist": {
      "cache": false
    },
    "build": {
      "cache": false,
      "dependsOn": ["cleardist"],
      "inputs": [".env.production"],
      "env": envKeys
    },
  }
}

fs.writeFileSync(resolve(__dirname, 'turbo.json'), JSON.stringify(turboJson, null, 2));
