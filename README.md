# ecommerce-scam-detector

## Development setup

- Install web-ext: `npm install`
- Run `npx web-ext run` to start the extension in a new Firefox instance
  - Dev Tool: Navigate to `about:debugging` and click `This Firefox` then `Inspect` to open the developer tools for the extension
- Run `npx web-ext run -t chromium` to start the extension in a new Chromium instance
  - Dev Tool: Navigate to `chrome://extensions` and toggle `Developer mode` then click `Inspect views: background page` to open the developer tools for the extension
