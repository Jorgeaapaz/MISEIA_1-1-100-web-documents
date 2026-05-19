import {
  validateEmail,
  validatePassword,
  validateName,
  validateDocumentInput,
  validateFile,
} from "@/lib/validators";

describe("validateEmail", () => {
  it("accepts valid emails", () => {
    expect(validateEmail("user@example.com")).toEqual({ valid: true });
    expect(validateEmail("a.b+c@d.co")).toEqual({ valid: true });
  });

  it("rejects invalid emails", () => {
    expect(validateEmail("")).toMatchObject({ valid: false });
    expect(validateEmail("nope")).toMatchObject({ valid: false });
    expect(validateEmail("@missing.com")).toMatchObject({ valid: false });
  });
});

describe("validatePassword", () => {
  it("accepts passwords with 8+ chars", () => {
    expect(validatePassword("12345678")).toEqual({ valid: true });
    expect(validatePassword("longpassword123")).toEqual({ valid: true });
  });

  it("rejects short passwords", () => {
    expect(validatePassword("")).toMatchObject({ valid: false });
    expect(validatePassword("1234567")).toMatchObject({ valid: false });
  });
});

describe("validateName", () => {
  it("accepts names with 2+ chars", () => {
    expect(validateName("Jo")).toEqual({ valid: true });
    expect(validateName("Maria Garcia")).toEqual({ valid: true });
  });

  it("rejects short names", () => {
    expect(validateName("")).toMatchObject({ valid: false });
    expect(validateName("A")).toMatchObject({ valid: false });
  });
});

describe("validateDocumentInput", () => {
  it("accepts valid input", () => {
    expect(validateDocumentInput({ title: "My Doc" })).toEqual({ valid: true });
    expect(
      validateDocumentInput({ title: "Doc", description: "Some text" })
    ).toEqual({ valid: true });
  });

  it("rejects empty title", () => {
    expect(validateDocumentInput({ title: "" })).toMatchObject({ valid: false });
  });

  it("rejects title over 200 chars", () => {
    expect(validateDocumentInput({ title: "a".repeat(201) })).toMatchObject({
      valid: false,
    });
  });

  it("rejects description over 2000 chars", () => {
    expect(
      validateDocumentInput({ title: "Doc", description: "a".repeat(2001) })
    ).toMatchObject({ valid: false });
  });
});

describe("validateFile", () => {
  it("accepts valid files", () => {
    expect(validateFile({ name: "doc.pdf", size: 1024 })).toEqual({
      valid: true,
    });
    expect(validateFile({ name: "video.mp4", size: 50 * 1024 * 1024 })).toEqual({
      valid: true,
    });
  });

  it("rejects invalid extensions", () => {
    expect(validateFile({ name: "file.exe", size: 1024 })).toMatchObject({
      valid: false,
    });
  });

  it("rejects files over max size", () => {
    expect(
      validateFile({ name: "big.pdf", size: 200 * 1024 * 1024 })
    ).toMatchObject({ valid: false });
  });
});
