import { useEffect, useRef, useState } from "react";

import {
  createUniver,
  defaultTheme,
  LocaleType,
  merge,
} from "@univerjs/presets";
import { UniverSheetsCorePreset } from "@univerjs/presets/preset-sheets-core";
import UniverPresetSheetsCoreEnUS from "@univerjs/presets/preset-sheets-core/locales/en-US";

import "@univerjs/presets/lib/styles/preset-sheets-core.css";
import { ExportButton } from "./components/export";

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [univerData, setUniverData] =
    useState<ReturnType<typeof createUniver>>();

  useEffect(() => {
    const { univerAPI, univer } = createUniver({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: merge({}, UniverPresetSheetsCoreEnUS),
      },
      theme: defaultTheme,
      presets: [
        UniverSheetsCorePreset({
          container: containerRef.current ?? undefined,
        }),
      ],
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
    setUniverData({ univer, univerAPI });

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

  // Save every 5 seconds
  // useEffect(() => {
  //   if (!univerData) return;

  //   const interval = setInterval(() => {
  //     console.log("Saving...");
  //     const data = univerData.univerAPI.getActiveWorkbook()?.save();
  //     if (data) localStorage.setItem("univer-save", JSON.stringify(data));
  //     console.log("Saved!");
  //   }, 5000);

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [univerData]);

  return (
    <div className="univer__wrapper">
      <aside className="univer__sidebar">
        {univerData && (
          <ExportButton
            univer={univerData.univer}
            univerApi={univerData.univerAPI}
          />
        )}
      </aside>
      <div ref={containerRef} className="univer__app"></div>
    </div>
  );
}
