import Convert from "./converter";

describe("Convert function", () => {
  test("should generate correct Python code for basic linear programming problem", () => {
    const targetFunc = "=D3*D4+E3*E4";
    const limits = ["=D2*D4+E2*E4<=10", "=D4+E4>=3"];

    const result = Convert(targetFunc, limits);

    // Check for essential components in the generated code
    expect(result).toContain("import pulp");
    expect(result).toContain("x_D3 = pulp.LpVariable");
    expect(result).toContain("x_D4 = pulp.LpVariable");
    expect(result).toContain("x_E3 = pulp.LpVariable");
    expect(result).toContain("x_E4 = pulp.LpVariable");
    expect(result).toContain("prob = pulp.LpProblem");
    expect(result).toContain("pulp.LpMaximize");
    expect(result).toContain("prob.solve()");
  });

  test("should handle equality constraints", () => {
    const targetFunc = "=D3*D4+E3*E4";
    const limits = ["=D4+E4=3"];

    const result = Convert(targetFunc, limits);

    expect(result).toContain("x_D4 + x_E4 = 3");
  });

  test("should handle multiple variables in constraints", () => {
    const targetFunc = "=D3*D4+E3*E4";
    const limits = ["=D2*D4+E2*E4<=10", "=D4+E4>=3"];

    const result = Convert(targetFunc, limits);

    expect(result).toContain("x_D2 * x_D4 + x_E2 * x_E4 <= 10");
    expect(result).toContain("x_D4 + x_E4 >= 3");
  });

  test("should throw error for invalid constraint format", () => {
    const targetFunc = "=D3*D4+E3*E4";
    const limits = ["invalid format"];

    expect(() => Convert(targetFunc, limits)).toThrow(
      "Invalid constraint format"
    );
  });
});
