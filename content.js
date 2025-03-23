(() => {
  const disableAutocomplete = (input) => {
    input.removeAttribute("autocomplete");
    input.setAttribute("autocomplete", "off");
  };

  const processInputs = () => {
    document.querySelectorAll("input").forEach(disableAutocomplete);
  };

  let domain = "unknown";

  try {
    domain = window.location.hostname.replace(/^www\./, "");
  } catch (e) {
    console.error("Error getting hostname:", e);
    return;
  }

  chrome.storage.sync.get(["disabledSites"], (data) => {
    const disabledSites = data.disabledSites || {};
    if (disabledSites[domain]) return;

    processInputs();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.tagName === "INPUT") {
              disableAutocomplete(node);
            } else {
              node.querySelectorAll("input").forEach(disableAutocomplete);
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setInterval(processInputs, 500);
  });

  document.addEventListener("readystatechange", () => {
    if (document.readyState === "interactive" || document.readyState === "complete") {
      processInputs();
    }
  });
})();
