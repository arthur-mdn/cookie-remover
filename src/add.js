//add.js
function showForm(){

    function setUnavailableTabsCauseSelection(){
        const buttons = document.getElementsByClassName("tab-button");

        let myTimeout;
        for(let i = 0; i < buttons.length; i++) {
            let newButton = buttons[i].cloneNode(true);
            buttons[i].parentNode.replaceChild(newButton, buttons[i]);

            newButton.classList.add("disabled");
            newButton.addEventListener("click", function(){
                // loadContent.call(document.getElementById("add"));
                document.getElementById("selectButton").style.border = "1px solid red";
                document.getElementById("selectButton").style.color = "red";
                document.getElementById("need_to_cancel_selection_2").style.display = "block";
                clearTimeout(myTimeout);
                myTimeout = setTimeout(function(){
                    document.getElementById("selectButton").style.border = "1.5px solid var(--placeholder-text-color)";
                    document.getElementById("selectButton").style.color = "var(--text-color)";
                    document.getElementById("need_to_cancel_selection_2").style.display = "none";
                }, 1000);
            });
        }
    }

    function addFormSubmitListener() {
        const banForm = document.getElementById('banForm');
        if (banForm) {
            banForm.addEventListener('submit', function(event){
                event.preventDefault();
                chrome.storage.local.remove('selectedElement', function() {
                    handleSubmit();
                });
            });
        }
    }
    addFormSubmitListener();

    let banForm = document.getElementById('banForm');
    let banAction = document.querySelector('select[name="banAction"]');
    let modifyOptions = document.querySelector('.modify_options');
    let banActionValue = document.querySelector('#banActionValue');

    chrome.storage.local.get('selectedElement', function(data) {
        const elementInfo = data.selectedElement;
        if (elementInfo) { // Ceci vérifie déjà si elementInfo est défini et non vide
           showFormWithSelectedElement(elementInfo);
        }
    });

    // Afficher ou masquer les options de modification en fonction de l'action sélectionnée
    banAction.addEventListener('change', function() {
        if (banAction.value === 'addClass' || banAction.value === 'removeClass') {
            modifyOptions.style.display = 'block';
            banActionValue.removeAttribute("disabled");
        } else {
            modifyOptions.style.display = 'none';
            banActionValue.setAttribute("disabled", "true");
        }
    });

    let isSelecting = false;
    let mouseoverHandler;
    let mouseoutHandler;
    let clickHandler;

    function addSelectButtonListener() {
        const selectButton = document.getElementById('selectButton');
        if (selectButton) {
            selectButton.addEventListener('click', function(event){
                if (isSelecting) {
                    cancelSelection();
                } else {
                    startElementSelection();
                }
            });
        }
    }
    function addCancelSelectButtonListener() {
        const cancelSelectButton = document.getElementById('cancelSelectButton');
        if (cancelSelectButton) {
            cancelSelectButton.addEventListener('click', function(event){
                chrome.storage.local.remove('selectedElement', function() {
                    // Faire quelque chose après la suppression.
                    window.location.href = "../popup/popup.html?tab=add";
                });
            });
        }
    }

    function startElementSelection() {
        isSelecting = true;
        document.getElementById("selectButton").innerHTML = "<i class=\"fa fa-stop\" aria-hidden=\"true\"></i><span>Annuler</span>";
        executeScriptInCurrentTab(selectElement, {});
        console.log('ici');
        setUnavailableTabsCauseSelection();
    }

    function cancelSelection() {
        isSelecting = false;
        document.getElementById("selectButton").innerHTML = "<i class=\"fa fa-hand-pointer-o\" aria-hidden=\"true\"></i><span>Sélectionner</span>";
        executeScriptInCurrentTab(cancelElementSelection, {});
        window.location.href = "../popup/popup.html?tab=add";
    }

    addSelectButtonListener();
    addCancelSelectButtonListener();

    function selectElement() {
        let previouslySelectedElement;
        let overlay = document.createElement('div');
        overlay.id = 'overlay';
        overlay.style.position = 'fixed';
        overlay.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '99999999999999999999999999';

        function addSelectionIndicator(element) {
            if (previouslySelectedElement) {
                removeSelectionIndicator();
            }
            previouslySelectedElement = element;
            let rect = element.getBoundingClientRect();
            overlay.style.top = `${rect.top}px`;
            overlay.style.left = `${rect.left}px`;
            overlay.style.width = `${rect.width}px`;
            overlay.style.height = `${rect.height}px`;
            document.body.appendChild(overlay);
        }

        function removeSelectionIndicator() {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }

        mouseoverHandler = function(event) {
            const element = event.target;
            addSelectionIndicator(element);
            event.stopPropagation();
        };

        mouseoutHandler = function(event) {
            removeSelectionIndicator();
            event.stopPropagation();
        };

        clickHandler = function(event) {
            // Stop propagation and prevent default
            event.stopPropagation();
            event.preventDefault();

            // Remove all event listeners and visual indicator
            removeSelectionIndicator();
            document.removeEventListener('mouseover', mouseoverHandler);
            document.removeEventListener('mouseout', mouseoutHandler);
            document.removeEventListener('click', clickHandler);

            // Handle the element
            const element = event.target;

            const tagName = element.tagName.toLowerCase();
            let elementInfo = {
                tagName: tagName,
                id: element.id,
                classes: Array.from(element.classList),
                querySelectors: []
            };

            // Base selectors
            if (element.id) elementInfo.querySelectors.push(`#${element.id}`);
            for(const className of element.classList) {
                elementInfo.querySelectors.push(`${tagName}.${className}`);
            }

            // Parent-child selector with index
            const parent = element.parentElement;
            if (parent) {
                const parentTag = parent.tagName.toLowerCase();
                const parentClasses = Array.from(parent.classList);
                const siblingIndex = Array.from(parent.children).indexOf(element) + 1;

                let parentSelector = parentTag;
                if (parent.id) parentSelector = `#${parent.id}`;
                else if (parentClasses.length > 0) parentSelector = `${parentTag}.${parentClasses.join('.')}`;

                elementInfo.querySelectors.push(`${parentSelector} > :nth-child(${siblingIndex})`);
            }

            // Form elements selector
            if (['input', 'select', 'textarea', 'button'].includes(tagName) && element.name) {
                elementInfo.querySelectors.push(`${tagName}[name="${element.name}"]`);
            }

            chrome.runtime.sendMessage({ type: "elementSelected", message: elementInfo });

        }

        document.addEventListener('click', clickHandler, { once: true });

        document.addEventListener('mouseover', mouseoverHandler);
        document.addEventListener('mouseout', mouseoutHandler);
    }

    function cancelElementSelection() {
        // Remove event listeners
        document.removeEventListener('mouseover', mouseoverHandler);
        document.removeEventListener('mouseout', mouseoutHandler);
        document.removeEventListener('click', clickHandler);

        // Remove the overlay if it's still there
        let overlay = document.getElementById('overlay');
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }
}

