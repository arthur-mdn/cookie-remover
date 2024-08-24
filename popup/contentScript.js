//contentScript.js
function executeScriptInCurrentTab(func, params) {
    return new Promise((resolve, reject) => {
        const browserAPI = chrome || browser;

        browserAPI.storage.local.set(params, function() {
            browserAPI.tabs.query({active: true, currentWindow: true})
                .then((tabs) => {
                    let tab = tabs[0];

                    browserAPI.scripting.executeScript({
                        target: { tabId: tab.id },
                        function: func
                    }).then(resolve).catch(reject);
                })
                .catch((error) => {
                    console.error(`Error executing script in current tab: ${error}`);
                    reject(error);
                });
        });
    });
}
function hideElements() {
    // console.error("launched");
    return new Promise((resolve, reject) => {
        let historyUpdateQueue = Promise.resolve();

        function incrementTotal(){
            chrome.storage.local.get("totalCount", function(result) {
                let totalCount = result.totalCount || 0; // Récupérer la valeur actuelle de totalCount

                totalCount++; // Incrémenter totalCount

                chrome.storage.local.set({ totalCount: totalCount }, function() {
                    // Stocker la nouvelle valeur de totalCount
                    // console.log("totalCount incremented and stored: " + totalCount);
                });
            });
        }
        function addToHistory(actionInfo, brute) {
            historyUpdateQueue = historyUpdateQueue
                .then(() => {
                    return new Promise((resolve, reject) => {
                        chrome.storage.local.get(["history"], function (result) {
                            resolve(result.history || []);
                        });
                    });
                })
                .then((history) => {
                    if (brute && actionInfo.action === "hide") {
                        actionInfo.action = "destroy";
                    }
                    history.push(actionInfo);

                    return new Promise((resolve, reject) => {
                        chrome.storage.local.set({ history: history }, function () {
                            // console.log(`Action added to history: ${actionInfo}`);
                            resolve();
                        });
                    });
                });

            return historyUpdateQueue;
        }

        function styleStringToObject(styleString) {
            let styleObject = {};

            // Split the style string into individual style rules
            let styleRules = styleString.split(';');

            styleRules.forEach(rule => {
                let [property, value] = rule.split(':');

                // Trim whitespace and add the rule to the style object
                styleObject[property.trim()] = value.trim();
            });

            return styleObject;
        }

        function getOpeningElement(elementHTML) {
            const closingTagIndex = elementHTML.indexOf('>');
            return elementHTML.slice(0, closingTagIndex + 1);
        }

        function handleAction(element, action, actionValue, brute, forceImportant) {
            let actionDone = false;
            switch (action) {
                case "hide":
                    if (
                        element !== document.documentElement &&
                        element !== document.body
                    ) {
                        if (brute) {
                            element.remove();
                            action = "destroy";
                            actionDone = true;
                        } else if (forceImportant) {
                            element.style.setProperty("display", "none", "important");
                            actionDone = true;
                        } else if (element.style.display !== "none") {
                            element.style.display = "none";
                            actionDone = true;
                        }
                    } else {
                        console.log(
                            "Tentative de cacher ou de détruire un élément <html> ou <body>"
                        );
                    }
                    break;
                case "destroy":
                    if (
                        element !== document.documentElement &&
                        element !== document.body
                    ) {
                        element.remove();
                        action = "destroy";
                        actionDone = true;
                    } else {
                        console.log(
                            "Tentative de détruire un élément <html> ou <body>"
                        );
                    }
                    break;
                case "addClass":
                    if (!element.classList.contains(actionValue)) {
                        element.classList.add(actionValue);
                        actionDone = true;
                    }
                    break;

                case "removeClass":
                    if (element.classList.contains(actionValue)) {
                        element.classList.remove(actionValue);
                        actionDone = true;
                    }
                    break;

                case "addAttribute":
                    if (!element.hasAttribute(actionValue)) {
                        element.setAttribute(actionValue, "");
                        actionDone = true;
                    }
                    break;

                case "removeAttribute":
                    if (element.hasAttribute(actionValue)) {
                        element.removeAttribute(actionValue);
                        actionDone = true;
                    }
                    break;

                case "addStyle":
                    let styleObject = styleStringToObject(actionValue);
                    let styleKeys = Object.keys(styleObject);

                    let styleNeedsUpdate = false;
                    styleKeys.forEach(key => {
                        if (element.style[key] !== styleObject[key]) {
                            styleNeedsUpdate = true;
                            element.style[key] = styleObject[key]; // Set or update the style
                        }
                    });
                    if (styleNeedsUpdate) {
                        actionDone = true;
                    }
                    break;


                default:
                    console.error(`Action non reconnue : ${action}`);
            }

            if (actionDone) {
                // Ajoutez cette ligne pour stocker le contenu HTML de l'élément
                return { actionDone: true, elementHTML: getOpeningElement(element.outerHTML) };
            } else {
                return { actionDone: false, elementHTML: null };
            }
        }


        chrome.storage.local.get(
            ["banlist", "brute", "forceImportant"],
            function (result) {
                let lastCount = 0;
                let timestampOfLaunching = new Date().toISOString();

                result.banlist.forEach((rule) => {
                    const { selector, selection, action, actionValue } = rule;

                    let actionInfo = {
                        timestamp: timestampOfLaunching,
                        url: window.location.href,
                        selector: selector,
                        selection: selection,
                        action: action,
                        actionValue: actionValue,
                    };

                    switch (selector) {
                        case "id":
                            const element = document.getElementById(selection);
                            if (element) {
                                const actionResult = handleAction(element, action, actionValue, result.brute, result.forceImportant);
                                if (actionResult.actionDone) {
                                    actionInfo.elementHTML = actionResult.elementHTML;
                                    addToHistory(actionInfo, result.brute).then(() => {
                                        lastCount++;
                                        chrome.runtime.sendMessage({ type: "increment_lastCount_background", message: `${lastCount}` });
                                        incrementTotal();
                                    });
                                }
                            }
                            break;

                        case "class":
                            const elements = document.getElementsByClassName(selection);
                            for (let i = 0; i < elements.length; i++) {
                                const actionResult = handleAction(elements[i], action, actionValue, result.brute, result.forceImportant);
                                if (actionResult.actionDone) {
                                    actionInfo.elementHTML = actionResult.elementHTML;
                                    addToHistory(actionInfo, result.brute).then(() => {
                                        lastCount++;
                                        chrome.runtime.sendMessage({ type: "increment_lastCount_background", message: `${lastCount}` });
                                        incrementTotal();
                                    });
                                }
                            }
                            break;

                        case "querySelector":
                            const selectedElements = document.querySelectorAll(selection);
                            for (let i = 0; i < selectedElements.length; i++) {
                                const actionResult = handleAction(selectedElements[i], action, actionValue, result.brute, result.forceImportant);
                                if (actionResult.actionDone) {
                                    actionInfo.elementHTML = actionResult.elementHTML;
                                    addToHistory(actionInfo, result.brute).then(() => {
                                        lastCount++;
                                        chrome.runtime.sendMessage({ type: "increment_lastCount_background", message: `${lastCount}` });
                                        incrementTotal();
                                    });
                                }
                            }
                            break;

                        default:
                            console.error(`Selector invalide : ${selector}`);
                    }
                });
                chrome.runtime.sendMessage({ type: "increment_lastCount_background", message: `${lastCount}` });
            }
        );
    });
}
function handleBanAll(banlist) {
    hideElements();  // Vous n'avez pas besoin de passer banlist, hideElements peut y accéder directement depuis le stockage
}


