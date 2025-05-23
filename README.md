# Плагин для Univer Sheets
Для преобразования условий задач математического программирования в готовый Python-код с использованием библиотеки PuLP

## Как пользоваться

1. В ячейке A2 написать целевую функцию (средствами формул Univer)
2. В столбце B (начиная со второй строки) записать ограничения (средствами формул Univer)
3. В столбце C (начиная со второй строки) записать названия параметров, в последующих столбцах записать значения, на которые ссылаются ограничения и целевая функция
4. Обратите внимание, что искомые параметры не должны быть записаны (то есть в формулах они должны ссылаться на пустую ячейку)

## Структура репозитория

Данный репозиторий представляет собой React приложение, запускающее Univer Sheets и встраивает в него плагин.

Весь код плагина находиться в директории `/src/plugin`
В `src/App.tsx` происходит создание объекта Univer, интеграция плагина и система локальных сохранений таблицы

## Запуск приложения

Для запуска этого приложения необходимо:
1. Склонировать репозиторий в локальную папку
2. Установить NodeJS версии 16 или новее
3. Установить зависимости `npm i`
4. Собрать приложение `npm run build`
5. Запустить приложение `npm run preview`

Для минимальной работы достаточно взять код плагина (`/src/plugin`) и создать объект Univer:
1. Создание React приложения с помощью Vite: `npm create vite@latest univer-app -- --template react-ts`
2. Установка библиотек для работы Univer и плагина `npm i @flighter/a1-notation @univerjs/presets`
3. Добавить код плагина в папку `/src/plugin`
4. В файле `/src/App.tsx` написать следующий код:
```tsx
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

    univerAPI.createWorkbook(
      { name: "Test Sheet" }
    );
    
    return () => {
      univerAPI.dispose();
    };
  }, []);

  return <div ref={containerRef} className="univer__app"></div>;
}
```
