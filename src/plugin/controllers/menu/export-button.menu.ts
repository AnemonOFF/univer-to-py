import type { IMenuButtonItem } from "@univerjs/ui";
import { MenuItemType } from "@univerjs/ui";

import { ExportButtonOperation } from "../../commands/operations/export-button.operation";

export function ExportButtonFactory(): IMenuButtonItem<string> {
  return {
    // Bind the command id, clicking the button will trigger this command
    id: ExportButtonOperation.id,
    // The type of the menu item, in this case, it is a button
    type: MenuItemType.BUTTON,
    // The icon of the button, which needs to be registered in ComponentManager
    icon: "PythonIcon",
    // The tooltip of the button. Prioritize matching internationalization. If no match is found, the original string will be displayed
    tooltip: "exportButton.tooltip",
    // The title of the button. Prioritize matching internationalization. If no match is found, the original string will be displayed
    title: "exportButton.button",
  };
}
