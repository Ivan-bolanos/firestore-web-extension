// background.js

// Escucha por mensajes enviados desde content scripts o popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getDocument") {
        // Aquí podrías realizar acciones adicionales, como obtener datos de Firestore
        // En este caso, simplemente respondemos con un mensaje de éxito
        sendResponse({ status: "success", message: "Document request received." });
    }

    // Retornar verdadero para usar sendResponse de forma asíncrona
    return true;
});

// Puedes agregar más lógica aquí si necesitas realizar otras tareas en segundo plano