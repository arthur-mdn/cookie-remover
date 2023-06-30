//home.js
function showHome() {

    function addCleanButtonListener() {
        const cleanButton = document.getElementById('cleanButton');
        if (cleanButton) {
            cleanButton.addEventListener('click', function(event){
                launchBan();
            });
        }
    }

    addCleanButtonListener();


    function banCurrentWebsite(currentPageUrl) {
        let storage = chrome.storage || browser.storage;
        storage.local.get(["bannedFromAutoCleanWebsites"], function(result) {
            const bannedFromAutoCleanWebsites = result.bannedFromAutoCleanWebsites || [];
            if (!bannedFromAutoCleanWebsites.includes(currentPageUrl)) {
                bannedFromAutoCleanWebsites.push(currentPageUrl);
                storage.local.set({ "bannedFromAutoCleanWebsites": bannedFromAutoCleanWebsites }, function() {
                    banCurrentWebsiteCheckbox.checked = true;
                });
            }
        });
    }

    function unbanCurrentWebsite(currentPageUrl) {
        let storage = chrome.storage || browser.storage;
        storage.local.get(["bannedFromAutoCleanWebsites"], function(result) {
            const bannedFromAutoCleanWebsites = result.bannedFromAutoCleanWebsites || [];
            const index = bannedFromAutoCleanWebsites.indexOf(currentPageUrl);
            if (index !== -1) {
                bannedFromAutoCleanWebsites.splice(index, 1);
                storage.local.set({ "bannedFromAutoCleanWebsites": bannedFromAutoCleanWebsites }, function() {
                    banCurrentWebsiteCheckbox.checked = false;
                });
            }
        });
    }

    function getHostName(url) {
        const urlObj = new URL(url);
        return urlObj.hostname;
    }

    const banCurrentWebsiteCheckbox = document.getElementById('banCurrentWebsite');
    banCurrentWebsiteCheckbox.addEventListener('change', function(event) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentPageUrl = tabs[0].url;
            const hostName = getHostName(currentPageUrl);
            if (event.target.checked) {
                // L'utilisateur a coché la case: bannir le site actuel
                banCurrentWebsite(hostName);
            } else {
                // L'utilisateur a décoché la case: ne pas bannir le site actuel
                unbanCurrentWebsite(hostName);
            }
        });
    });

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentPageUrl = tabs[0].url;
        const hostName = getHostName(currentPageUrl);
        let storage = chrome.storage || browser.storage;
        storage.local.get(["bannedFromAutoCleanWebsites"], function(result) {
            const bannedFromAutoCleanWebsites = result.bannedFromAutoCleanWebsites || [];
            banCurrentWebsiteCheckbox.checked = bannedFromAutoCleanWebsites.includes(hostName);
        });
    });

    let storage = chrome.storage || browser.storage;
    storage.local.get(["cleanAuto"], function(result) {
        if (result.cleanAuto) {
            document.getElementById("banCurrentWebsiteLabel").style.display = "inline";
        }
    });




    function launchBan() {
        let storage = chrome.storage || browser.storage;
        storage.local.get(["banlist", "bannedFromAutoCleanWebsites"], function(result) {
            const banlist = result.banlist || [];
            const bannedFromAutoCleanWebsites = result.bannedFromAutoCleanWebsites || [];
            const currentPageUrl = window.location.href;
            if (!bannedFromAutoCleanWebsites.includes(currentPageUrl)) {
                handleBanAll(banlist);
            }
        });
    }


    function hideElements() {
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
                                //console.log(`Action added to history: ${actionInfo}`);
                                resolve();
                            });
                        });
                    });

                return historyUpdateQueue;
            }

            function getOpeningElement(elementHTML) {
                const closingTagIndex = elementHTML.indexOf('>');
                return elementHTML.slice(0, closingTagIndex + 1);
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
                                actionDone = true;
                            } else if (element.style.display !== "none") {
                                element.style.display = "none";
                                actionDone = true;
                            }
                        } else {
                            console.warn(
                                "Tentative de cacher ou de supprimer un élément <html> ou <body>"
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
                    return { actionDone: true, elementHTML: getOpeningElement(element.outerHTML) };
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
                            elementHTML: null
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
                                            chrome.runtime.sendMessage({ type: "increment_lastCount", message: `${lastCount}` });
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
                                            chrome.runtime.sendMessage({ type: "increment_lastCount", message: `${lastCount}` });
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
                                            chrome.runtime.sendMessage({ type: "increment_lastCount", message: `${lastCount}` });
                                            incrementTotal();
                                        });
                                    }
                                }
                                break;

                            default:
                                console.error(`Selector invalide : ${selector}`);
                        }
                    });
                    chrome.runtime.sendMessage({ type: "increment_lastCount", message: `${lastCount}` });
                    // chrome.storage.local.set({ count: count }, function () {});
                    // chrome.storage.local.set({ lastCount: lastCount }, function () {});
                }
            );
        });
    }

    function handleBanAll(banlist) {
        executeScriptInCurrentTab(hideElements, { "banlist": banlist })
            .then(() => {
                chrome.storage.local.get(["lastCount"], function(result) {})
            })
            .catch((error) => {
                console.error(error);
                document.getElementById("lastCount").innerHTML = "<i class=\"fa fa-times\" aria-hidden=\"true\"></i> Désolé, l'extension ne peut pas être utilisée sur cette page.";
                document.getElementById("lastCount").style.color = "red";
            });
    }

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.type === "increment_lastCount") {
            if (request.message === "0") {
                document.getElementById("lastCount").innerHTML = "<i class=\"fa fa-times\" aria-hidden=\"true\"></i> Aucune action effectuée.";
                document.getElementById("lastCount").classList.remove("lastCountEffective");
            } else if (request.message === "1") {
                document.getElementById("lastCount").innerHTML = "<i class=\"fa fa-check\" aria-hidden=\"true\"></i> 1 action effectuée.";
                document.getElementById("lastCount").classList.add("lastCountEffective");
                document.getElementById("lastCount").onclick = function(){window.location.href = "../popup/popup.html?tab=history";};
            } else{
                document.getElementById("lastCount").innerHTML = "<i class=\"fa fa-check\" aria-hidden=\"true\"></i> " + request.message +" actions effectuées.";
                document.getElementById("lastCount").classList.add("lastCountEffective");
                document.getElementById("lastCount").onclick = function(){window.location.href = "../popup/popup.html?tab=history";};
            }
        }
    });



}
