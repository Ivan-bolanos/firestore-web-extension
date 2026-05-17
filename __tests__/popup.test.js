/**
 * @jest-environment jsdom
 */

import { Popup } from "../src/popup.js";

describe("Popup", () => {
  let popup;

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

    // Mock chrome APIs
    global.chrome = {
      storage: {
        local: {
          get: jest.fn(),
          set: jest.fn(),
        },
      },
      tabs: {
        query: jest.fn(),
        sendMessage: jest.fn(),
      },
      runtime: {
        lastError: null,
      },
    };

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });

    jest.clearAllMocks();
  });

  describe("displayData", () => {
    beforeEach(() => {
      popup = new Popup();
    });

    test("should display JSON data correctly", () => {
      const testData = {
        name: "John Doe",
        age: 30,
        active: true,
      };

      popup.displayData(testData);

      const statusElement = document.getElementById("status");
      const dataElement = document.getElementById("document-data");
      const copyButton = document.getElementById("copy-btn");

      expect(dataElement.textContent).toContain("John Doe");
      expect(dataElement.textContent).toContain("30");
      expect(dataElement.textContent).toContain("true");
      expect(statusElement.textContent).toBe("Document data:");
      expect(copyButton.style.display).toBe("inline-block");
    });

    test("should handle empty data", () => {
      popup.displayData({});

      const statusElement = document.getElementById("status");
      const dataElement = document.getElementById("document-data");

      expect(statusElement.textContent).toBe("No document data found");
      expect(dataElement.textContent).toBe("");
    });

    test("should handle null data", () => {
      popup.displayData(null);

      const statusElement = document.getElementById("status");
      const dataElement = document.getElementById("document-data");

      expect(statusElement.textContent).toBe("No document data found");
      expect(dataElement.textContent).toBe("");
    });

    test("should format JSON with proper indentation", () => {
      const testData = { name: "Test", nested: { key: "value" } };

      popup.displayData(testData);

      const dataElement = document.getElementById("document-data");
      const expectedJson = JSON.stringify(testData, null, 2);

      expect(dataElement.textContent).toBe(expectedJson);
    });
  });

  describe("loadData", () => {
    test("should load data from chrome.storage.local", async () => {
      const mockData = {
        documentUrl:
          "https://console.firebase.google.com/firestore/data/~2Fusers~2F123",
        documentData: { name: "Test User" },
        timestamp: Date.now(),
      };

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback(mockData);
      });

      popup = new Popup();
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(chrome.storage.local.get).toHaveBeenCalledWith(
        ["documentUrl", "documentData", "timestamp"],
        expect.any(Function),
      );
    });

    test("should handle missing data in storage", async () => {
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });

      popup = new Popup();
      await new Promise((resolve) => setTimeout(resolve, 0));

      const statusElement = document.getElementById("status");
      expect(statusElement.textContent).toBe(
        "Please open a Firestore document in Firebase Console",
      );
    });

    test("should show message when data exists but not extracted", async () => {
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({
          documentUrl:
            "https://console.firebase.google.com/firestore/data/~2Fusers~2F123",
        });
      });

      popup = new Popup();
      await new Promise((resolve) => setTimeout(resolve, 0));

      const statusElement = document.getElementById("status");
      expect(statusElement.textContent).toBe(
        "No data extracted yet. Click Refresh.",
      );
    });
  });

  describe("refreshData", () => {
    beforeEach(() => {
      popup = new Popup();
    });

    test("should refresh data from active tab", async () => {
      const mockTab = {
        id: 1,
        url: "https://console.firebase.google.com/firestore/data/test",
      };

      chrome.tabs.query.mockResolvedValue([mockTab]);
      chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
        callback({ data: { name: "Test" }, error: null });
      });

      await popup.refreshData();

      expect(chrome.tabs.query).toHaveBeenCalledWith({
        active: true,
        currentWindow: true,
      });
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
        1,
        { action: "extractData" },
        expect.any(Function),
      );
    });

    test("should handle non-Firebase tab", async () => {
      chrome.tabs.query.mockResolvedValue([
        { id: 1, url: "https://example.com" },
      ]);

      await popup.refreshData();

      const statusElement = document.getElementById("status");
      expect(statusElement.textContent).toBe(
        "Please navigate to a Firebase Console document page",
      );
    });

    test("should handle no active tab", async () => {
      chrome.tabs.query.mockResolvedValue([]);

      await popup.refreshData();

      const statusElement = document.getElementById("status");
      expect(statusElement.textContent).toBe(
        "Please navigate to a Firebase Console document page",
      );
    });

    test("should handle chrome.runtime.lastError", async () => {
      chrome.tabs.query.mockResolvedValue([
        {
          id: 1,
          url: "https://console.firebase.google.com/firestore/data/test",
        },
      ]);

      chrome.runtime.lastError = { message: "Tab not found" };
      chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
        callback();
      });

      await popup.refreshData();

      const statusElement = document.getElementById("status");
      expect(statusElement.textContent).toBe(
        "Error: Please refresh the Firebase Console page",
      );

      chrome.runtime.lastError = null;
    });

    test("should display error from response", async () => {
      chrome.tabs.query.mockResolvedValue([
        {
          id: 1,
          url: "https://console.firebase.google.com/firestore/data/test",
        },
      ]);

      chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
        callback({ data: null, error: "No data found" });
      });

      await popup.refreshData();

      const statusElement = document.getElementById("status");
      expect(statusElement.textContent).toBe("No data found");
    });
  });

  describe("copyToClipboard", () => {
    beforeEach(() => {
      popup = new Popup();
    });

    test("should copy JSON to clipboard", async () => {
      const testData = { name: "Test" };
      const dataElement = document.getElementById("document-data");
      dataElement.textContent = JSON.stringify(testData, null, 2);

      await popup.copyToClipboard();

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        JSON.stringify(testData, null, 2),
      );
    });

    test("should show success message after copying", async () => {
      jest.useFakeTimers();

      const dataElement = document.getElementById("document-data");
      dataElement.textContent = "test data";

      const copyButton = document.getElementById("copy-btn");
      copyButton.textContent = "Copy JSON";

      await popup.copyToClipboard();

      expect(copyButton.textContent).toBe("Copied!");

      jest.advanceTimersByTime(2000);

      expect(copyButton.textContent).toBe("Copy JSON");

      jest.useRealTimers();
    });

    test("should handle clipboard errors", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Clipboard error");
      navigator.clipboard.writeText = jest.fn().mockRejectedValue(error);

      const dataElement = document.getElementById("document-data");
      dataElement.textContent = "test data";

      await popup.copyToClipboard();

      // Wait for the promise to reject
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to copy:", error);

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Button event listeners", () => {
    test("should attach refresh button listener", () => {
      const refreshButton = document.getElementById("refresh-btn");
      const clickSpy = jest.spyOn(refreshButton, "addEventListener");

      popup = new Popup();

      expect(clickSpy).toHaveBeenCalledWith("click", expect.any(Function));
    });

    test("should attach copy button listener", () => {
      const copyButton = document.getElementById("copy-btn");
      const clickSpy = jest.spyOn(copyButton, "addEventListener");

      popup = new Popup();

      expect(clickSpy).toHaveBeenCalledWith("click", expect.any(Function));
    });

    test("should handle missing buttons gracefully", () => {
      document.body.innerHTML = "<div>No buttons</div>";

      expect(() => new Popup()).not.toThrow();
    });
  });
});
