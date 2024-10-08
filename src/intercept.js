// intercept.js
function handleSubmit() {
    // console.error("yo");

    let banSelector = document.querySelector("select[name='banSelector']").value;
    let banSelection = document.querySelector("input[name='banSelection']").value;
    let banAction = document.querySelector("select[name='banAction']").value;
    let banActionValue = document.querySelector("input[name='banActionValue']").value;

    let authorized_selectors = ["id", "class", "querySelector"];
    if (!authorized_selectors.includes(banSelector)) {
        console.error('Merci de saisir un selector valide.');
        return;
    }
    let authorized_actions = ["hide","destroy", "removeClass", "addClass", "addStyle", "addAttribute", "removeAttribute"];
    if (!authorized_actions.includes(banAction)) {
        console.error('Merci de saisir une action valide.');
        return;
    }

    let actions_that_needs_value = ["removeClass", "addClass", "addStyle", "addAttribute", "removeAttribute"];

    if (actions_that_needs_value.includes(banAction)) {
        if(!banActionValue){
            console.error('Merci de saisir une valeur d\'action valide.');
            return;
        }
    }

    let storage = chrome.storage || browser.storage;

    // Récupérer l'URL de l'onglet actuellement actif
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let currentTab = tabs[0]; // Il devrait y avoir toujours au moins un onglet actif
        let currentUrl = currentTab.url;

        storage.local.get(["banlist"], function(result) {
            let banlist = result.banlist || [];
            let alreadyExist = banlist.some(rule => rule.selector === banSelector && rule.selection === banSelection && rule.action === banAction && rule.actionValue === banActionValue);
            if (!alreadyExist) {
                if(actions_that_needs_value.includes(banAction)){
                    // console.error(banActionValue);
                    banlist.push({
                        selector: banSelector,
                        selection: banSelection,
                        action: banAction,
                        actionValue: banActionValue,
                        date: new Date().toISOString(),
                        sourceUrl: currentUrl, // Ajoutez l'URL de l'onglet actuel ici
                        default: false
                    });
                }else{
                    banlist.push({
                        selector: banSelector,
                        selection: banSelection,
                        action: banAction,
                        date: new Date().toISOString(),
                        sourceUrl: currentUrl, // Ajoutez l'URL de l'onglet actuel ici
                        default: false
                    });
                }
                // console.log(banlist);
                chrome.storage.local.set({ banlist }, function() {
                    setAvailableTabs();
                    loadContent.call(document.getElementById("list"));
                });
            } else {
                console.error('Existe déjà');
            }
        });
    });
}
