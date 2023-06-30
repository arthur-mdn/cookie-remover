// history.js
function showHistory() {
    let storage = chrome.storage || browser.storage;
    storage.local.get(['history'], function(result) {
        let history = result.history || [];
        // Trier l'historique du plus récent au plus ancien
        history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        let historyContainer = document.getElementById('historyContainer');

        if (history.length === 0) {
            historyContainer.innerHTML = "<p>Aucune action n'a été effectuée pour le moment.</p>";
        } else {
            // Créer un objet pour regrouper les actions par date/heure
            let groupedHistory = {};

            history.forEach((action) => {
                // Utiliser la date/heure comme clé (en tant que chaîne)
                let date = new Date(action.timestamp);
                let formattedDate = date.toLocaleString(); // Utilise le format de date/heure local

                // Si cette clé n'existe pas déjà, initialiser avec un tableau vide
                if (!groupedHistory[formattedDate]) {
                    groupedHistory[formattedDate] = [];
                }

                // Ajouter l'action à la liste des actions pour cette date/heure
                groupedHistory[formattedDate].push(action);
            });

            // Parcourir chaque date/heure dans l'objet groupedHistory
            for (let timestamp in groupedHistory) {
                let actionList = groupedHistory[timestamp];

                let timestampDiv = document.createElement('div');
                timestampDiv.classList.add("history_enrouleur");

                // Créer un élément i pour afficher l'icône
                let iconI = document.createElement('i');
                iconI.className = 'fa fa-arrow-up'; // Par défaut, les éléments sont enroulés
                iconI.setAttribute('aria-hidden', 'true');
                timestampDiv.appendChild(iconI);

                // Ajouter le timestamp après l'icône
                let textSpan = document.createElement('span');
                textSpan.innerHTML = ` ${timestamp} <span style="color:#409ceb; font-weight: bold;">(${ actionList.length})</span>`;
                timestampDiv.appendChild(textSpan);

                historyContainer.appendChild(timestampDiv);

                // Créer un tableau pour stocker les éléments d'action pour ce timestamp
                let actionDivs = [];

                actionList.forEach((action) => {
                    let actionDiv = document.createElement('div');
                    actionDiv.classList.add("action");
                    actionDiv.classList.add("rule");

                    let iconAndInfoDiv = document.createElement('div');
                    iconAndInfoDiv.classList.add("iconAndInfoDiv");

                    let iconDiv = document.createElement('div');
                    if(action.action === "hide"){
                        iconDiv.innerHTML = `<i class="fa fa-times-circle" aria-hidden="true"></i>`;
                        iconDiv.title = `Cacher l'élément`;
                    }else if(action.action === "destroy"){
                        iconDiv.innerHTML = `<i class="fa fa-trash" aria-hidden="true"></i>`;
                        iconDiv.title = `Détruire l'élément`;
                    }else if(action.action === "removeClass"){
                        iconDiv.innerHTML = `<i class="fa fa-minus-circle" aria-hidden="true"></i>`;
                        iconDiv.title = `Retirer une classe à l'élément`;
                    }else if(action.action === "addClass"){
                        iconDiv.innerHTML = `<i class="fa fa-plus-circle" aria-hidden="true"></i>`;
                        iconDiv.title = `Ajouter une classe à l'élément`;
                    }else if(action.action === "addStyle"){
                        iconDiv.innerHTML = `<i class="fa fa-paint-brush" aria-hidden="true"></i>`;
                        iconDiv.title = `Ajouter du style à l'élément`;
                    }

                    let infosDiv = document.createElement('div');
                    infosDiv.style.width = "100%";

                    let selectorDiv = document.createElement('div');
                    if(action.selector === "id"){
                        selectorDiv.textContent = `#${action.selection}`;
                    }else if(action.selector === "class"){
                        selectorDiv.textContent = `.${action.selection}`;
                    }else if(action.selector === "querySelector"){
                        selectorDiv.textContent = `querySelector("${action.selection}")`;
                    }
                    selectorDiv.style.fontWeight = "bold";
                    infosDiv.appendChild(selectorDiv);

                    let actionNameDiv = document.createElement('div');
                    if(action.action === "hide"){
                        actionNameDiv.textContent = `Cacher l'élément`;
                    }else if(action.action === "destroy"){
                        actionNameDiv.textContent = `Détruire l'élément`;
                    }else if(action.action === "removeClass"){
                        actionNameDiv.textContent = `Retirer la classe : .${action.actionValue} `;
                    }else if(action.action === "addClass"){
                        actionNameDiv.textContent = `Ajouter la classe : .${action.actionValue} `;
                    }else if(action.action === "addStyle"){
                        actionNameDiv.textContent = `Ajouter du style : ${action.actionValue} `;
                    }
                    infosDiv.appendChild(actionNameDiv);

                    let urlDiv = document.createElement('div');
                    urlDiv.textContent = `${action.url}`;
                    urlDiv.style.color = "lightgrey";
                    infosDiv.appendChild(urlDiv);

                    let elementDiv = document.createElement('div');
                    let pre = document.createElement('pre');
                    pre.classList.add("pre_text_wrap");
                    let code = document.createElement('code');

// Définir la classe du code à "html"
                    code.className = "html";

// Échapper le HTML
                    code.textContent = action.elementHTML;

// Ajouter le code à la balise <pre>
                    pre.appendChild(code);

// Ajouter <pre> à votre div
                    elementDiv.appendChild(pre);

// Ajouter la div à votre conteneur d'informations
                    infosDiv.appendChild(elementDiv);

// Mettre en évidence le code avec Highlight.js
                    hljs.highlightBlock(code);


                    iconAndInfoDiv.appendChild(iconDiv);
                    iconAndInfoDiv.appendChild(infosDiv);

                    actionDiv.appendChild(iconAndInfoDiv);

                    actionDivs.push(actionDiv);

                    historyContainer.appendChild(actionDiv);
                });
                document.getElementById("loadingHistory").style.display = "none"; //remove loading screen

                // Ajouter un gestionnaire d'événements 'click' au timestampDiv
                timestampDiv.addEventListener('click', function() {
                    // Basculer l'affichage des éléments d'action pour ce timestamp
                    actionDivs.forEach(function(actionDiv) {
                        if (actionDiv.style.display === 'none') {
                            actionDiv.style.display = 'block';
                            iconI.className = 'fa fa-arrow-up';

                        } else {
                            actionDiv.style.display = 'none';
                            iconI.className = 'fa fa-arrow-down';

                        }
                    });
                });
            }
        }
    });
}




