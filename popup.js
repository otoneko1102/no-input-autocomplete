document.addEventListener("DOMContentLoaded", async () => {
  const toggle = document.getElementById("toggle");
  const currentDomainElem = document.getElementById("current-domain");
  const ignoredListElem = document.getElementById("ignored-list");

  let domain = "unknown";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      domain = new URL(tab.url).hostname.replace(/^www\./, "");
    } else {
      toggle.disabled = true;
    }
  } catch (e) {
    // console.error("Error:", e);
    toggle.disabled = true;
  }

  currentDomainElem.textContent = `Current page: ${domain}`;

  chrome.storage.sync.get(["disabledSites"], (data) => {
    const disabledSites = data.disabledSites || {};
    toggle.checked = !disabledSites[domain];
    updateIgnoredList(disabledSites);
  });

  toggle.addEventListener("change", () => {
    chrome.storage.sync.get(["disabledSites"], (data) => {
      const disabledSites = data.disabledSites || {};
      if (toggle.checked) {
        delete disabledSites[domain];
      } else {
        disabledSites[domain] = true;
      }
      chrome.storage.sync.set({ disabledSites }, () => updateIgnoredList(disabledSites));
    });

    if (domain !== "unknown") {
      chrome.tabs.reload().catch((e) => console.error("Error:", e));
    }
  });

  function updateIgnoredList(disabledSites) {
    ignoredListElem.innerHTML = "";

    Object.keys(disabledSites).forEach((savedDomain) => {
      const row = document.createElement("tr");

      const domainCell = document.createElement("td");
      domainCell.textContent = savedDomain;
      row.appendChild(domainCell);

      const deleteCell = document.createElement("td");
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "x";
      deleteBtn.addEventListener("click", () => {
        delete disabledSites[savedDomain];
        chrome.storage.sync.set({ disabledSites }, () => {
          updateIgnoredList(disabledSites);
          if (savedDomain === domain) {
            toggle.checked = true;
            chrome.tabs.reload().catch((e) => console.error("Error:", e));
          }
        });
      });
      deleteCell.appendChild(deleteBtn);
      row.appendChild(deleteCell);

      ignoredListElem.appendChild(row);
    });
  }
});
