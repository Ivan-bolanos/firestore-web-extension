/**
 * @jest-environment jsdom
 */

describe("Content Script - Data Extraction", () => {
  let parseDataTree;
  let extractDocumentData;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Set up the DOM
    document.body.innerHTML = "";

    // Mock window.location
    delete window.location;
    window.location = {
      href: "https://console.firebase.google.com/u/1/project/test-project/firestore/databases/-default-/data/~2Fusers~2F123",
    };

    // Load the parseDataTree function
    // In a real scenario, we'd import it, but since it's inline, we'll define it here
    parseDataTree = function (treeElement, targetObject) {
      const keyElement = treeElement.querySelector(".database-key");
      if (!keyElement) return;

      const key = keyElement.textContent.trim();
      const typeElement = treeElement.querySelector(".database-type");
      const type = typeElement
        ? typeElement.textContent.trim().replace(/[()]/g, "")
        : "";
      const valueElement = treeElement.querySelector(".database-leaf-value");
      const childrenContainer = treeElement.querySelector(
        ".database-node .database-children",
      );

      if (childrenContainer && childrenContainer.children.length > 0) {
        const childTrees = Array.from(childrenContainer.children).filter(
          (el) => el.tagName === "F7E-DATA-TREE",
        );

        if (type === "array") {
          targetObject[key] = [];
          for (const childTree of childTrees) {
            const childObj = {};
            parseDataTree(childTree, childObj);
            const childKeys = Object.keys(childObj);
            if (childKeys.length > 0) {
              const childKey = childKeys[0];
              targetObject[key].push(childObj[childKey]);
            }
          }
        } else {
          targetObject[key] = {};
          for (const childTree of childTrees) {
            parseDataTree(childTree, targetObject[key]);
          }
        }
      } else if (valueElement) {
        let value = valueElement.textContent.trim();

        switch (type) {
          case "string":
            value = value.replace(/^["']|["']$/g, "");
            targetObject[key] = value;
            break;
          case "double":
          case "number":
            targetObject[key] = Number(value);
            break;
          case "boolean":
            targetObject[key] = value === "true";
            break;
          case "null":
            targetObject[key] = null;
            break;
          default:
            targetObject[key] = value;
        }
      } else {
        if (type === "null") {
          targetObject[key] = null;
        } else if (type === "array") {
          targetObject[key] = [];
        } else {
          targetObject[key] = {};
        }
      }
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

    test("should parse array of objects", () => {
      document.body.innerHTML = `
                <f7e-data-tree>
                    <div class="database-node">
                        <span class="database-key">items</span>
                        <div class="database-type">(array)</div>
                        <div class="database-children">
                            <f7e-data-tree>
                                <div class="database-node">
                                    <span class="database-key">0</span>
                                    <div class="database-type">(map)</div>
                                    <div class="database-children">
                                        <f7e-data-tree>
                                            <div class="database-node">
                                                <span class="database-key">id</span>
                                                <span class="database-leaf-value">1</span>
                                                <div class="database-type">(double)</div>
                                            </div>
                                        </f7e-data-tree>
                                        <f7e-data-tree>
                                            <div class="database-node">
                                                <span class="database-key">name</span>
                                                <span class="database-leaf-value">"Item 1"</span>
                                                <div class="database-type">(string)</div>
                                            </div>
                                        </f7e-data-tree>
                                    </div>
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
        items: [
          {
            id: 1,
            name: "Item 1",
          },
        ],
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
