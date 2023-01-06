import { Reason, Result } from "app/shared/types/result";

describe("Result conditions", () => {
  it("should fail first condition", () => {
    const result = Result.condition("contains this value if pass.")
      .failWhen(() => true, new Reason("always fails"))
      .pass();

    expect(result).toEqual(Result.fail(new Reason("always fails")));
  });

  it("should fail second condition", () => {
    const result = Result.condition("contains this value if pass.")
      .failWhen(() => false, Reason.None)
      .failWhen(() => true, new Reason("always fails"))
      .pass();

    expect(result).toEqual(Result.fail(new Reason("always fails")));
  });

  it("should pass after no condition fail", () => {
    const result = Result.condition("contains this value if pass.")
      .failWhen(() => false, Reason.None)
      .failWhen(() => false, Reason.None)
      .pass(new Reason("no conditions fail"));

    expect(result).toEqual(Result.pass("contains this value if pass.", new Reason("no conditions fail")));
  });

  it("should pass first condition", () => {
    const result = Result.condition("contains this value if pass.")
      .passWhen(() => true, new Reason("always passes"))
      .fail();

    expect(result).toEqual(Result.pass("contains this value if pass.", new Reason("always passes")));
  });

  it("should pass second condition", () => {
    const result = Result.condition("contains this value if pass.")
      .passWhen(() => false, Reason.None)
      .passWhen(() => true, new Reason("always passes"))
      .fail();

    expect(result).toEqual(Result.pass("contains this value if pass.", new Reason("always passes")));
  });

  it("should fail after no condition pass", () => {
    const result = Result.condition("contains this value if pass.")
      .passWhen(() => false, Reason.None)
      .passWhen(() => false, Reason.None)
      .fail(new Reason("no conditions pass"));

    expect(result).toEqual(Result.fail(new Reason("no conditions pass")));
  });
});
