import { useEffect, useRef } from "react";

import {
  createUniver,
  defaultTheme,
  LocaleType,
  merge,
} from "@univerjs/presets";
import { UniverSheetsCorePreset } from "@univerjs/presets/preset-sheets-core";
import UniverPresetSheetsCoreEnUS from "@univerjs/presets/preset-sheets-core/locales/en-US";
import UniverPresetSheetsCoreRuRU from "@univerjs/presets/preset-sheets-core/locales/ru-RU";

import "@univerjs/presets/lib/styles/preset-sheets-core.css";
import { UniverSheetsPythonExportPlugin } from "./plugin";

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { univerAPI } = createUniver({
      locale: LocaleType.RU_RU,
      locales: {
        [LocaleType.RU_RU]: merge({}, UniverPresetSheetsCoreRuRU),
        [LocaleType.EN_US]: merge({}, UniverPresetSheetsCoreEnUS),
      },
      theme: defaultTheme,
      presets: [
        UniverSheetsCorePreset({
          container: containerRef.current ?? undefined,
        }),
      ],
      plugins: [UniverSheetsPythonExportPlugin],
    });

    univerAPI.addEvent(univerAPI.Event.SheetEditEnded, (params) => {
      console.log("Saving...");
      const { workbook } = params;
      const data = workbook.save();
      if (data) localStorage.setItem("univer-save", JSON.stringify(data));
      console.log("Saved!");
    });

    const savedDataString = localStorage.getItem("univer-save");
    const savedData = savedDataString ? JSON.parse(savedDataString) : null;

    const workbook = univerAPI.createWorkbook(
      savedData ?? { name: "Test Sheet" }
    );

    if (!savedData) {
      const sheet = workbook.getActiveSheet();
      sheet.getRange("A1").setValue("Целевая функция");
      sheet.getRange("B1").setValue("Ограничения");
      sheet.getRange("C1").setValue("Параметры");
    }

    return () => {
      univerAPI.dispose();
    };
  }, []);

  return <div ref={containerRef} className="univer__app"></div>;
}
