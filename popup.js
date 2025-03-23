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
    toggle.disabled = true;
  }

  currentDomainElem.textContent = `Current page: ${domain}`;

  chrome.storage.sync.get(["ignoredSites"], (data) => {
    const ignoredSites = data.ignoredSites || {};
    toggle.checked = !ignoredSites[domain];
    updateIgnoredList(ignoredSites);
  });

  toggle.addEventListener("change", () => {
    chrome.storage.sync.get(["ignoredSites"], (data) => {
      const ignoredSites = data.ignoredSites || {};
      if (toggle.checked) {
        delete ignoredSites[domain];
      } else {
        ignoredSites[domain] = true;
      }
      chrome.storage.sync.set({ ignoredSites }, () => {
        updateIgnoredList(ignoredSites);
        if (domain !== "unknown") {
          chrome.tabs.reload().catch((e) => console.error("Error:", e));
        }
      });
    });
  });

  function updateIgnoredList(ignoredSites) {
    ignoredListElem.innerHTML = "";

    Object.keys(ignoredSites).forEach((savedDomain) => {
      const row = document.createElement("tr");

      const domainCell = document.createElement("td");
      domainCell.textContent = savedDomain;
      row.appendChild(domainCell);

      const deleteCell = document.createElement("td");
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "x";
      deleteBtn.addEventListener("click", () => {
        delete ignoredSites[savedDomain];
        chrome.storage.sync.set({ ignoredSites }, () => {
          updateIgnoredList(ignoredSites);
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
