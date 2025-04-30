import {
  LocaleService,
  Plugin,
  Inject,
  Injector,
  UniverInstanceType,
} from "@univerjs/core";
import type { Dependency } from "@univerjs/core";
import ruRU from "./locales/ru-RU";
import enUS from "./locales/en-US";
import { ExportButtonController } from "./controllers/export-button.controller";

const SHEET_CUSTOM_MENU_PLUGIN = "SHEET_CUSTOM_MENU_PLUGIN";

export class UniverSheetsPythonExportPlugin extends Plugin {
  static override type = UniverInstanceType.UNIVER_SHEET;
  static override pluginName = SHEET_CUSTOM_MENU_PLUGIN;

  constructor(
    @Inject(Injector) protected readonly _injector: Injector,
    @Inject(LocaleService) private readonly _localeService: LocaleService
  ) {
    super();

    this._localeService.load({
      ruRU,
      enUS,
    });
  }

  override onStarting(): void {
    ([[ExportButtonController]] as Dependency[]).forEach((d) =>
      this._injector.add(d)
    );
  }

  onReady(): void {
    this._injector.get(ExportButtonController);
  }
}