function showFormWithSelectedElement(element) {
    // Récupérer le select original et le champ d'entrée
    let originalSelectElement = document.querySelector('select[name="banSelector"]');
    let inputElement = document.querySelector('input[name="banSelection"]');

    // Créer un nouveau div pour stocker les boutons radio et l'insérer avant le select original
    let newDiv = document.createElement("div");
    newDiv.style.width = "100%";
    let selectorChoiceDiv = document.getElementById("selector_choice");
    selectorChoiceDiv.appendChild(newDiv);

    let firstRadioButton;

    // Ajouter le bouton radio id si l'id existe
    if (element.id) {
        let inputContainer = document.createElement("div");
        inputContainer.className = "radio_container";
        newDiv.appendChild(inputContainer);

        let idRadioButton = document.createElement("input");
        idRadioButton.type = "radio";
        idRadioButton.name = "radioGroup";
        idRadioButton.value = "id";
        idRadioButton.id = "idRadioButton";
        idRadioButton.dataset.value = element.id;
        inputContainer.appendChild(idRadioButton);

        if (!firstRadioButton) firstRadioButton = idRadioButton;

        let idLabel = document.createElement("label");
        idLabel.textContent = "#" + element.id;
        idLabel.htmlFor = "idRadioButton";
        inputContainer.appendChild(idLabel);
    }

    // Ajouter les boutons radio de classe
    for(let i = 0; i < element.classes.length; i++) {
        let inputContainer = document.createElement("div");
        inputContainer.className = "radio_container";
        newDiv.appendChild(inputContainer);

        let classRadioButton = document.createElement("input");
        classRadioButton.type = "radio";
        classRadioButton.name = "radioGroup";
        classRadioButton.value = "class";
        classRadioButton.id = "classRadioButton" + i;
        classRadioButton.dataset.value = element.classes[i];
        inputContainer.appendChild(classRadioButton);

        if (!firstRadioButton) firstRadioButton = classRadioButton;

        let classLabel = document.createElement("label");
        classLabel.textContent = "." + element.classes[i];
        classLabel.htmlFor = "classRadioButton" + i;
        inputContainer.appendChild(classLabel);
    }

    // Ajouter les boutons radio de querySelector
    for(let i = 0; i < element.querySelectors.length; i++) {
        let inputContainer = document.createElement("div");
        inputContainer.className = "radio_container";
        newDiv.appendChild(inputContainer);

        let querySelectorRadioButton = document.createElement("input");
        querySelectorRadioButton.type = "radio";
        querySelectorRadioButton.name = "radioGroup";
        querySelectorRadioButton.value = "querySelector";
        querySelectorRadioButton.id = "querySelectorRadioButton" + i;
        querySelectorRadioButton.dataset.value = element.querySelectors[i];
        inputContainer.appendChild(querySelectorRadioButton);

        if (!firstRadioButton) firstRadioButton = querySelectorRadioButton;

        let querySelectorLabel = document.createElement("label");
        querySelectorLabel.textContent = "querySelector(" + element.querySelectors[i]+")";
        querySelectorLabel.htmlFor = "querySelectorRadioButton" + i;
        inputContainer.appendChild(querySelectorLabel);
    }

    // Sélectionner le premier bouton radio et remplir les champs correspondants
    if (firstRadioButton) {
        firstRadioButton.checked = true;
        originalSelectElement.value = firstRadioButton.value;
        inputElement.value = firstRadioButton.dataset.value;
    }

    // Ajouter un écouteur d'événement pour mettre à jour le champ d'entrée lorsqu'un bouton radio est sélectionné
    newDiv.addEventListener('change', function(event) {
        if (event.target && event.target.nodeName == "INPUT") {
            let selectedType = event.target.value;
            let selectedValue = event.target.dataset.value;

            originalSelectElement.value = selectedType;
            inputElement.value = selectedValue;
        }
    });

    document.getElementById("selector_default").style.display = "none";
    document.getElementById("selector_choice").style.display = "block";
    console.log(element);
}

