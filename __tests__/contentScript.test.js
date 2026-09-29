/**
 * @jest-environment jsdom
 */

import {
  parseDataTree,
  extractDocumentData,
  handleContentMessage,
  injectCopyButton,
  injectLoadingButton,
  COPY_BUTTON_ID,
} from "../src/contentScript.js";

describe("Content Script - Data Extraction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = "";

    // Mock chrome.storage.local
    global.chrome = {
      storage: {
        local: {
          set: jest.fn(),
          get: jest.fn(),
        },
      },
    };

    // Mock window.location
    delete window.location;
    window.location = {
      href: "https://console.firebase.google.com/u/1/project/test-project/firestore/databases/-default-/data/~2Fusers~2F123",
    };
  });

  describe("parseDataTree", () => {
    test("should parse a simple string field", () => {
      document.body.innerHTML = `
        <f7e-data-tree>
          <div class="database-node">
            <span class="database-key">name</span>
            <span class="database-leaf-value">"John Doe"</span>
            <div class="database-type">(string)</div>
          </div>
        </f7e-data-tree>
      `;

      const result = {};
      const tree = document.querySelector("f7e-data-tree");
      parseDataTree(tree, result);

      expect(result).toEqual({ name: "John Doe" });
    });

    test("should parse a number field", () => {
      document.body.innerHTML = `
        <f7e-data-tree>
          <div class="database-node">
            <span class="database-key">age</span>
            <span class="database-leaf-value">25</span>
            <div class="database-type">(double)</div>
          </div>
        </f7e-data-tree>
      `;

      const result = {};
      const tree = document.querySelector("f7e-data-tree");
      parseDataTree(tree, result);

      expect(result).toEqual({ age: 25 });
    });

    test("should parse a boolean field", () => {
      document.body.innerHTML = `
        <f7e-data-tree>
          <div class="database-node">
            <span class="database-key">active</span>
            <span class="database-leaf-value">true</span>
            <div class="database-type">(boolean)</div>
          </div>
        </f7e-data-tree>
      `;

      const result = {};
      const tree = document.querySelector("f7e-data-tree");
      parseDataTree(tree, result);

      expect(result).toEqual({ active: true });
    });

    test("should parse a null field", () => {
      document.body.innerHTML = `
        <f7e-data-tree>
          <div class="database-node">
            <span class="database-key">deletedAt</span>
            <span class="database-leaf-value">null</span>
            <div class="database-type">(null)</div>
          </div>
        </f7e-data-tree>
      `;

      const result = {};
      const tree = document.querySelector("f7e-data-tree");
      parseDataTree(tree, result);

      expect(result).toEqual({ deletedAt: null });
    });

    test("should parse nested object", () => {
      document.body.innerHTML = `
        <f7e-data-tree>
          <div class="database-node">
            <span class="database-key">address</span>
            <div class="database-type">(map)</div>
            <div class="database-children">
              <f7e-data-tree>
                <div class="database-node">
                  <span class="database-key">city</span>
                  <span class="database-leaf-value">"New York"</span>
                  <div class="database-type">(string)</div>
                </div>
              </f7e-data-tree>
              <f7e-data-tree>
                <div class="database-node">
                  <span class="database-key">zip</span>
                  <span class="database-leaf-value">10001</span>
                  <div class="database-type">(double)</div>
                </div>
              </f7e-data-tree>
            </div>
          </div>
        </f7e-data-tree>
      `;

      const result = {};
      const tree = document.querySelector("f7e-data-tree");
      parseDataTree(tree, result);

      expect(result).toEqual({
        address: {
          city: "New York",
          zip: 10001,
        },
      });
    });

    test("should parse array of primitive values", () => {
      document.body.innerHTML = `
        <f7e-data-tree>
          <div class="database-node">
            <span class="database-key">tags</span>
            <div class="database-type">(array)</div>
            <div class="database-children">
              <f7e-data-tree>
                <div class="database-node">
                  <span class="database-key">0</span>
                  <span class="database-leaf-value">"tag1"</span>
                  <div class="database-type">(string)</div>
                </div>
              </f7e-data-tree>
              <f7e-data-tree>
                <div class="database-node">
                  <span class="database-key">1</span>
                  <span class="database-leaf-value">"tag2"</span>
                  <div class="database-type">(string)</div>
                </div>
              </f7e-data-tree>
            </div>
          </div>
        </f7e-data-tree>
      `;

      const result = {};
      const tree = document.querySelector("f7e-data-tree");
      parseDataTree(tree, result);

      expect(result).toEqual({
        tags: ["tag1", "tag2"],
      });
    });

    test("should handle empty array", () => {
      document.body.innerHTML = `
        <f7e-data-tree>
          <div class="database-node">
            <span class="database-key">tags</span>
            <div class="database-type">(array)</div>
            <div class="database-children"></div>
          </div>
        </f7e-data-tree>
      `;

      const result = {};
      const tree = document.querySelector("f7e-data-tree");
      parseDataTree(tree, result);

      expect(result).toEqual({ tags: [] });
    });

    test("should handle missing key element", () => {
      document.body.innerHTML = `
        <f7e-data-tree>
          <div class="database-node">
            <span class="database-leaf-value">"value"</span>
          </div>
        </f7e-data-tree>
      `;

      const result = {};
      const tree = document.querySelector("f7e-data-tree");
      parseDataTree(tree, result);

      expect(result).toEqual({});
    });
  });

  describe("extractDocumentData", () => {
    test("should extract document data from valid Firestore page", () => {
      document.body.innerHTML = `
        <f7e-data-tree>
          <div class="database-node">
            <span class="database-key">name</span>
            <span class="database-leaf-value">"Test User"</span>
            <div class="database-type">(string)</div>
          </div>
        </f7e-data-tree>
      `;

      const result = extractDocumentData();

      expect(result.data).toEqual({ name: "Test User" });
      expect(result.url).toBe(window.location.href);
      expect(result.error).toBeNull();
      expect(chrome.storage.local.set).toHaveBeenCalled();
    });

    test("should return error when not on Firestore page", () => {
      window.location.href = "https://console.firebase.google.com/project/test";

      const result = extractDocumentData();

      expect(result.data).toBeNull();
      expect(result.error).toBe("Not on a Firestore document page");
    });

    test("should return error when no data trees found", () => {
      document.body.innerHTML = "<div>No Firestore data here</div>";

      const result = extractDocumentData();

      expect(result.data).toBeNull();
      expect(result.error).toBe(
        "No document fields found. Make sure you are viewing a document.",
      );
    });

    test("should skip nested data trees", () => {
      document.body.innerHTML = `
        <f7e-data-tree>
          <div class="database-node">
            <span class="database-key">parent</span>
            <div class="database-type">(map)</div>
            <div class="database-children">
              <f7e-data-tree>
                <div class="database-node">
                  <span class="database-key">child</span>
                  <span class="database-leaf-value">"nested"</span>
                  <div class="database-type">(string)</div>
                </div>
              </f7e-data-tree>
            </div>
          </div>
        </f7e-data-tree>
      `;

      const result = extractDocumentData();

      expect(result.data).toEqual({
        parent: {
          child: "nested",
        },
      });
    });

    test("should handle extraction errors gracefully", () => {
      // Mock querySelector to throw error
      const originalQuerySelectorAll = document.querySelectorAll;
      document.querySelectorAll = jest.fn(() => {
        throw new Error("Query failed");
      });

      const result = extractDocumentData();

      expect(result.data).toBeNull();
      expect(result.error).toBe("Query failed");

      // Restore
      document.querySelectorAll = originalQuerySelectorAll;
    });
  });

  describe("handleContentMessage", () => {
    test("should handle extractData action", () => {
      document.body.innerHTML = `
        <f7e-data-tree>
          <div class="database-node">
            <span class="database-key">test</span>
            <span class="database-leaf-value">"value"</span>
            <div class="database-type">(string)</div>
          </div>
        </f7e-data-tree>
      `;

      const mockSendResponse = jest.fn();
      const request = { action: "extractData" };

      const result = handleContentMessage(request, {}, mockSendResponse);

      expect(mockSendResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { test: "value" },
          error: null,
        }),
      );
      expect(result).toBe(true);
    });

    test("should ignore unknown actions", () => {
      const mockSendResponse = jest.fn();
      const request = { action: "unknownAction" };

      const result = handleContentMessage(request, {}, mockSendResponse);

      expect(mockSendResponse).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe("URL validation", () => {
    test("should accept valid Firestore URLs", () => {
      const validUrls = [
        "https://console.firebase.google.com/project/test/firestore/data/~2Fusers",
        "https://console.firebase.google.com/u/0/project/test/firestore/databases/-default-/data/~2Fcollection~2Fdoc",
      ];

      validUrls.forEach((url) => {
        expect(url).toMatch(/\/firestore\/(data|databases)\//);
      });
    });

    test("should reject non-Firestore URLs", () => {
      const invalidUrls = [
        "https://console.firebase.google.com/project/test/overview",
        "https://console.firebase.google.com/project/test/database/data",
        "https://example.com",
      ];

      invalidUrls.forEach((url) => {
        expect(url).not.toMatch(/\/firestore\/(data|databases)\//);
      });
    });
  });

  describe("injectCopyButton", () => {
    function renderToolbar() {
      document.body.innerHTML = `
        <div class="panel-header">
          <div class="left-container"></div>
          <div class="right-container">
            <button aria-label="actions for document" aria-haspopup="menu">
              more_vert
            </button>
          </div>
        </div>
      `;
    }

    beforeEach(() => {
      navigator.clipboard = { writeText: jest.fn().mockResolvedValue() };
    });

    test("creates the button when the toolbar is present", () => {
      renderToolbar();

      injectCopyButton({ name: "Test" });

      const button = document.getElementById(COPY_BUTTON_ID);
      expect(button).not.toBeNull();
      expect(button.closest(".right-container")).not.toBeNull();
    });

    test("does not create a duplicate button on repeated calls", () => {
      renderToolbar();

      injectCopyButton({ name: "Test" });
      injectCopyButton({ name: "Test" });

      expect(document.querySelectorAll(`#${COPY_BUTTON_ID}`).length).toBe(1);
    });

    test("recreates the button when the existing one is detached from the toolbar", () => {
      renderToolbar();
      injectCopyButton({ name: "Test" });
      const staleButton = document.getElementById(COPY_BUTTON_ID);

      // Simulate Angular tearing down and rebuilding the toolbar node.
      staleButton.remove();
      document.body.querySelector(".right-container").appendChild(staleButton);
      renderToolbar();

      injectCopyButton({ name: "Test" });

      const button = document.getElementById(COPY_BUTTON_ID);
      expect(button).not.toBeNull();
      expect(button.closest(".right-container")).not.toBeNull();
      expect(document.querySelectorAll(`#${COPY_BUTTON_ID}`).length).toBe(1);
    });

    test("no-ops without throwing when the toolbar is absent, warning at most once", () => {
      document.body.innerHTML = "<div>No toolbar here</div>";
      const warnCallsBefore = console.warn.mock.calls.length;

      expect(() => injectCopyButton({ name: "Test" })).not.toThrow();
      expect(document.getElementById(COPY_BUTTON_ID)).toBeNull();

      injectCopyButton({ name: "Test" });
      injectCopyButton({ name: "Test" });

      // The warn-once flag is module-scoped (persists across the content
      // script's lifetime, not reset per call), so an earlier test in this
      // file may have already tripped it — assert on the delta, not an
      // absolute count.
      expect(
        console.warn.mock.calls.length - warnCallsBefore,
      ).toBeLessThanOrEqual(1);
    });

    test("clicking the button copies the JSON data to the clipboard", async () => {
      renderToolbar();
      const data = { name: "Test User", age: 30 };

      injectCopyButton(data);
      document.getElementById(COPY_BUTTON_ID).click();

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        JSON.stringify(data, null, 2),
      );
    });

    test("shows 'Copied!' after click and reverts after 2000ms", async () => {
      jest.useFakeTimers();
      renderToolbar();
      injectCopyButton({ name: "Test" });
      const button = document.getElementById(COPY_BUTTON_ID);
      const originalText = button.textContent;

      button.click();
      await Promise.resolve(); // flush the clipboard.writeText().then() microtask

      expect(button.textContent).toBe("Copied!");

      jest.advanceTimersByTime(2000);

      expect(button.textContent).toBe(originalText);
      jest.useRealTimers();
    });

    test("clicking the reused button after a refresh copies the latest data", () => {
      renderToolbar();

      injectCopyButton({ name: "Old" });
      injectCopyButton({ name: "New" });
      document.getElementById(COPY_BUTTON_ID).click();

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        JSON.stringify({ name: "New" }, null, 2),
      );
    });
  });

  describe("injectLoadingButton", () => {
    function renderToolbar() {
      document.body.innerHTML = `
        <div class="panel-header">
          <div class="left-container"></div>
          <div class="right-container">
            <button aria-label="actions for document" aria-haspopup="menu">
              more_vert
            </button>
          </div>
        </div>
      `;
    }

    test("shows a disabled loading button while extraction is pending", () => {
      renderToolbar();

      injectLoadingButton();

      const button = document.getElementById(COPY_BUTTON_ID);
      expect(button).not.toBeNull();
      expect(button.disabled).toBe(true);
      expect(button.closest(".right-container")).not.toBeNull();
    });

    test("does not create a duplicate button on repeated calls", () => {
      renderToolbar();

      injectLoadingButton();
      injectLoadingButton();

      expect(document.querySelectorAll(`#${COPY_BUTTON_ID}`).length).toBe(1);
    });

    test("no-ops without throwing when the toolbar is absent", () => {
      document.body.innerHTML = "<div>No toolbar here</div>";

      expect(() => injectLoadingButton()).not.toThrow();
      expect(document.getElementById(COPY_BUTTON_ID)).toBeNull();
    });

    test("injectCopyButton replaces the loading button with an enabled Copy JSON button", () => {
      renderToolbar();

      injectLoadingButton();
      injectCopyButton({ name: "Test" });

      const button = document.getElementById(COPY_BUTTON_ID);
      expect(document.querySelectorAll(`#${COPY_BUTTON_ID}`).length).toBe(1);
      expect(button.disabled).toBe(false);
      expect(button.textContent).toBe("Copy JSON");
    });
  });
});
