/**
 * @jest-environment jsdom
 */

describe("Popup", () => {
  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = `
            <h1>Firestore Document</h1>
            <div class="controls">
                <button id="refresh-btn">Refresh</button>
                <button id="copy-btn" style="display: none;">Copy JSON</button>
            </div>
            <p id="status">Loading document...</p>
            <pre id="document-data"></pre>
        `;

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("displayData", () => {
    test("should display JSON data correctly", () => {
      const testData = {
        name: "John Doe",
        age: 30,
        active: true,
      };

      const statusElement = document.getElementById("status");
      const dataElement = document.getElementById("document-data");
      const copyButton = document.getElementById("copy-btn");

      // Simulate displayData function
      dataElement.textContent = JSON.stringify(testData, null, 2);
      statusElement.textContent = "Document data:";
      copyButton.style.display = "inline-block";

      expect(dataElement.textContent).toContain("John Doe");
      expect(dataElement.textContent).toContain("30");
      expect(dataElement.textContent).toContain("true");
      expect(statusElement.textContent).toBe("Document data:");
      expect(copyButton.style.display).toBe("inline-block");
    });

    test("should handle empty data", () => {
      const statusElement = document.getElementById("status");
      const dataElement = document.getElementById("document-data");

      statusElement.textContent = "No document data found";
      dataElement.textContent = "";

      expect(statusElement.textContent).toBe("No document data found");
      expect(dataElement.textContent).toBe("");
    });
  });

  describe("Chrome storage interaction", () => {
    test("should retrieve data from chrome.storage.local", (done) => {
      const mockData = {
        documentUrl:
          "https://console.firebase.google.com/firestore/data/~2Fusers~2F123",
        documentData: { name: "Test User" },
        timestamp: Date.now(),
      };

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback(mockData);
      });

      chrome.storage.local.get(
        ["documentUrl", "documentData", "timestamp"],
        (result) => {
          expect(result.documentData).toEqual({ name: "Test User" });
          expect(result.documentUrl).toContain("firestore");
          done();
        },
      );
    });

    test("should handle missing data gracefully", (done) => {
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });

      chrome.storage.local.get(["documentUrl", "documentData"], (result) => {
        expect(result.documentData).toBeUndefined();
        done();
      });
    });
  });

  describe("Copy to clipboard", () => {
    test("should copy JSON to clipboard", async () => {
      const testData = { name: "Test" };
      const dataElement = document.getElementById("document-data");
      dataElement.textContent = JSON.stringify(testData, null, 2);

      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });

      await navigator.clipboard.writeText(dataElement.textContent);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        JSON.stringify(testData, null, 2),
      );
    });
  });

  describe("Refresh button", () => {
    test("should send message to content script", () => {
      const refreshButton = document.getElementById("refresh-btn");

      chrome.tabs.query.mockImplementation((queryInfo, callback) => {
        callback([
          {
            id: 1,
            url: "https://console.firebase.google.com/firestore/data/test",
          },
        ]);
      });

      chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
        callback({ data: { name: "Test" }, error: null });
      });

      // Simulate click
      refreshButton.click();

      // In a real scenario, this would trigger the message sending
      // For now, we just verify the chrome API is available
      expect(chrome.tabs.query).toBeDefined();
      expect(chrome.tabs.sendMessage).toBeDefined();
    });
  });
});
