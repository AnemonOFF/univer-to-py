import { FUniver, Univer } from "@univerjs/presets";
import React from "react";

const Export: React.FC<{ univer: Univer; univerApi: FUniver }> = ({
  univerApi,
}) => {
  const onExport = () => {
    const fWorkbook = univerApi.getActiveWorkbook()!;
    const fWorksheet = fWorkbook.getActiveSheet();
    const sheetSnapshot = fWorksheet.getSheet().getSnapshot();
    const func = sheetSnapshot.cellData[1][0].f;
    console.log("Целевая функция", func);
    const restrictions = [];
    for (const [, row] of Object.entries(sheetSnapshot.cellData)) {
      const cell = row[1];
      if (cell) restrictions.push(cell.f);
    }
    console.log("Ограничения", restrictions);
  };

  return <button onClick={onExport}>Экспорт</button>;
};

export default React.memo(Export);
