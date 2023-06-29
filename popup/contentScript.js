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

        function handleAction(element, action, actionValue, brute) {
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

                default:
                    console.error(`Action non reconnue : ${action}`);
            }

            if (actionDone) {
                // Ajoutez cette ligne pour stocker le contenu HTML de l'élément
                return { actionDone: true, elementHTML: element.outerHTML };
            } else {
                return { actionDone: false, elementHTML: null };
            }
        }


        chrome.storage.local.get(
            ["banlist", "brute"],
            function (result) {
                let lastCount = 0;

                result.banlist.forEach((rule) => {
                    const { selector, selection, action, actionValue } = rule;

                    let actionInfo = {
                        timestamp: new Date().toISOString(),
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
                                const actionResult = handleAction(element, action, actionValue, result.brute);
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
                                const actionResult = handleAction(elements[i], action, actionValue, result.brute);
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
                                const actionResult = handleAction(selectedElements[i], action, actionValue, result.brute);
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
            // Parcourir chaque règle de la banlist
            banlist.forEach((rule) => {
                const { selector, selection } = rule; // Récupérer le sélecteur et la sélection de chaque règle

                let intervalId = setInterval(function() {
                    handleBanAll(banlist);

                    // Verifier si l'élément est caché, alors arrêter la répétition
                    let element;
                    switch (selector) {
                        case 'id':
                            element = document.getElementById(selection);
                            break;
                        case 'class':
                            element = document.getElementsByClassName(selection)[0];
                            break;
                        case 'querySelector':
                            element = document.querySelector(selection);
                            break;
                    }
                    if (!element || element.style.display === 'none') {
                        clearInterval(intervalId);
                    }
                }, 1000);  // Répéter chaque seconde
            });
        }
    });
}




let storage = chrome.storage || browser.storage;
storage.local.get(["cleanAuto"], function(result) {
    if (result.cleanAuto) {
        launchBan();
    }
});