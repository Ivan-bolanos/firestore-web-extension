/**
 * @jest-environment jsdom
 */

import {
  parseDataTree,
  extractDocumentData,
  handleContentMessage,
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
});
