// settings.js

function toggleDarkMode(set) {
    const root = document.documentElement;
    if (set) {
        root.style.setProperty('--text-color', '#FFFFFF');
        root.style.setProperty('--sub-text-color', '#AAAAAA');
        root.style.setProperty('--placeholder-text-color', '#464646');
        root.style.setProperty('--bg-color', '#121212');
        root.style.setProperty('--card-bg-color', '#1D1D1D');
        root.style.setProperty('--sub-card-bg-color', '#2D2D2D');
        root.style.setProperty('--activated-color', '#409ceb');
        root.style.setProperty('--filter--black-to-white', 'invert(100%) sepia(0%) saturate(0%) hue-rotate(31deg) brightness(100%) contrast(101%)');
        root.style.setProperty('--shadow-medium', 'rgb(255 255 255 / 34%) 0px 0px 0.25em, rgb(255 255 255 / 18%) 0px 0.25em 1em');
    } else {
        root.style.setProperty('--text-color', 'black');
        root.style.setProperty('--sub-text-color', 'grey');
        root.style.setProperty('--placeholder-text-color', '#cfcfcf');
        root.style.setProperty('--bg-color', '#f0f0f0');
        root.style.setProperty('--card-bg-color', '#ffffff');
        root.style.setProperty('--sub-card-bg-color', '#f0f0f0');
        root.style.setProperty('--activated-color', '#409ceb');
        root.style.setProperty('--filter--black-to-white', 'invert(0%) sepia(0%) saturate(0%) hue-rotate(31deg) brightness(100%) contrast(101%)');
        root.style.setProperty('--shadow-medium', 'rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em');
    }
}

