import { FUniver, Univer } from "@univerjs/presets";
import React from "react";
import { Button } from "../ui/button";
import { Convert } from "@/converter";

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
    const func = sheetSnapshot.cellData[1][0].f as string;
    console.log("Целевая функция", func);
    const restrictions = [];
    for (const [, row] of Object.entries(sheetSnapshot.cellData)) {
      const cell = row[1];
      if (cell && cell.f) restrictions.push(cell.f);
    }
    console.log("Ограничения", restrictions);

    const pythonCode = Convert(func, restrictions);
    download(pythonCode);
  };

  return <Button onClick={onExport}>Экспорт</Button>;
};

export default React.memo(ExportButton);