function launchBan() {
    let storage = chrome.storage || browser.storage;
    storage.local.get(["banlist", "bannedFromAutoCleanWebsites"], function(result) {

        function getHostName(url) {
            const urlObj = new URL(url);
            return urlObj.hostname;
        }
        const banlist = result.banlist || [];
        const bannedFromAutoCleanWebsites = result.bannedFromAutoCleanWebsites || [];
        const currentPageUrl = window.location.href;
        const currentDomain = getHostName(currentPageUrl); // get the domain name
        if (!bannedFromAutoCleanWebsites.includes(currentDomain)) { // check if the domain name is not in the banned pages
            handleBanAll(banlist);
            // Parcourir chaque règle de la banlist
            banlist.forEach((rule) => {
                const { selector, selection } = rule; // Récupérer le sélecteur et la sélection de chaque règle

                let observer = new MutationObserver((mutations) => {
                    handleBanAll(banlist);
                });

                // Start observing the document
                observer.observe(document, { childList: true, subtree: true });

                // Handle tab visibility changes
                document.addEventListener("visibilitychange", function() {
                    if (document.hidden){
                        observer.disconnect();
                    } else {
                        observer.observe(document, { childList: true, subtree: true });
                    }
                });
            });
        }
    });
}




window.onload = function() {
    let storage = chrome.storage || browser.storage;
    storage.local.get(["cleanAuto"], function(result) {
        if (result.cleanAuto) {
            launchBan();
        }
    });
}
