// popup.js
// Fetch the JSON file and return the parsed JSON
function fetchDefaultRules() {
    return fetch('/data/banlist.json')
        .then(response => response.json())
        .catch(error => console.error('Error:', error));
}

// Check if any rules are currently stored, and if not, store the default rules
function initializeRules() {
    let storage = chrome.storage || browser.storage;

    storage.local.get(["banlist", "brute"], function(result) {
        const banlist = result.banlist || [];
        const brute = result.brute !== undefined ? result.brute : false;

        // If no banlist exists, fetch and store the default rules
        if (banlist.length === 0) {
            fetchDefaultRules()
                .then(defaultRules => {
                    storage.local.set({"banlist": defaultRules}, function() {
                        console.log('Default rules set');
                    });
                });
        }

        // If brute is not set, store the default value
        if (result.brute === undefined) {
            storage.local.set({"brute": brute}, function() {
                console.log('Default brute value set');
            });
        }
    });
}

// Call this function when your extension starts up
initializeRules();

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

window.onload = () => {
    const buttons = document.getElementsByClassName("tab-button");

    // Check if the URL contains the query parameter "tab=list"
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');

    // if (tabParam === 'list') {
    //     // Load the "List" tab content
    //     loadContent.call(document.getElementById("list"));
    // } else if (tabParam === 'add') {
    //     loadContent.call(document.getElementById("add"));
    // } else {
    //     // Load the default tab content (home)
    // }
    //
    //

    function setUnavailableTabsCauseSelection(){
        let myTimeout;
        for(let i = 0; i < buttons.length; i++) {
            buttons[i].classList.add("disabled");
            buttons[i].addEventListener("click", function(){
                // loadContent.call(document.getElementById("add"));
                document.getElementById("cancelSelectButton").style.border = "1px solid red";
                document.getElementById("cancelSelectButton").style.color = "red";
                document.getElementById("need_to_cancel_selection").style.display = "block";
                clearTimeout(myTimeout);
                myTimeout = setTimeout(function(){
                    document.getElementById("cancelSelectButton").style.border = "1.5px solid var(--placeholder-text-color)";
                    document.getElementById("cancelSelectButton").style.color = "var(--text-color)";
                    document.getElementById("need_to_cancel_selection").style.display = "none";
                }, 1000);
            });
        }
    }
    function setAvailableTabs(){
        console.log(tabParam);
        if (tabParam === 'list') {
            // Load the "List" tab content
            loadContent.call(document.getElementById("list"));
        } else if (tabParam === 'add') {
            loadContent.call(document.getElementById("add"));
        } else {
            loadContent.call(document.getElementById("home"));
        }
        for(let i = 0; i < buttons.length; i++) {
            // Clone the button and replace the old button with the clone
            let newButton = buttons[i].cloneNode(true);
            buttons[i].parentNode.replaceChild(newButton, buttons[i]);

            newButton.classList.remove("disabled");
            newButton.addEventListener("click", loadContent);
        }
    }

    // Charger l'élément sélectionné du stockage lorsque la popup s'ouvre
    chrome.storage.local.get('selectedElement', function(data) {
        const elementInfo = data.selectedElement;
        if (elementInfo) { // Ceci vérifie déjà si elementInfo est défini et non vide
            // Faire quelque chose avec les informations de l'élément, comme les afficher dans la popup
            loadContent.call(document.getElementById("add"));
            setUnavailableTabsCauseSelection();
        }else{
            setAvailableTabs();
        }
    });

    chrome.action.getBadgeText({}, (text) => {
        if (text) { // S'il y a du texte dans le badge (c'est-à-dire si un badge est présent)
            chrome.action.setBadgeText({text: ""}); // Effacer le badge
            loadContent.call(document.getElementById("history"));
        }
    });




    function loadContent() {

        const id = this.id;
        // Add selected class to the active tab
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('selected');
        });
        this.classList.add('selected');

        fetch(`../src/${id}.html`)
            .then(response => response.text())
            .then(data => {
                document.getElementById('content').innerHTML = data;
                setTimeout(addHomeDisplayListener, 0); // Add the form submit listener after loading new content
                setTimeout(addListDisplayListener, 0); // Add the form submit listener after loading new content
                setTimeout(addSettingsDisplayListener, 0); // Add the form submit listener after loading new content
                setTimeout(addFormDisplayListener, 0); // Add the form submit listener after loading new content
                setTimeout(addHistoryDisplayListener, 0); // Add the form submit listener after loading new content
            });
    }






    function addListDisplayListener() {
        const rulesContainer = document.getElementById('rulesContainer');
        if (rulesContainer) {
            showList();
        }
    }
    function addHomeDisplayListener() {
        const homeContainer = document.getElementById('homeContainer');
        if (homeContainer) {
            showHome();
        }
    }
    function addHistoryDisplayListener() {
        const historyContainer = document.getElementById('historyContainer');
        if (historyContainer) {
            showHistory();
        }
    }

    function addSettingsDisplayListener() {
        const settingsContainer = document.getElementById('settingsContainer');
        if (settingsContainer) {
            showSettings();
        }
    }
    function addFormDisplayListener() {
        const form_container = document.getElementById('form_container');
        if (form_container) {
            showForm();
        }
    }


    chrome.storage.local.get("darkmode", function(result) {
        let darkmode = result.darkmode || false;
        toggleDarkMode(darkmode);
    });
}
