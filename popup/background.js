chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.type === "elementSelected"){
        const elementInfo = request.message;

        // Stocker les informations de l'élément dans le stockage local
        chrome.storage.local.set({ 'selectedElement': elementInfo });
    }
});
