// background.js

// Message handler function
export function handleMessage(request, sender, sendResponse) {
  if (request.action === "getDocument") {
    // Aquí podrías realizar acciones adicionales, como obtener datos de Firestore
    // En este caso, simplemente respondemos con un mensaje de éxito
    sendResponse({ status: "success", message: "Document request received." });
  }

  // Retornar verdadero para usar sendResponse de forma asíncrona
  return true;
}

// Setup listener (only in non-test environment)
if (typeof chrome !== "undefined" && chrome.runtime) {
  chrome.runtime.onMessage.addListener(handleMessage);
}

// Puedes agregar más lógica aquí si necesitas realizar otras tareas en segundo plano
