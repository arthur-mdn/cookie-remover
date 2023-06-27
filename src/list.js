// list.js
function showList(){
    // console.error("yo");
    let storage = chrome.storage || browser.storage;
    storage.local.get(['banlist', 'showDefault'], function(result) {
        let banlist = result.banlist || [];
        let showDefault = result.showDefault !== undefined ? result.showDefault : true;
        let rulesContainer = document.getElementById('rulesContainer');
        let hiddenDefault = 0;
        let rulesShowed = 0;
        rulesContainer.innerHTML = '<h3 style="margin-right:auto">Liste des actions</h3>';

        // Split banlist into defaultRules and nonDefaultRules
        let defaultRules = banlist.filter(rule => rule.default === true);
        // Filter the non default rules and sort them from most recent to oldest
        let nonDefaultRules = banlist.filter(rule => rule.default !== true).sort((a, b) => new Date(b.date) - new Date(a.date));



        // Combine the two lists, with nonDefaultRules first
        let combinedList = nonDefaultRules.concat(defaultRules);

        if (combinedList.length === 0) {
            rulesContainer.innerHTML = "<p>Aucune action n'a été ajoutée pour le moment.</p>";
        } else {
            combinedList.forEach((rule, index) => {
                if(nonDefaultRules.length === 0 && index === 0){
                    rulesContainer.innerHTML += "<p  style='display: flex; justify-content: center;'>Aucune action n'a été ajoutée pour le moment.</p>";
                }
                if (index === nonDefaultRules.length && showDefault === true) {
                    let defaultRulesLabel = document.createElement('p');
                    defaultRulesLabel.innerHTML = "<i class=\"fa fa-arrow-down\" aria-hidden=\"true\"></i> Actions par défaut <i class=\"fa fa-arrow-down\" aria-hidden=\"true\"></i>";
                    defaultRulesLabel.style.display = "flex";
                    defaultRulesLabel.style.gap = "5px";
                    defaultRulesLabel.style.justifyContent = "center";
                    rulesContainer.appendChild(defaultRulesLabel);
                }

                // If the rule is a default rule and showDefault is false, skip to the next rule
                if (rule.default === true && showDefault === false) {
                    hiddenDefault++;
                    return;
                }
                let ruleDiv = document.createElement('div');
                ruleDiv.classList.add("rule");

                let iconAndInfoDiv = document.createElement('div');
                iconAndInfoDiv.classList.add("iconAndInfoDiv");

                let iconDiv = document.createElement('div');
                if(rule.action === "hide"){
                    iconDiv.innerHTML = `<i class="fa fa-times-circle" aria-hidden="true"></i>`;
                    iconDiv.title = `Cacher l'élément`;
                }else if(rule.action === "removeClass"){
                    iconDiv.innerHTML = `<i class="fa fa-minus-circle" aria-hidden="true"></i>`;
                    iconDiv.title = `Retirer une classe à l'élément`;
                }else if(rule.action === "addClass"){
                    iconDiv.innerHTML = `<i class="fa fa-plus-circle" aria-hidden="true"></i>`;
                    iconDiv.title = `Ajouter une classe à l'élément`;
                }


                let infosDiv = document.createElement('div');

                let selectorDiv = document.createElement('div');
                if(rule.selector === "id"){
                    selectorDiv.textContent = `#${rule.selection}`;
                }else if(rule.selector === "class"){
                    selectorDiv.textContent = `.${rule.selection}`;
                }else if(rule.selector === "querySelector"){
                    selectorDiv.textContent = `querySelector("${rule.selection}")`;
                }
                selectorDiv.style.fontWeight = "bold";
                infosDiv.appendChild(selectorDiv);

                let actionDiv = document.createElement('div');
                if(rule.action === "hide"){
                    actionDiv.textContent = `Cacher l'élément`;
                }else if(rule.action === "removeClass"){
                    actionDiv.textContent = `Retirer la classe : .${rule.actionValue} `;
                }else if(rule.action === "addClass"){
                    actionDiv.textContent = `Ajouter la classe : .${rule.actionValue} `;
                }
                // else if(rule.action == "querySelector"){
                //     actionDiv.textContent = `querySelector("${rule.action}")`;
                // }
                infosDiv.appendChild(actionDiv);


                let dateDiv = document.createElement('div');
                let date = new Date(rule.date);
                let formattedDate = date.toLocaleString(); // Utilise le format de date/heure local
                if(!rule.default){
                //     dateDiv.textContent = "par défaut";
                // }else{
                    dateDiv.textContent = `${formattedDate}`;
                    dateDiv.style.color = "lightgrey";
                }
                infosDiv.appendChild(dateDiv);


                if(rule.sourceUrl){
                    let urlDiv = document.createElement('div');
                    urlDiv.textContent = `${rule.sourceUrl}`;

                    infosDiv.appendChild(urlDiv);
                }


                // Create delete button
                let deleteButton = document.createElement('button');
                if(rule.default){
                    deleteButton.classList.add("disabled");
                    deleteButton.title = "Impossible de supprimer les actions par défaut";
                }
                deleteButton.innerHTML = "<i class=\"fa fa-trash\" aria-hidden=\"true\"></i>";
                deleteButton.addEventListener('click', () => {
                    // Check if the rule is not a default rule before removing
                    let indexInBanlist = banlist.findIndex(banlistRule => banlistRule.date === rule.date && banlistRule.selector === rule.selector && banlistRule.selection === rule.selection && banlistRule.action === rule.action && banlistRule.actionValue === rule.actionValue && banlistRule.default === rule.default);

                    if (indexInBanlist !== -1) {
                        // Remove the rule from the banlist
                        banlist.splice(indexInBanlist, 1);
                        // Update the storage
                        storage.local.set({banlist}, function() {
                            // Reload the list
                            showList();
                        });
                    }
                });

                iconAndInfoDiv.appendChild(iconDiv);
                iconAndInfoDiv.appendChild(infosDiv);

                ruleDiv.appendChild(iconAndInfoDiv);
                ruleDiv.appendChild(deleteButton);


                rulesContainer.appendChild(ruleDiv);
                if(rule.default){

                }
                rulesShowed++;
            });
            if(hiddenDefault > 0){
                rulesContainer.innerHTML += "<p style='display: flex; justify-content: center;'>Les actions par défaut sont masquées.</p>";
            }
        }
    });
}
