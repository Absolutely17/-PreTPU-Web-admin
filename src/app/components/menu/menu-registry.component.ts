import {Component, ElementRef, Injectable, ViewChild} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {BehaviorSubject} from 'rxjs';
import {MenuService} from '../../services/menu/menu.service';
import {DialogService} from '../../services/dialog/dialog.service';
import {ComponentType} from '@angular/cdk/overlay';
import {MenuEditingComponent} from '../dialog/menu-editing-dialog/menu-editing.component';
import {TdLoadingService} from '@covalent/core/loading';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DialogMode} from '../dialog/dialog-mode';

export class MenuItem {
  id: string;
  name: string;
  level: number;
  type: string;
  position: number;
  url: string;
  parentId: string;
  linkedArticles: string[];
  image: string;
  children: MenuItem[];
  languageId: string;
}

export class MenuItemFlat {
  id: string;
  name: string;
  level: number;
  expandable: boolean;
  type: string;
}

@Injectable()
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<MenuItem[]>([]);

  dataFromService: any;
  dataFromServiceInOneRow: any;

  initialData: MenuItem[];

  countNewItems: number;

  get data(): MenuItem[] {
    return this.dataChange.value;
  }

  constructor(private menuService: MenuService, private snackBar: MatSnackBar) {
    this.countNewItems = 0;
  }

  /**
   * Вытаскиваем все пункты меню по языку из БД
   * @param language текущий выбранный язык
   */
  getItemsByLanguage(language: string): void {
    this.countNewItems = 0;
    this.menuService.getMenuItems(language).subscribe(it => {
      if (it) {
        this.dataFromService = it;
        this.initialData = [];
        this.dataFromServiceInOneRow = [];
        this.initialize(language);
      }
    }, error => {
      this.dataChange.next([]);
      this.snackBar.open(`${error.error.message}`,
        'Закрыть', {duration: 3000});
    });
  }

  initialize(languageId: string) {
    const data = this.buildItemsTree(this.dataFromService, 0, languageId);
    this.initialData = data.map((x) => x);
    this.dataChange.next(data);
  }

  /**
   * Формируем объекты из пришедших пунктов меню из БД
   */
  buildItemsTree(obj: object, level: number, languageId: string, parentId?: string): MenuItem[] {
    return Object.keys(obj).reduce<MenuItem[]>((accumulator, key) => {
      const value = obj[key].name;
      const children = obj[key].children;
      const node = new MenuItem();
      node.name = value;
      node.type = obj[key].type;
      node.level = obj[key].level;
      node.id = obj[key].id;
      node.position = obj[key].position;
      node.parentId = parentId;
      node.linkedArticles = [];
      node.linkedArticles = obj[key].linkedArticles;
      node.languageId = languageId;
      node.url = obj[key].url;
      node.image = obj[key].imageId;
      this.dataFromServiceInOneRow.push({...node});
      if (children != null) {
        if (typeof children === 'object') {
          node.children = this.buildItemsTree(children, level + 1, languageId, node.id);
        }
      }
      return accumulator.concat(node);
    }, []);
  }

  // Вставить имеющийся пункт во внутрь другого
  insertItem(parent: MenuItem, nodeNew: any): MenuItem {
    if (!parent.children) {
      parent.children = [];
    }
    let newItem;
    if (nodeNew instanceof MenuItem) {
      newItem = {...nodeNew} as MenuItem;
      newItem.level = parent.level + 1;
      newItem.parentId = parent.id;
    }
    parent.children.push(newItem);
    this.dataChange.next(this.data);
    return newItem;
  }

  // Редактируем пункт меню по пришедшим данным
  editItem(node: MenuItem, newParams: MenuItem): void {
    node.name = newParams.name;
    node.type = newParams.type;
    node.url = newParams.url;
    node.linkedArticles = newParams.linkedArticles;
    node.image = newParams.image;
    this.dataChange.next(this.data);
  }

  // Вставляем новый пункт меню
  insertNewItem(newItem: MenuItem, parent?: MenuItem): MenuItem {
    newItem.id = 'dummyId_' + this.countNewItems;
    this.countNewItems++;
    if (parent) {
      newItem.level = parent.level + 1;
      newItem.parentId = parent.id;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(newItem);
    } else {
      newItem.level = 1;
      this.data.push(newItem);
    }
    this.dataChange.next(this.data);
    return newItem;
  }

  // Перемещаем имеющийся пункт меню выше выбранного
  insertItemAbove(node: MenuItem, nodeNew: MenuItem): MenuItem {
    const parentNode = this.getParentFromNodes(node);
    const newItem = {...nodeNew} as MenuItem;
    newItem.level = node.level;
    if (parentNode != null) {
      parentNode.children.splice(parentNode.children.indexOf(node), 0, newItem);
      newItem.parentId = parentNode.id;
    } else {
      this.data.splice(this.data.indexOf(node), 0, newItem);
    }
    this.dataChange.next(this.data);
    return newItem;
  }

  // Перемещаем имеющийся пункт меню ниже выбранного
  insertItemBelow(node: MenuItem, nodeNew: MenuItem): MenuItem {
    const parentNode = this.getParentFromNodes(node);
    const newItem = {...nodeNew} as MenuItem;
    newItem.level = node.level;
    if (parentNode != null) {
      parentNode.children.splice(parentNode.children.indexOf(node) + 1, 0, newItem);
      newItem.parentId = parentNode.id;
    } else {
      this.data.splice(this.data.indexOf(node) + 1, 0, newItem);
    }
    this.dataChange.next(this.data);
    return newItem;
  }

  // Ищем родительский пункт относительного выбранного
  getParentFromNodes(node: MenuItem): MenuItem {
    for (let i = 0; i < this.data.length; ++i) {
      const currentRoot = this.data[i];
      const parent = this.getParent(currentRoot, node);
      if (parent != null) {
        return parent;
      }
    }
    return null;
  }

  getParent(currentRoot: MenuItem, node: MenuItem): MenuItem {
    if (currentRoot.children && currentRoot.children.length > 0) {
      for (let i = 0; i < currentRoot.children.length; ++i) {
        const child = currentRoot.children[i];
        if (child === node) {
          return currentRoot;
        } else if (child.children && child.children.length > 0) {
          const parent = this.getParent(child, node);
          if (parent != null) {
            return parent;
          }
        }
      }
    }
    return null;
  }

  // Удалить пункт
  deleteItem(node: MenuItem) {
    this.deleteNode(this.data, node);
    this.dataChange.next(this.data);
  }

  // Вставить внутрь пункта
  copyPasteItem(from: MenuItem, to: MenuItem): MenuItem {
    const newItem = this.insertItem(to, from);
    if (from.children) {
      from.children.forEach(child => {
        this.recalculateLevel(child, newItem);
      });
    }
    return newItem;
  }

  // Вставить над пунктом
  copyPasteItemAbove(from: MenuItem, to: MenuItem): MenuItem {
    const newItem = this.insertItemAbove(to, from);
    if (from.children) {
      from.children.forEach(child => {
        this.recalculateLevel(child, newItem);
      });
    }
    return newItem;
  }

  // Вставить под пунктом
  copyPasteItemBelow(from: MenuItem, to: MenuItem): MenuItem {
    const newItem = this.insertItemBelow(to, from);
    if (from.children) {
      from.children.forEach(child => {
        this.recalculateLevel(child, newItem);
      });
    }
    return newItem;
  }

  // Пересчитать уровень пункта меню
  recalculateLevel(child: MenuItem, parent: MenuItem) {
    child.level = parent.level + 1;
    if (child.children) {
      child.children.forEach(it => this.recalculateLevel(it, child));
    }
  }

  // Удалить пункт меню из дерева
  deleteNode(nodes: MenuItem[], nodeToDelete: MenuItem) {
    const index = nodes.indexOf(nodeToDelete, 0);
    if (index > -1) {
      nodes.splice(index, 1);
    } else {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          this.deleteNode(node.children, nodeToDelete);
        }
      });
    }
  }
}

