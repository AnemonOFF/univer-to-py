import { Disposable, ICommandService, Inject } from "@univerjs/core";
import {
  ComponentManager,
  IMenuManagerService,
  RibbonStartGroup,
} from "@univerjs/ui";

import { ExportButtonFactory } from "./menu/export-button.menu";
import { ExportButtonOperation } from "../commands/operations/export-button.operation";
import { PythonIcon } from "../components/icons/python-icon";

export class ExportButtonController extends Disposable {
  constructor(
    @ICommandService private readonly _commandService: ICommandService,
    @IMenuManagerService
    private readonly _menuMangerService: IMenuManagerService,
    @Inject(ComponentManager)
    private readonly _componentManager: ComponentManager
  ) {
    super();

    this._initCommands();
    this._registerComponents();
    this._initMenus();
  }

  /**
   * register commands
   */
  private _initCommands(): void {
    [ExportButtonOperation].forEach((c) => {
      this.disposeWithMe(this._commandService.registerCommand(c));
    });
  }

  /**
   * register icon components
   */
  private _registerComponents(): void {
    const componentManager = this._componentManager;
    this.disposeWithMe(componentManager.register("PythonIcon", PythonIcon));
  }

  /**
   * register menu items
   */
  private _initMenus(): void {
    this._menuMangerService.mergeMenu({
      [RibbonStartGroup.HISTORY]: {
        [ExportButtonOperation.id]: {
          order: -1,
          menuItemFactory: ExportButtonFactory,
        },
      },
    });
  }
}
