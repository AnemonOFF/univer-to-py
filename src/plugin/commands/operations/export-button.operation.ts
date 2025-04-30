import { Convert, extractVariables } from "@/converter";
import A1 from "@flighter/a1-notation";
import type { ICommand, IAccessor, Workbook, Worksheet } from "@univerjs/core";
import {
  CommandType,
  IUniverInstanceService,
  LocaleService,
  UniverInstanceType,
} from "@univerjs/core";

const download = (text: string) => {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", "code.py");

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

const exportPython = (worksheet: Worksheet) => {
  try {
    const sheetSnapshot = worksheet.getSnapshot();

    if (
      !Object.keys(sheetSnapshot.cellData).includes("1") ||
      !Object.keys(sheetSnapshot.cellData[1]).includes("0")
    ) {
      alert("Укажите целевую функцию в ячейке A1");
      return;
    }
    const func = sheetSnapshot.cellData[1][0].f?.trim();
    console.log("Целевая функция", func);
    if (!func) {
      alert("Укажите целевую функцию в ячейке A1");
      return;
    }

    const restrictions = [];
    for (const [, row] of Object.entries(sheetSnapshot.cellData)) {
      const cell = row[1];
      if (cell && cell.f) restrictions.push(cell.f.trim());
    }
    console.log("Ограничения", restrictions);

    const variables = extractVariables([func, ...restrictions]).map((v) =>
      v.trim()
    );
    console.log("Переменные", variables);
    const varData = variables.reduce<Record<string, string>>(
      (res, variable) => {
        const row = A1.getRow(variable) - 1;
        const col = A1.getCol(variable) - 1;
        if (
          !Object.keys(sheetSnapshot.cellData).includes(row.toString()) ||
          !Object.keys(sheetSnapshot.cellData[row]).includes(col.toString())
        )
          return res;
        const val = sheetSnapshot.cellData[row][col].v?.toString().trim();
        if (!val) return res;
        return { [variable]: val, ...res };
      },
      {}
    );
    console.log("Переменные", varData);

    const pythonCode = Convert(func, restrictions, varData);
    download(pythonCode);
  } catch (ex) {
    alert(
      "Во время конвертации произошла ошибка, проверьте правильность формул"
    );
    throw ex;
  }
};

export const ExportButtonOperation: ICommand = {
  id: "export-button.operation.export-button",
  type: CommandType.OPERATION,
  handler: async (accessor: IAccessor) => {
    const locale = accessor.get(LocaleService);
    console.log(locale);
    const univer = accessor.get(IUniverInstanceService);
    const sheet = univer
      .getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!
      .getActiveSheet();
    exportPython(sheet);
    return true;
  },
};
