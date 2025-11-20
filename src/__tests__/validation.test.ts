import { validateRequest, movieSearchSchema } from "@/lib/validation";

describe("Validation", () => {
  describe("movieSearchSchema", () => {
    it("should validate valid search params", () => {
      const result = validateRequest(movieSearchSchema, {
        q: "Inception",
        limit: 20,
        offset: 0,
      });
      expect(result.q).toBe("Inception");
      expect(result.limit).toBe(20);
    });

    it("should reject invalid limit", () => {
      expect(() => {
        validateRequest(movieSearchSchema, { limit: 200 });
      }).toThrow();
    });

    it("should set defaults", () => {
      const result = validateRequest(movieSearchSchema, {});
      expect(result.limit).toBe(30);
      expect(result.offset).toBe(0);
    });
  });
});

