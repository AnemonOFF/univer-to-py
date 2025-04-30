/**
 * Extracts all unique variable names from Excel-like formulas
 * @param formulas - Array of formulas in Excel format
 * @returns Array of unique variable names (e.g., ["D3", "E4"])
 */
export function extractVariables(formulas: string[]): string[] {
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

/**
 * Converts Excel-like formulas into Python code for linear programming using PuLP
 * @param targetFunc - The objective function in Excel formula format (e.g., "=D3*D4+E3*E4")
 * @param limits - Array of constraints in Excel formula format
 * @param variablesData - Map of known variable values (e.g., { "D3": "5", "E4": "10" })
 * @returns Python code as a string that solves the linear programming problem
 */
export default function Convert(
  targetFunc: string,
  limits: string[],
  variablesData: Record<string, string>
): string {
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
  const allVariables = extractVariables(allFormulas);

  // Separate known and unknown variables
  const knownVariables = Object.keys(variablesData);
  const unknownVariables = allVariables.filter(
    (v) => !knownVariables.includes(v)
  );

  // Create variable mapping
  const varMap: Record<string, string> = {};
  allVariables.forEach((v) => {
    if (knownVariables.includes(v)) {
      varMap[v] = pyVar(v);
    } else {
      varMap[v] = pyVar(v);
    }
  });

  // 2. Build variable declarations
  const code: string[] = [];
  code.push("import pulp");
  code.push("");
  code.push("# Define known variables");
  knownVariables.forEach((v) => {
    code.push(`${pyVar(v)} = ${variablesData[v]}`);
  });
  code.push("");
  code.push("# Define optimization variables");
  const varDecls = unknownVariables.map(
    (v) => `${pyVar(v)} = pulp.LpVariable('${v}', lowBound=0)`
  );
  code.push(...varDecls);
  code.push("");
  code.push("# Define problem");
  code.push("prob = pulp.LpProblem('LP_Problem', pulp.LpMaximize)");
  code.push("");
  code.push("# Objective");
  const objExpr = convertFormula(targetFunc, varMap);
  code.push(`prob += (${objExpr}), 'Objective'`);
  code.push("");
  code.push("# Constraints");
  const pyConstraints = limits.map((lim) => {
    const m = lim.match(/^(=?.+?)(<=|>=|=)(.+)$/);
    if (!m) throw new Error("Invalid constraint format: " + lim);
    const [, left, sense, right] = m;
    const convertedLeft = convertFormula(left, varMap);
    const convertedRight = right.trim();
    return `${convertedLeft} ${sense} ${convertedRight}`;
  });
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
