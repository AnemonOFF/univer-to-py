/**
 * Converts Excel-like formulas into Python code for linear programming using PuLP
 * @param targetFunc - The objective function in Excel formula format (e.g., "=D3*D4+E3*E4")
 * @param limits - Array of constraints in Excel formula format
 * @returns Python code as a string that solves the linear programming problem
 */
export default function Convert(targetFunc: string, limits: string[]): string {
  // Helper to extract all variable names (e.g., D3, E2)
  function extractVariables(formulas: string[]): string[] {
    const varSet = new Set<string>();
    const regex = /([A-Z]+\d+)/g;
    formulas.forEach((f) => {
      let m: RegExpExecArray | null;
      while ((m = regex.exec(f)) !== null) {
        varSet.add(m[1]);
      }
    });
    return Array.from(varSet);
  }

  // Helper to convert Excel var to Python var (e.g., D3 -> x_D3)
  function pyVar(excelVar: string): string {
    return `x_${excelVar}`;
  }

  // Helper to convert Excel formula to Python expr
  function convertFormula(
    formula: string,
    varMap: Record<string, string>
  ): string {
    // Remove leading '=' if present
    let f = formula.trim();
    if (f.startsWith("=")) f = f.slice(1);
    // Replace Excel vars with Python vars
    Object.entries(varMap).forEach(([excel, py]) => {
      // Use regex to avoid partial replacements
      f = f.replace(new RegExp(`\\b${excel}\\b`, "g"), py);
    });
    return f;
  }

  // 1. Collect all variables
  const allFormulas = [targetFunc, ...limits];
  const variables = extractVariables(allFormulas);
  const varMap: Record<string, string> = {};
  variables.forEach((v) => {
    varMap[v] = pyVar(v);
  });

  // 2. Build variable declarations
  const varDecls = variables.map(
    (v) => `${pyVar(v)} = pulp.LpVariable('${v}', lowBound=0)`
  );

  // 3. Parse objective and constraints
  // Target function is always the objective to maximize
  const objExpr = convertFormula(targetFunc, varMap);

  // 4. Constraints
  const pyConstraints = limits.map((lim) => {
    const m = lim.match(/^(=?.+?)(<=|>=|=)(.+)$/);
    if (!m) throw new Error("Invalid constraint format: " + lim);
    const [, left, sense, right] = m;
    const convertedLeft = convertFormula(left, varMap);
    const convertedRight = right.trim();
    return `${convertedLeft} ${sense} ${convertedRight}`;
  });

  // 5. Build Python code
  const code: string[] = [];
  code.push("import pulp");
  code.push("");
  code.push("# Define variables");
  code.push(...varDecls);
  code.push("");
  code.push("# Define problem");
  code.push("prob = pulp.LpProblem('LP_Problem', pulp.LpMaximize)");
  code.push("");
  code.push("# Objective");
  code.push(`prob += (${objExpr}), 'Objective'`);
  code.push("");
  code.push("# Constraints");
  pyConstraints.forEach((c, i) => {
    code.push(`prob += (${c}), 'Constraint_${i + 1}'`);
  });
  code.push("");
  code.push("# Solve");
  code.push("prob.solve()");
  code.push("");
  code.push('print("Status:", pulp.LpStatus[prob.status])');
  code.push("for v in prob.variables():");
  code.push('    print(f"{v.name} = {v.varValue}")');
  code.push('print("Objective =", pulp.value(prob.objective))');

  return code.join("\n");
}
