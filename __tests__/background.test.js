/**
 * @jest-environment jsdom
 */

import { handleMessage } from "../src/background.js";

describe("Background Script", () => {
  let mockSendResponse;

  beforeEach(() => {
    mockSendResponse = jest.fn();
    jest.clearAllMocks();
  });

  describe("handleMessage", () => {
    test("should handle getDocument action", () => {
      const request = { action: "getDocument" };
      const sender = {};

      const result = handleMessage(request, sender, mockSendResponse);

      expect(mockSendResponse).toHaveBeenCalledWith({
        status: "success",
        message: "Document request received.",
      });
      expect(result).toBe(true);
    });

    test("should return true for async response", () => {
      const request = { action: "getDocument" };
      const sender = {};

      const result = handleMessage(request, sender, mockSendResponse);

      expect(result).toBe(true);
    });

    test("should handle unknown actions gracefully", () => {
      const request = { action: "unknownAction" };
      const sender = {};

      const result = handleMessage(request, sender, mockSendResponse);

      expect(mockSendResponse).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    test("should not crash with empty request", () => {
      const request = {};
      const sender = {};

      const result = handleMessage(request, sender, mockSendResponse);

      expect(result).toBe(true);
    });
  });
});
