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


    function banCurrentPage(currentPageUrl) {
        let storage = chrome.storage || browser.storage;
        storage.local.get(["bannedPages"], function(result) {
            const bannedPages = result.bannedPages || [];
            if (!bannedPages.includes(currentPageUrl)) {
                bannedPages.push(currentPageUrl);
                storage.local.set({ "bannedPages": bannedPages }, function() {
                    banCurrentPageCheckbox.checked = true;
                });
            }
        });
    }

    function unbanCurrentPage(currentPageUrl) {
        let storage = chrome.storage || browser.storage;
        storage.local.get(["bannedPages"], function(result) {
            const bannedPages = result.bannedPages || [];
            const index = bannedPages.indexOf(currentPageUrl);
            if (index !== -1) {
                bannedPages.splice(index, 1);
                storage.local.set({ "bannedPages": bannedPages }, function() {
                    banCurrentPageCheckbox.checked = false;
                });
            }
        });
    }


    const banCurrentPageCheckbox = document.getElementById('banCurrentPage');
    banCurrentPageCheckbox.addEventListener('change', function(event) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentPageUrl = tabs[0].url;
            if (event.target.checked) {
                // L'utilisateur a coché la case: bannir la page actuelle
                banCurrentPage(currentPageUrl);
            } else {
                // L'utilisateur a décoché la case: ne pas bannir la page actuelle
                unbanCurrentPage(currentPageUrl);
            }
        });
    });

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentPageUrl = tabs[0].url;
        let storage = chrome.storage || browser.storage;
        storage.local.get(["bannedPages"], function(result) {
            const bannedPages = result.bannedPages || [];
            banCurrentPageCheckbox.checked = bannedPages.includes(currentPageUrl);
        });
    });

    let storage = chrome.storage || browser.storage;
    storage.local.get(["cleanAuto"], function(result) {
        if (result.cleanAuto) {
            document.getElementById("banCurrentPageLabel").style.display = "inline";
        }
    });





    function launchBan() {
        let storage = chrome.storage || browser.storage;
        storage.local.get(["banlist", "bannedPages"], function(result) {
            const banlist = result.banlist || [];
            const bannedPages = result.bannedPages || [];
            const currentPageUrl = window.location.href;
            if (!bannedPages.includes(currentPageUrl)) {
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
            function addToHistory(actionInfo) {
                historyUpdateQueue = historyUpdateQueue
                    .then(() => {
                        return new Promise((resolve, reject) => {
                            chrome.storage.local.get(["history"], function (result) {
                                resolve(result.history || []);
                            });
                        });
                    })
                    .then((history) => {
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

                return actionDone;
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
                                    if (
                                        handleAction(element, action, actionValue, result.brute)
                                    ) {
                                        addToHistory(actionInfo).then(() => {
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
                                    if (
                                        handleAction(elements[i], action, actionValue, result.brute)
                                    ) {
                                        addToHistory(actionInfo).then(() => {
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
                                    if (
                                        handleAction(
                                            selectedElements[i],
                                            action,
                                            actionValue,
                                            result.brute
                                        )
                                    ) {
                                        addToHistory(actionInfo).then(() => {
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
        if(request.type === "increment_lastCount"){
            if(request.message === "0"){
                document.getElementById("lastCount").innerHTML = "<i class=\"fa fa-times\" aria-hidden=\"true\"></i> Aucune action effectuée.";
            }
            else if(request.message === "1"){
                document.getElementById("lastCount").innerHTML = "<i class=\"fa fa-check\" aria-hidden=\"true\"></i> 1 action effectuée.";
            }
            else{
                document.getElementById("lastCount").innerHTML = "<i class=\"fa fa-check\" aria-hidden=\"true\"></i> " + request.message +" actions effectuées.";
            }
        }
    });



}
