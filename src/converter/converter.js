function Convert(targetFunc, limits) {
  // Helper to extract all variable names (e.g., D3, E2)
  function extractVariables(formulas) {
    const varSet = new Set();
    const regex = /([A-Z]+\d+)/g;
    formulas.forEach((f) => {
      let m;
      while ((m = regex.exec(f)) !== null) {
        varSet.add(m[1]);
      }
    });
    return Array.from(varSet);
  }

  // Helper to convert Excel var to Python var (e.g., D3 -> x_D3)
  function pyVar(excelVar) {
    return `x_${excelVar}`;
  }

  // Helper to convert Excel formula to Python expr
  function convertFormula(formula, varMap) {
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
  const varMap = {};
  variables.forEach((v) => {
    varMap[v] = pyVar(v);
  });

  // 2. Build variable declarations
  const varDecls = variables.map(
    (v) => `${pyVar(v)} = pulp.LpVariable('${v}', lowBound=0)`
  );

  // 3. Parse objective and constraints
  // Assume objective is always <=, >=, or =
  let objMatch = targetFunc.match(/^(=?.+?)(<=|>=|=)(.+)$/);
  if (!objMatch) throw new Error("Invalid target function format");
  let [_, objExpr, objSense, objRHS] = objMatch;
  objExpr = convertFormula(objExpr, varMap);
  objRHS = objRHS.trim();

  // 4. Constraints
  const pyConstraints = limits.map((lim) => {
    let m = lim.match(/^(=?.+?)(<=|>=|=)(.+)$/);
    if (!m) throw new Error("Invalid constraint format: " + lim);
    let [__, left, sense, right] = m;
    left = convertFormula(left, varMap);
    right = right.trim();
    return `${left} ${sense} ${right}`;
  });

  // 5. Build Python code
  let code = [];
  code.push("import pulp");
  code.push("");
  code.push("# Define variables");
  code.push(...varDecls);
  code.push("");
  code.push("# Define problem");
  // For <=, maximize; for >=, minimize; for =, default to maximize
  let sense =
    objSense === "<="
      ? "pulp.LpMaximize"
      : objSense === ">="
      ? "pulp.LpMinimize"
      : "pulp.LpMaximize";
  code.push(`prob = pulp.LpProblem('LP_Problem', ${sense})`);
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

export default Convert;
