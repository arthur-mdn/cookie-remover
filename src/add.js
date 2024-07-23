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
                document.getElementById("selectButton").style.border = "2px solid darkred";
                document.getElementById("selectButton").style.backgroundColor = "red";
                document.getElementById("need_to_cancel_selection_2").style.display = "block";
                clearTimeout(myTimeout);
                myTimeout = setTimeout(function(){
                    document.getElementById("selectButton").style.border = "1.5px solid var(--placeholder-text-color)";
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
    let banActionValueLabel = document.querySelector('label[for="banActionValue"]');

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
            banActionValueLabel.textContent = "Nom de la classe";
        } else if (banAction.value === 'addAttribute' || banAction.value === 'removeAttribute') {
            modifyOptions.style.display = 'block';
            banActionValue.removeAttribute("disabled");
            banActionValueLabel.textContent = "Nom de l'attribut";
        } else if (banAction.value === 'addStyle') {
            modifyOptions.style.display = 'block';
            banActionValue.removeAttribute("disabled");
            banActionValueLabel.textContent = "Style à ajouter";
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
                    // raffraichir la page de l'extension sans utiliser window.location.reload()
                    setAvailableTabs();
                    loadContent.call(document.getElementById("add"));
                });
            });
        }
    }


    function startElementSelection() {
        executeScriptInCurrentTab(selectElement, {})
            .then(() => {
                isSelecting = true;
                document.getElementById("selectButton").innerHTML = "<i class=\"fa fa-stop\" aria-hidden=\"true\"></i><span>Annuler</span>";
                document.getElementById("selectButton").style.backgroundColor = "red";
                setUnavailableTabsCauseSelection();
            })
            .catch((error) => {
            document.getElementById("need_to_cancel_selection_2").innerHTML = "<i class=\"fa fa-times\" aria-hidden=\"true\"></i> Désolé, l'extension ne peut pas être utilisée sur cette page.";
            document.getElementById("need_to_cancel_selection_2").style.color = "red";
            document.getElementById("need_to_cancel_selection_2").style.display = "block";
        });
    }

    function cancelSelection() {
        isSelecting = false;
        document.getElementById("selectButton").innerHTML = "<i class=\"fa fa-hand-pointer-o\" aria-hidden=\"true\"></i><span>Sélectionner</span>";
        executeScriptInCurrentTab(cancelElementSelection, {});
        setAvailableTabs();
        loadContent.call(document.getElementById("add"));
    }

    addSelectButtonListener();
    addCancelSelectButtonListener();

    function selectElement() {
        let previouslySelectedElement;
        let darkOverlay = document.createElement('div');
        darkOverlay.id = 'darkOverlay';
        darkOverlay.style.position = 'fixed';
        darkOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        darkOverlay.style.top = '0';
        darkOverlay.style.left = '0';
        darkOverlay.style.bottom = '0';
        darkOverlay.style.right = '0';
        darkOverlay.style.pointerEvents = 'none';
        darkOverlay.style.zIndex = '99999999999999999999999998';

        let overlay = document.createElement('div');
        overlay.id = 'overlay';
        overlay.style.position = 'fixed';
        overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
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
            document.body.appendChild(darkOverlay);
            document.body.appendChild(overlay);

            darkOverlay.style.clipPath = `polygon(
                0% 0%, 100% 0%, 100% 100%, 0% 100%, 
                0% ${rect.top}px, 
                ${rect.left}px ${rect.top}px, 
                ${rect.left}px ${rect.bottom}px, 
                ${rect.right}px ${rect.bottom}px, 
                ${rect.right}px ${rect.top}px, 
                0% ${rect.top}px
            )`;
        }

        function removeSelectionIndicator() {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(darkOverlay);
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
            overlay.parentNode.removeChild(document.getElementById('darkOverlay'));
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