@Component({
  selector: 'app-menu-registry',
  templateUrl: './menu-registry.component.html',
  styleUrls: ['./menu-registry.component.scss'],
})
export class MenuRegistryComponent {

  menuEditingDialog: ComponentType<MenuEditingComponent> = MenuEditingComponent;

  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<MenuItemFlat, MenuItem>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<MenuItem, MenuItemFlat>();

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<MenuItemFlat>;

  treeFlattener: MatTreeFlattener<MenuItem, MenuItemFlat>;

  dataSource: MatTreeFlatDataSource<MenuItem, MenuItemFlat>;

  currentLanguage: string;

  dicts: any;

  deletedItems: string[];

  loadingName = 'menuLoadingName';

  /* Drag and drop */
  dragNode: any;
  dragNodeExpandOverWaitTimeMs = 300;
  dragNodeExpandOverNode: any;
  dragNodeExpandOverTime: number;
  dragNodeExpandOverArea: string;
  @ViewChild('emptyItem') emptyItem: ElementRef;

  constructor(
    private database: ChecklistDatabase,
    private dialogService: DialogService,
    private menuService: MenuService,
    private loadingService: TdLoadingService
  ) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<MenuItemFlat>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.menuService.getDicts().subscribe(it => {
      if (it) {
        this.dicts = it;
      }
    });
    this.deletedItems = [];
  }

  getLevel = (node: MenuItemFlat) => node.level;

  isExpandable = (node: MenuItemFlat) => node.expandable;

  getChildren = (node: MenuItem): MenuItem[] => node.children;

  hasChild = (_: number, _nodeData: MenuItemFlat) => _nodeData.expandable;

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: MenuItem, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.name === node.name
      ? existingNode
      : new MenuItemFlat();
    flatNode.name = node.name;
    flatNode.type = node.type;
    flatNode.level = level;
    flatNode.id = node.id;
    flatNode.expandable = (node.children && node.children.length > 0);
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  // Добавляем новый пункт меню. Работае только в корне или у пунктов меню с типом LINKS_LIST
  addNewItem(node?: MenuItemFlat) {
    this.dialogService.show(this.menuEditingDialog, {
      mode: DialogMode.CREATE,
      dicts: this.dicts
    }).afterClosed().subscribe(it => {
      if (it) {
        if (node) {
          const parentNode = this.flatNodeMap.get(node);
          this.database.insertNewItem({...it, languageId: this.currentLanguage} as MenuItem, parentNode);
          this.treeControl.expand(node);
        } else {
          this.database.insertNewItem({...it, languageId: this.currentLanguage} as MenuItem);
        }
      }
    });
  }

  handleDragStart(event, node) {
    // Required by Firefox (https://stackoverflow.com/questions/19055264/why-doesnt-html5-drag-and-drop-work-in-firefox)
    event.dataTransfer.setData('foo', 'bar');
    event.dataTransfer.setDragImage(this.emptyItem.nativeElement, 0, 0);
    this.dragNode = node;
    this.treeControl.collapse(node);
  }

  handleDragOver(event, node) {
    event.preventDefault();

    // Handle node expand
    if (node === this.dragNodeExpandOverNode) {
      if (this.dragNode !== node && !this.treeControl.isExpanded(node)) {
        if ((new Date().getTime() - this.dragNodeExpandOverTime) > this.dragNodeExpandOverWaitTimeMs) {
          this.treeControl.expand(node);
        }
      }
    } else {
      this.dragNodeExpandOverNode = node;
      this.dragNodeExpandOverTime = new Date().getTime();
    }

    // Handle drag area
    const percentageX = event.offsetX / event.target.clientWidth;
    const percentageY = event.offsetY / event.target.clientHeight;
    if (percentageY < 0.25) {
      this.dragNodeExpandOverArea = 'above';
    } else if (percentageY > 0.75) {
      this.dragNodeExpandOverArea = 'below';
    } else {
      this.dragNodeExpandOverArea = 'center';
    }
  }

  handleDrop(event, node) {
    event.preventDefault();
    if (node !== this.dragNode) {
      let newItem: MenuItem;
      if (this.dragNodeExpandOverArea === 'above') {
        newItem = this.database.copyPasteItemAbove(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
      } else if (this.dragNodeExpandOverArea === 'below') {
        newItem = this.database.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
      } else if (this.flatNodeMap.get(node).type === 'LINKS_LIST') {
        newItem = this.database.copyPasteItem(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
      } else {
        return;
      }
      this.database.deleteItem(this.flatNodeMap.get(this.dragNode));
      this.treeControl.expandDescendants(this.nestedNodeMap.get(newItem));
    }
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
  }

  handleDragEnd(event) {
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
  }

  save(): void {
    const addedItems = [];
    const editedItems = [];
    this.analyzeEditingItems(addedItems, editedItems);
    if (addedItems.length || editedItems.length || this.deletedItems.length) {
      const menuInfo = {
        addedItems: addedItems,
        editedItems: editedItems,
        deletedItems: this.deletedItems
      };
      console.log(menuInfo);
      this.menuService.save(menuInfo).subscribe(it => {
        this.deletedItems = [];
        this.languageChange();
      });
    }
  }

  edit(node: MenuItemFlat): void {
    const origNode = this.flatNodeMap.get(node);
    this.dialogService.show(this.menuEditingDialog, {
      mode: DialogMode.EDIT,
      item: origNode,
      dicts: this.dicts
    }).afterClosed().subscribe(it => {
      if (it) {
        this.database.editItem(origNode, it);
      }
    });
  }

  remove(node: MenuItemFlat): void {
    this.deletedItems.push(node.id);
    this.database.deleteItem(this.flatNodeMap.get(node));
  }

  analyzeEditingItems(addedItems: any, editedItems: any): void {
    this.database.data.forEach((it, index) => {
      // Проверка на новые элементы
      if (!this.database.initialData || this.database.initialData.filter(init => init.id === it.id).length < 1) {
        addedItems.push(it);
      }
      this.checkOnNewItem(it, addedItems);

      // Заполняем поле "Позиция"
      it.position = index + 1;
      this.fillPositionField(it);
    });
    // Ищем измененные элементы
    if (this.database.dataFromServiceInOneRow) {
      this.database.data.forEach(it => {
        this.collectEditedItems(it, editedItems);
      });
    }
  }

  // Ищем измененные элементы по отношению к исходным
  collectEditedItems(item: MenuItem, editedItems: MenuItem[]): void {
    let sameInitItem = this.database.dataFromServiceInOneRow.filter(x => x.id === item.id);
    if (sameInitItem && sameInitItem.length === 1) {
      if (JSON.stringify({...item, children: undefined}) !== JSON.stringify(sameInitItem[0])) {
        editedItems.push({...item, children: null});
      }
    }
    if (item.children) {
      item.children.forEach(x => this.collectEditedItems(x, editedItems));
    }
  }

  // Проверка на новые элементы
  checkOnNewItem(item: MenuItem, addedItems: MenuItem[]): void {
    if (item.children) {
      item.children.forEach((it) => {
        if (it.id.startsWith('dummyId')) {
          addedItems.push(it);
        }
        this.checkOnNewItem(it, addedItems);
      });
    }
  }

  // Заполняем поле "Позиция"
  fillPositionField(item: MenuItem): void {
    if (item.children) {
      item.children.forEach((it, index) => {
        it.position = index + 1;
        this.fillPositionField(it);
      });
    }
  }

  // Подгружаем пункты меню при смене языка меню
  languageChange(): void {
    this.database.getItemsByLanguage(this.currentLanguage);
    this.database.dataChange.subscribe(data => {
      this.dataSource.data = [];
      this.dataSource.data = data;
    });
  }

}

