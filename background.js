chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("disabledSites", (data) => {
    if (!data.disabledSites) {
      chrome.storage.sync.set({ disabledSites: {} });
    }
  });
});
