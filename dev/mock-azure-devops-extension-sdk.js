// Minimal mock of `azure-devops-extension-sdk` for local UI testing.
// Place this file next to `dev/local-settings.html` and open that page
// while serving the repo root via a static server (see run-local.ps1).
(function (window) {
  if (window.SDK) return; // don't override

  const storage = {};

  const mockExtensionDataService = {
    getValue: async (key) => {
      return storage[key] === undefined ? null : storage[key];
    },
    setValue: async (key, value) => {
      storage[key] = value;
      return;
    },
  };

  const SDK = {
    init: function () {
      // no-op for mock
    },
    notifyLoadSucceeded: function () {},
    ready: function () {
      return Promise.resolve();
    },
    getConfiguration: function () {
      // Return a simple default configuration object similar to what the extension expects.
      return {
        data: {
          linearApiKey: null,
          linearTeamId: null,
        },
      };
    },
    getService: function (serviceId) {
      // Only implement the small subset used by the settings UI.
      if (serviceId === "ms.vss-web.extension-data-service") {
        return Promise.resolve(mockExtensionDataService);
      }
      // Fallback: return an object with minimal methods to avoid runtime errors.
      return Promise.resolve({});
    },
    getExtensionContext: function () {
      return { extensionId: "local.mock" };
    },
    register: function () {},
    getUser: function () {
      return Promise.resolve({ displayName: "Local Test User" });
    },
  };

  window.SDK = SDK;
  window.azureDevOpsMock = SDK;
})(window);
