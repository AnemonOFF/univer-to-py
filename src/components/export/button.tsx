import { FUniver, Univer } from "@univerjs/presets";
import React from "react";
import { Button } from "../ui/button";
import { Convert, extractVariables } from "@/converter";
import A1 from "@flighter/a1-notation";

const ExportButton: React.FC<{ univer: Univer; univerApi: FUniver }> = ({
  univerApi,
}) => {
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

  const onExport = () => {
    const fWorkbook = univerApi.getActiveWorkbook()!;
    const fWorksheet = fWorkbook.getActiveSheet();
    const sheetSnapshot = fWorksheet.getSheet().getSnapshot();

    const func = sheetSnapshot.cellData[1][0].f;
    console.log("Целевая функция", func);
    if (!func) {
      alert("Укажите целевую функцию в ячейке A1");
      return;
    }

    const restrictions = [];
    for (const [, row] of Object.entries(sheetSnapshot.cellData)) {
      const cell = row[1];
      if (cell && cell.f) restrictions.push(cell.f);
    }
    console.log("Ограничения", restrictions);

    const variables = extractVariables([func, ...restrictions]);
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
        const val = sheetSnapshot.cellData[row][col].v;
        if (!val) return res;
        return { [variable]: val.toString(), ...res };
      },
      {}
    );
    console.log("Переменные", varData);

    try {
      const pythonCode = Convert(func, restrictions, varData);
      download(pythonCode);
    } catch (ex) {
      alert(
        "Во время конвертации произошла ошибка, проверьте правильность формул"
      );
      throw ex;
    }
  };

  return <Button onClick={onExport}>Экспорт</Button>;
};

export default React.memo(ExportButton);