function showSettings(){
    let settingsContainer = document.getElementById('settingsContainer');

    // Get the current value of the 'showDefault' setting
    chrome.storage.local.get("showDefault", function(result) {
        let showDefault = result.showDefault !== undefined ? result.showDefault : true;
    
        // Create a container div
        let showDefaultContainer = document.createElement("div");
    
        // Create a checkbox
        let showDefaultCheckbox = document.createElement("input");
        showDefaultCheckbox.type = "checkbox";
        showDefaultCheckbox.id = "showDefaultCheckbox";
        showDefaultCheckbox.checked = showDefault;
    
        // Add event listener to update the value of showDefault in storage when the checkbox is clicked
        showDefaultCheckbox.addEventListener('change', function() {
            let checked = this.checked; // Store the value in a variable
            chrome.storage.local.set({"showDefault": checked}, function() {
                console.log('ShowDefault set to ' + checked);
            });
        });
    
        // Create a label element
        let showDefaultLabel = document.createElement("label");
        showDefaultLabel.setAttribute("for","showDefaultCheckbox");
        showDefaultLabel.innerText = "Montrer les actions par défaut";
    
        // Append the checkbox to the container
        showDefaultContainer.appendChild(showDefaultCheckbox);
    
        // Append the label to the container
        showDefaultContainer.appendChild(showDefaultLabel);
    
        // Add the container to the settings container
        settingsContainer.appendChild(showDefaultContainer);
    });

    chrome.storage.local.get("brute", function(result) {
        let brute = result.brute || false;

        // Create a container div
        let bruteContainer = document.createElement("div");

        // Create a checkbox
        let bruteCheckbox = document.createElement("input");
        bruteCheckbox.type = "checkbox";
        bruteCheckbox.id = "bruteCheckbox";
        bruteCheckbox.checked = brute;

        // Add event listener to update the value of brute in storage when the checkbox is clicked
        bruteCheckbox.addEventListener('change', function() {
            let checked = this.checked; // Store the value in a variable
            chrome.storage.local.set({"brute": checked}, function() {
                console.log('Brute set to ' + checked);
            });
        });

        // Create a label element
        let bruteLabel = document.createElement("label");
        bruteLabel.innerText = "Bruteforce le hide";
        bruteLabel.setAttribute("for","bruteCheckbox");

        // Append the checkbox to the container
        bruteContainer.appendChild(bruteCheckbox);

        // Append the label to the container
        bruteContainer.appendChild(bruteLabel);

        // Add the container to the settings container
        settingsContainer.appendChild(bruteContainer);
    });

    chrome.storage.local.get("forceImportant", function(result) {
        let forceImportant = result.forceImportant || false;

        let forceImportantContainer = document.createElement("div");

        let forceImportantCheckbox = document.createElement("input");
        forceImportantCheckbox.type = "checkbox";
        forceImportantCheckbox.id = "forceImportantCheckbox";
        forceImportantCheckbox.checked = forceImportant;

        forceImportantCheckbox.addEventListener('change', function() {
            let checked = this.checked;
            chrome.storage.local.set({"forceImportant": checked}, function() {
                console.log('forceImportant set to ' + checked);
            });
        });

        let forceImportantLabel = document.createElement("label");
        forceImportantLabel.innerText = "Forcer le !important";
        forceImportantLabel.setAttribute("for","forceImportantCheckbox");

        forceImportantContainer.appendChild(forceImportantCheckbox);

        forceImportantContainer.appendChild(forceImportantLabel);

        settingsContainer.appendChild(forceImportantContainer);
    });

    chrome.storage.local.get("darkmode", function(result) {
        let darkmode = result.darkmode || false;

        // Create a container div
        let darkmodeContainer = document.createElement("div");

        // Create a checkbox
        let darkmodeCheckbox = document.createElement("input");
        darkmodeCheckbox.type = "checkbox";
        darkmodeCheckbox.id = "darkmodeCheckbox";
        darkmodeCheckbox.checked = darkmode;

        // Add event listener to update the value of darkmode in storage when the checkbox is clicked
        darkmodeCheckbox.addEventListener('change', function() {
            let checked = this.checked; // Store the value in a variable
            chrome.storage.local.set({"darkmode": checked}, function() {
                console.log('darkmode set to ' + checked);
                toggleDarkMode(checked);
            });
        });

        // Create a label element
        let darkmodeLabel = document.createElement("label");
        darkmodeLabel.innerText = "Mode sombre";
        darkmodeLabel.setAttribute("for","darkmodeCheckbox");

        // Append the checkbox to the container
        darkmodeContainer.appendChild(darkmodeCheckbox);

        // Append the label to the container
        darkmodeContainer.appendChild(darkmodeLabel);

        // Add the container to the settings container
        settingsContainer.appendChild(darkmodeContainer);
    });

    chrome.storage.local.get("cleanAuto", function(result) {
        let cleanAuto = result.cleanAuto || false;

        // Create a container div
        let cleanAutoContainer = document.createElement("div");

        // Create a checkbox
        let cleanAutoCheckbox = document.createElement("input");
        cleanAutoCheckbox.type = "checkbox";
        cleanAutoCheckbox.id = "cleanAutoCheckbox";
        cleanAutoCheckbox.checked = cleanAuto;

        // Add event listener to update the value of cleanAuto in storage when the checkbox is clicked
        cleanAutoCheckbox.addEventListener('change', function() {
            let checked = this.checked; // Store the value in a variable
            chrome.storage.local.set({"cleanAuto": checked}, function() {
                console.log('cleanAuto set to ' + checked);
            });
        });

        // Create a label element
        let cleanAutoLabel = document.createElement("label");
        cleanAutoLabel.innerText = "Nettoyage automatique";
        cleanAutoLabel.setAttribute("for","cleanAutoCheckbox");

        // Append the checkbox to the container
        cleanAutoContainer.appendChild(cleanAutoCheckbox);

        // Append the label to the container
        cleanAutoContainer.appendChild(cleanAutoLabel);

        // Add the container to the settings container
        settingsContainer.appendChild(cleanAutoContainer);
    });

    chrome.storage.local.get("bannedFromAutoCleanWebsites", function(result) {
        let bannedFromAutoCleanWebsites = result.bannedFromAutoCleanWebsites || [];
        // console.log(bannedFromAutoCleanWebsites);

        // Create a container div for the 'clear history' button
        let bannedFromAutoCleanWebsitesContainer = document.createElement("div");
        bannedFromAutoCleanWebsitesContainer.style.display = "flex";
        bannedFromAutoCleanWebsitesContainer.style.justifyContent = "center";

        // Create the 'clear history' button
        let clearbannedFromAutoCleanWebsitesButton = document.createElement("button");
        clearbannedFromAutoCleanWebsitesButton.id = "clearbannedFromAutoCleanWebsitesButton";
        clearbannedFromAutoCleanWebsitesButton.innerText = "Supprimer les pages bannies du nettoyage automatique";

        // If history is empty, disable the button
        if (bannedFromAutoCleanWebsites.length === 0) {
            clearbannedFromAutoCleanWebsitesButton.setAttribute("disabled", "true");
        }
        // console.log(bannedFromAutoCleanWebsites.length)

        // Add event listener to clear the history when the button is clicked
        clearbannedFromAutoCleanWebsitesButton.addEventListener('click', function() {
            let confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer les pages bannies du nettoyage automatique ? Cette action est irréversible.");
            if (confirmed) {
                chrome.storage.local.set({"bannedFromAutoCleanWebsites": []}, function() {
                    console.log('Pages bannies du nettoyage automatique effacé');
                    loadContent.call(document.getElementById("settings"));
                });
            }
        });

        // Append the button to the container
        bannedFromAutoCleanWebsitesContainer.appendChild(clearbannedFromAutoCleanWebsitesButton);

        // Add the container to the settings container
        settingsContainer.appendChild(bannedFromAutoCleanWebsitesContainer);
    });

    chrome.storage.local.get("history", function(result) {
        let history = result.history || [];

        // Create a container div for the 'clear history' button
        let clearHistoryContainer = document.createElement("div");
        clearHistoryContainer.style.display = "flex";
        clearHistoryContainer.style.justifyContent = "center";

        // Create the 'clear history' button
        let clearHistoryButton = document.createElement("button");
        clearHistoryButton.id = "clearHistoryButton";
        clearHistoryButton.innerText = "Supprimer l'historique";

        // If history is empty, disable the button
        if (history.length === 0) {
            clearHistoryButton.setAttribute("disabled", "true");
        }

        // Add event listener to clear the history when the button is clicked
        clearHistoryButton.addEventListener('click', function() {
            let confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer l'historique ? Cette action est irréversible.");
            if (confirmed) {
                chrome.storage.local.set({"history": []}, function() {
                    console.log('Historique effacé');
                    loadContent.call(document.getElementById("settings"));
                });
            }
        });

        // Append the button to the container
        clearHistoryContainer.appendChild(clearHistoryButton);

        // Add the container to the settings container
        settingsContainer.appendChild(clearHistoryContainer);
    });

    chrome.storage.local.get("totalCount", function(result) {
        let totalCount = result.totalCount || 0;
        // console.log(totalCount);
        let countDiv = document.createElement("div");
        countDiv.innerText = totalCount + " actions effectuées.";
        countDiv.style.color = "#409ceb";
        countDiv.style.display = "flex";
        countDiv.style.justifyContent = "center";
        countDiv.style.margin = "10px";

        settingsContainer.appendChild(countDiv);
    });

    chrome.storage.local.get("totalCount", function(result) {
        let exportAndImportSettingsContainer = document.createElement("div");
        exportAndImportSettingsContainer.style.display = "flex";
        exportAndImportSettingsContainer.style.justifyContent = "center";
        exportAndImportSettingsContainer.style.gap = "5px";

        let exportSettingsContainer = document.createElement("div");

        let exportSettingsButton = document.createElement("button");
        exportSettingsButton.id = "exportSettingsButton";
        exportSettingsButton.innerHTML = "<i class=\"fa fa-upload\" aria-hidden=\"true\"></i>\n Exporter les paramètres";

        exportSettingsButton.addEventListener('click', function() {
            chrome.storage.local.get([
                'showDefault',
                'brute',
                'darkmode',
                'cleanAuto',
                'bannedFromAutoCleanWebsites',
                'banlist'
            ], function(settings) {

                settings.showDefault = settings.showDefault !== undefined ? settings.showDefault : true;
                settings.brute = settings.brute !== undefined ? settings.brute : false;
                settings.darkmode = settings.darkmode !== undefined ? settings.darkmode : false;
                settings.cleanAuto = settings.cleanAuto !== undefined ? settings.cleanAuto : false;
                settings.banlist = settings.banlist || [];
                settings.bannedFromAutoCleanWebsites = settings.bannedFromAutoCleanWebsites || [];

                // console.log(settings);
                let settingsJSON = JSON.stringify(settings);
                let blob = new Blob([settingsJSON], {type: 'application/json'});
                let url = URL.createObjectURL(blob);

                // Créer un lien temporaire pour le téléchargement
                let downloadLink = document.createElement("a");
                downloadLink.href = url;
                downloadLink.download = 'settings.json';

                // Télécharger le fichier
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);

                // Libérer l'URL
                URL.revokeObjectURL(url);
            });
        });

        exportSettingsContainer.appendChild(exportSettingsButton);
        exportAndImportSettingsContainer.appendChild(exportSettingsContainer);

        let importSettingsContainer = document.createElement("div");

        let importSettingsInput = document.createElement("input");
        importSettingsInput.type = "file";
        importSettingsInput.id = "exportSettingsButton";
        importSettingsInput.style.display = "none";
        importSettingsInput.innerHTML = "Exporter les paramètres";

        let importSettingsButton = document.createElement("button");
        importSettingsButton.id = "importSettingsButton";
        importSettingsButton.innerHTML = "<i class=\"fa fa-download\" aria-hidden=\"true\"></i>\n Importer les paramètres";
        importSettingsButton.addEventListener("click", function(){
            importSettingsInput.click();
        });

        function saveSettings(settings) {
            console.log("Importation des paramètres :", settings);
            return new Promise((resolve, reject) => {
                chrome.storage.local.set(settings, () => {
                    if (chrome.runtime.lastError) {
                        console.error("Erreur d'importation :", chrome.runtime.lastError);
                        return reject(chrome.runtime.lastError);
                    }
                    console.log("Paramètres importés avec succès.");
                    loadContent.call(document.getElementById("settings"));
                    toggleDarkMode(settings.darkmode);
                    resolve();
                });
            });
        }

        async function importSettings(settings) {
            let {brute, cleanAuto, darkmode, banlist, bannedFromAutoCleanWebsites} = settings;

            if (typeof brute !== 'boolean' || typeof cleanAuto !== 'boolean' || typeof darkmode !== 'boolean') {
                console.error("Les paramètres 'brute', 'cleanAuto' et 'darkmode' doivent être des booléens.");
                return;
            }

            if (!Array.isArray(banlist) || !Array.isArray(bannedFromAutoCleanWebsites)) {
                console.error("Les paramètres 'banlist' et 'bannedFromAutoCleanWebsites' doivent être des listes.");
                return;
            }

            console.log("Paramètres valides. Ils vont être importés:", settings);
            try {
                await saveSettings(settings);
            } catch (error) {
                console.error("Erreur lors de l'importation des paramètres:", error);
            }
        }

        importSettingsInput.addEventListener('change', (event) => {
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();

                reader.onload = function(e) {
                    try {
                        const json = JSON.parse(e.target.result);
                        importSettings(json);
                    } catch (error) {
                        console.error("Erreur lors de la lecture du fichier JSON:", error);
                    }
                };

                reader.readAsText(file);
            }
        });


        importSettingsContainer.appendChild(importSettingsButton);
        importSettingsContainer.appendChild(importSettingsInput);

        exportAndImportSettingsContainer.appendChild(importSettingsContainer);
        settingsContainer.appendChild(exportAndImportSettingsContainer);

        let checkUpdatesContainer = document.createElement("div");
        checkUpdatesContainer.style.display = "flex";
        checkUpdatesContainer.style.justifyContent = "center";
        checkUpdatesContainer.style.flexDirection = "column";
        checkUpdatesContainer.style.marginTop = "10px";

        let checkUpdatesLabel = document.createElement("p");
        checkUpdatesLabel.innerText = "";
        checkUpdatesLabel.style.textAlign = "center";
        checkUpdatesLabel.style.display = "none";

        let checkUpdatesButton = document.createElement("button");
        checkUpdatesButton.id = "checkUpdatesButton";
        checkUpdatesButton.innerHTML = "<i class=\"fa fa-refresh\" aria-hidden=\"true\"></i>\n Mettre à jour la liste d'action";

        checkUpdatesButton.addEventListener('click', function() {
            checkUpdatesLabel.style.display = "block";
            checkUpdatesLabel.innerText = "Vérification des mises à jour...";
            checkUpdatesLabel.style.color = "black";
            checkUpdatesButton.setAttribute("disabled", "true");

            fetch("https://raw.githubusercontent.com/arthur-mdn/cookie-remover/main/data/banlist.json")
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    chrome.storage.local.get("banlist", function(result) {
                        let banlist = result.banlist || [];
                        let newBanlist = [];
                        data.forEach((item) => {
                            let found = banlist.find(banlistItem => banlistItem.selector === item.selector && banlistItem.selection === item.selection);
                            if (!found) {
                                newBanlist.push(item);
                            }
                        });
                        if (newBanlist.length > 0) {
                            chrome.storage.local.set({"banlist": banlist.concat(newBanlist)}, function() {
                                console.log('Banlist updated');
                                if (newBanlist.length > 1) {
                                    checkUpdatesLabel.innerText = "Liste d'action mise à jour : " + newBanlist.length + " nouvelles actions.";
                                } else {
                                    checkUpdatesLabel.innerText = "Liste d'action mise à jour : " + newBanlist.length + " nouvelle action.";
                                }
                                checkUpdatesLabel.style.display = "block";
                                checkUpdatesLabel.style.color = "green";
                                checkUpdatesButton.removeAttribute("disabled");
                            });
                        } else {
                            console.log("No new banlist item found");
                            checkUpdatesLabel.innerText = "Vous êtes déjà à jour !";
                            checkUpdatesLabel.style.color = "green";
                            checkUpdatesLabel.style.display = "block";
                            checkUpdatesButton.removeAttribute("disabled");
                        }
                    });
                }).catch((error) => {
                    console.error('Error:', error);
                    checkUpdatesLabel.innerText = "Erreur lors de la mise à jour : " + error;
                    checkUpdatesLabel.style.display = "block";
                    checkUpdatesLabel.style.color = "red";
                    checkUpdatesLabel.style.display = "block";
                    checkUpdatesButton.removeAttribute("disabled");
                });
        });
        checkUpdatesContainer.appendChild(checkUpdatesLabel);
        checkUpdatesContainer.appendChild(checkUpdatesButton);
        settingsContainer.appendChild(checkUpdatesContainer);
    });
}
