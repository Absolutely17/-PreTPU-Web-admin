import {Component, ElementRef, Injectable, ViewChild} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {SelectionModel} from '@angular/cdk/collections';
import {BehaviorSubject} from 'rxjs';
import {MenuService} from '../../services/menu/menu.service';

/**
 * Node for to-do item
 */
export class TodoItemNode {
  id: string;
  children: TodoItemNode[];
  item: string;
  level: number;
  type: string;
  position: number;
  parentId: string;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  id: string;
  item: string;
  level: number;
  expandable: boolean;
  type: string;
}

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);

  dataFromService: any;
  dataFromServiceInOneArray: any;
  initialData: TodoItemNode[];

  countNewItems: number;

  get data(): TodoItemNode[] { return this.dataChange.value; }

  constructor(private menuService: MenuService) {
    this.countNewItems = 0;
    menuService.getMenuItems().subscribe(it => {
      if (it) {
        this.dataFromService = it;
        this.initialData = [];
        this.dataFromServiceInOneArray = [];
        this.initialize();
      }
    });
  }

  initialize() {
    const data = this.buildFileTree(this.dataFromService, 0);
    this.initialData = data.map((x) => x);
    this.dataChange.next(data);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `TodoItemNode`.
   */
  buildFileTree(obj: object, level: number): TodoItemNode[] {
    return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
      const value = obj[key].name;
      const children = obj[key].children;
      const node = new TodoItemNode();
      node.item = value;
      node.type = obj[key].type;
      node.level = obj[key].level;
      node.id = obj[key].id;
      node.position = obj[key].position;
      this.dataFromServiceInOneArray.push({...node});
      if (children != null) {
        if (typeof children === 'object') {
          node.children = this.buildFileTree(children, level + 1);
        }
      }
      return accumulator.concat(node);
    }, []);
  }

  /** Add an item to to-do list */
  insertItem(parent: TodoItemNode, nodeNew: any): TodoItemNode {
    if (!parent.children) {
      parent.children = [];
    }
    let newItem;
    if (nodeNew instanceof TodoItemNode) {
      newItem = {...nodeNew} as TodoItemNode;
      newItem.level = parent.level + 1;
    } else {
      newItem = { item: nodeNew, id: 'dummyId_' + this.countNewItems, level: parent.level + 1 } as TodoItemNode;
      this.countNewItems++;
    }
    parent.children.push(newItem);
    this.dataChange.next(this.data);
    return newItem;
  }

  insertItemAbove(node: TodoItemNode, nodeNew: TodoItemNode): TodoItemNode {
    const parentNode = this.getParentFromNodes(node);
    const newItem = {...nodeNew} as TodoItemNode;
    newItem.level = node.level;
    if (parentNode != null) {
      parentNode.children.splice(parentNode.children.indexOf(node), 0, newItem);
    } else {
      this.data.splice(this.data.indexOf(node), 0, newItem);
    }
    this.dataChange.next(this.data);
    return newItem;
  }

  insertItemBelow(node: TodoItemNode, nodeNew: TodoItemNode): TodoItemNode {
    const parentNode = this.getParentFromNodes(node);
    const newItem = {...nodeNew} as TodoItemNode;
    newItem.level = node.level;
    if (parentNode != null) {
      parentNode.children.splice(parentNode.children.indexOf(node) + 1, 0, newItem);
    } else {
      this.data.splice(this.data.indexOf(node) + 1, 0, newItem);
    }
    this.dataChange.next(this.data);
    return newItem;
  }

  getParentFromNodes(node: TodoItemNode): TodoItemNode {
    for (let i = 0; i < this.data.length; ++i) {
      const currentRoot = this.data[i];
      const parent = this.getParent(currentRoot, node);
      if (parent != null) {
        return parent;
      }
    }
    return null;
  }

  getParent(currentRoot: TodoItemNode, node: TodoItemNode): TodoItemNode {
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

  updateItem(node: TodoItemNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }

  // Удалить пункт
  deleteItem(node: TodoItemNode) {
    this.deleteNode(this.data, node);
    this.dataChange.next(this.data);
  }

  // Вставить внутрь пункта
  copyPasteItem(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
    const newItem = this.insertItem(to, from);
    if (from.children) {
      from.children.forEach(child => {
        this.recalculateLevel(child, newItem);
      });
    }
    return newItem;
  }

  // Вставить над пунктом
  copyPasteItemAbove(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
    const newItem = this.insertItemAbove(to, from);
    if (from.children) {
      from.children.forEach(child => {
        this.recalculateLevel(child, newItem);
      });
    }
    return newItem;
  }

  // Вставить под пунктов
  copyPasteItemBelow(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
    const newItem = this.insertItemBelow(to, from);
    if (from.children) {
      from.children.forEach(child => {
        this.recalculateLevel(child, newItem);
      });
    }
    return newItem;
  }

  recalculateLevel(child: TodoItemNode, parent: TodoItemNode) {
    child.level = parent.level + 1;
    if (child.children) {
      child.children.forEach(it => this.recalculateLevel(it, child));
    }
  }

  deleteNode(nodes: TodoItemNode[], nodeToDelete: TodoItemNode) {
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
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TodoItemFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

  /* Drag and drop */
  dragNode: any;
  dragNodeExpandOverWaitTimeMs = 300;
  dragNodeExpandOverNode: any;
  dragNodeExpandOverTime: number;
  dragNodeExpandOverArea: string;
  @ViewChild('emptyItem') emptyItem: ElementRef;

  constructor(private database: ChecklistDatabase) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    database.dataChange.subscribe(data => {
      this.dataSource.data = [];
      this.dataSource.data = data;
    });
  }

  getLevel = (node: TodoItemFlatNode) => node.level;

  isExpandable = (node: TodoItemFlatNode) => node.expandable;

  getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TodoItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
      ? existingNode
      : new TodoItemFlatNode();
    flatNode.item = node.item;
    flatNode.type = node.type;
    flatNode.level = level;
    flatNode.id = node.id;
    flatNode.expandable = (node.children && node.children.length > 0);
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    return descendants.every(child => this.checklistSelection.isSelected(child));
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
  }

  /** Select the category so we can insert the new item. */
  addNewItem(node: TodoItemFlatNode) {
    const parentNode = this.flatNodeMap.get(node);
    this.database.insertItem(parentNode, '');
    this.treeControl.expand(node);
  }

  /** Save the node to database */
  saveNode(node: TodoItemFlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this.database.updateItem(nestedNode, itemValue);
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
      let newItem: TodoItemNode;
      if (this.dragNodeExpandOverArea === 'above') {
        newItem = this.database.copyPasteItemAbove(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
      } else if (this.dragNodeExpandOverArea === 'below') {
        newItem = this.database.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
      } else {
        newItem = this.database.copyPasteItem(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
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
    this.collectOnlyEditedItems();
  }

  edit(node: TodoItemNode): void {
    this.database.data.forEach(x => x.type = 'ARTICLE');
  }

  collectOnlyEditedItems(): void {
    const addedItems = [];
    const editedItems = [];

    this.database.data.forEach((it, index) => {

      // Проверка на новые элементы
      if (this.database.initialData.filter(init => init.id === it.id).length < 1) {
        addedItems.push(it);
      }
      this.checkOnNewItem(it, addedItems);

      // Заполняем поле "Позиция"
      it.position = index + 1;
      this.fillPositionField(it);
    });
    // Ищем измененные элементы
    this.database.data.forEach(it => {
      this.collectEditedItems(it, editedItems);
    });
    console.log(addedItems);
    console.log(editedItems);
  }

  collectEditedItems(item: TodoItemNode, editedItems: TodoItemNode[]): void {
    let sameInitItem = this.database.dataFromServiceInOneArray.filter(x => x.id === item.id);
    if (sameInitItem && sameInitItem.length === 1) {

      if (JSON.stringify({...item, children: undefined}) !== JSON.stringify(sameInitItem[0])) {
        editedItems.push(item);
      }
    }
    if (item.children) {
      item.children.forEach(x => this.collectEditedItems(x, editedItems));
    }
  }

  // Проверка на новые элементы
  checkOnNewItem(item: TodoItemNode, addedItems: TodoItemNode[]): void {
    if (item.children) {
      item.children.forEach((it) => {
        if (it.id.startsWith('dummyId')) {
          addedItems.push(it);
        }
        this.checkOnNewItem(it, addedItems);
      })
    }
  }
  // Заполняем поле "Позиция"
  fillPositionField(item: TodoItemNode): void {
    if (item.children) {
      item.children.forEach((it, index) => {
        it.position = index + 1;
        this.fillPositionField(it);
      })
    }
  }


}

