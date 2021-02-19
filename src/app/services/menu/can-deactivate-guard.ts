import {CanDeactivate} from "@angular/router";
import {Injectable} from "@angular/core";
import {MenuRegistryComponent} from "../../components/menu-registry/menu-registry.component";

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<MenuRegistryComponent> {
  constructor() {
  }

  canDeactivate(component: MenuRegistryComponent): boolean {
    if(component.hasAnyChange){
      if (confirm("Вы не сохранили изменения пунктов меню. Сохраните, иначе вы потеряете изменения.")) {
        return true;
      } else {
        component.markSaveButton();
        return false;
      }
    }
    return true;
  }
}
