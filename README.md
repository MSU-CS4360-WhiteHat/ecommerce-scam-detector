# ecommerce-scam-detector

[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=MSU-CS4360-WhiteHat_ecommerce-scam-detector&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=MSU-CS4360-WhiteHat_ecommerce-scam-detector)[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=MSU-CS4360-WhiteHat_ecommerce-scam-detector&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=MSU-CS4360-WhiteHat_ecommerce-scam-detector)[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=MSU-CS4360-WhiteHat_ecommerce-scam-detector&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=MSU-CS4360-WhiteHat_ecommerce-scam-detector)[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=MSU-CS4360-WhiteHat_ecommerce-scam-detector&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=MSU-CS4360-WhiteHat_ecommerce-scam-detector)[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=MSU-CS4360-WhiteHat_ecommerce-scam-detector&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=MSU-CS4360-WhiteHat_ecommerce-scam-detector)[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=MSU-CS4360-WhiteHat_ecommerce-scam-detector&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=MSU-CS4360-WhiteHat_ecommerce-scam-detector)

## Development setup

- Install web-ext: `npm install`
- Run `npx web-ext run` to start the extension in a new Firefox instance
  - Dev Tool: Navigate to `about:debugging` and click `This Firefox` then `Inspect` to open the developer tools for the extension
- Run `npx web-ext run -t chromium` to start the extension in a new Chromium instance
  - Dev Tool: Navigate to `chrome://extensions` and toggle `Developer mode` then click `Inspect views: background page` to open the developer tools for the extension
- For debugging use the commands listed above but add the option `--devtools`. This will automatically bring up the developers console.

## Safari Developoment setup

- from the project directory, run `xcrun /Applications/Xcode.app/Contents/Developer/usr/bin/safari-web-extension-converter [PATH TO EXTENSION DIRECTORY]`. This will create a build folder in your project directory and open Xcode.
- From Xcode (NOT YOUR USUAL IDE), delete the build folder that was created in the step above. Then `run` the project as a `macos` application. This will build the extension for you and give you a pop-up saying to quit and open Safari preferences.
  - NOTE: You must have `Developer` turn on and allow unsigned extensions to be run. Allowing unsigned extensions must be enabled every time you start a new Safari window.
- Enable the extension and begin testing/debugging.
