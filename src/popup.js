class Popup {
    constructor() {
        this.init();
    }

    async init() {
        const statusElement = document.getElementById("status");
        const documentDataElement = document.getElementById("document-data");
        const refreshButton = document.getElementById("refresh-btn");
        const copyButton = document.getElementById("copy-btn");

        // Add button event listeners
        if (refreshButton) {
            refreshButton.addEventListener('click', () => this.refreshData());
        }
        if (copyButton) {
            copyButton.addEventListener('click', () => this.copyToClipboard());
        }

        // Load data
        await this.loadData();
    }

    async refreshData() {
        const statusElement = document.getElementById("status");
        statusElement.textContent = "Refreshing...";

        try {
            // Query the active tab's content script
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab || !tab.url || !tab.url.includes('console.firebase.google.com')) {
                statusElement.textContent = "Please navigate to a Firebase Console document page";
                return;
            }

            // Send message to content script to extract data
            chrome.tabs.sendMessage(tab.id, { action: 'extractData' }, (response) => {
                if (chrome.runtime.lastError) {
                    statusElement.textContent = "Error: Please refresh the Firebase Console page";
                    return;
                }

                if (response && response.data) {
                    this.displayData(response.data);
                } else {
                    statusElement.textContent = response?.error || "No document data found";
                }
            });
        } catch (error) {
            statusElement.textContent = "Error: " + error.message;
        }
    }

    async loadData() {
        const statusElement = document.getElementById("status");
        const documentDataElement = document.getElementById("document-data");

        try {
            // First, try to get from storage
            chrome.storage.local.get(["documentUrl", "documentData", "timestamp"], (result) => {
                if (result.documentData) {
                    this.displayData(result.documentData);
                } else if (result.documentUrl) {
                    statusElement.textContent = "No data extracted yet. Click Refresh.";
                } else {
                    statusElement.textContent = "Please open a Firestore document in Firebase Console";
                }
            });
        } catch (error) {
            statusElement.textContent = "Error: " + error.message;
            console.error(error);
        }
    }

    displayData(data) {
        const statusElement = document.getElementById("status");
        const documentDataElement = document.getElementById("document-data");

        if (data && Object.keys(data).length > 0) {
            documentDataElement.textContent = JSON.stringify(data, null, 2);
            statusElement.textContent = "Document data:";

            // Show copy button
            const copyButton = document.getElementById("copy-btn");
            if (copyButton) {
                copyButton.style.display = 'inline-block';
            }
        } else {
            statusElement.textContent = "No document data found";
            documentDataElement.textContent = "";
        }
    }

    copyToClipboard() {
        const documentDataElement = document.getElementById("document-data");
        const text = documentDataElement.textContent;

        navigator.clipboard.writeText(text).then(() => {
            const copyButton = document.getElementById("copy-btn");
            const originalText = copyButton.textContent;
            copyButton.textContent = "Copied!";
            setTimeout(() => {
                copyButton.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }
}

// Initialize popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => new Popup());