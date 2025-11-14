# Local UI test harness

This folder contains a minimal mock `azure-devops-extension-sdk` and a local HTML page
you can open in a browser to test the `settings` UI without installing the VSIX.

How to use

1. Build the project so `dist/settings.js` exists:

   npm run build

2. Start the local static server (PowerShell):

   ./dev/run-local.ps1

3. Open the test page:

   http://localhost:8080/dev/local-settings.html

Notes & limitations

- This is a mock SDK providing only a small subset of the real Azure DevOps extension SDK
  (methods: `init`, `ready`, `getConfiguration`, `getService` for `ms.vss-web.extension-data-service`).
- Use this for quick UI and wiring tests (forms, buttons, local validation). It will NOT replicate
  host behaviors like authentication flows, services not implemented in the mock, or the full
  context provided by Azure DevOps.
- For full end-to-end testing (policies and PR status), install the produced VSIX into an
  Azure DevOps organization (recommended for final validation).
