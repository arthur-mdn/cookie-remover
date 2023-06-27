// settings.js

function toggleDarkMode(set){
    const root = document.documentElement;
    if(set){
        root.style.setProperty('--text-color', '#FFFFFF');
        root.style.setProperty('--sub-text-color', '#AAAAAA');
        root.style.setProperty('--placeholder-text-color', '#464646');
        root.style.setProperty('--bg-color', '#121212');
        root.style.setProperty('--card-bg-color', '#1D1D1D');
        root.style.setProperty('--sub-card-bg-color', '#2D2D2D');
        root.style.setProperty('--activated-color', '#409ceb');
        root.style.setProperty('--filter--black-to-white', 'invert(100%) sepia(0%) saturate(0%) hue-rotate(31deg) brightness(100%) contrast(101%)');
        root.style.setProperty('--shadow-medium', 'rgb(255 255 255 / 34%) 0px 0px 0.25em, rgb(255 255 255 / 18%) 0px 0.25em 1em');

    }else{
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
            clearHistoryButton.disabled = true;
        }

        // Add event listener to clear the history when the button is clicked
        clearHistoryButton.addEventListener('click', function() {
            let confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer l'historique ? Cette action est irréversible.");
            if(confirmed) {
                chrome.storage.local.set({"history": []}, function() {
                    console.log('Historique effacé');
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
}
