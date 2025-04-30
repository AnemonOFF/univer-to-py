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

    setUniverData({ univer, univerAPI });

    univerAPI.createWorkbook({ name: "Test Sheet" });

    return () => {
      univerAPI.dispose();
    };
  }, []);

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
