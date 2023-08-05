import { ISCrapListItem } from "./IScrapListItem";

import { ListItemWrapper } from "./ListItemWrapper";

export class ListItemWrapperCollection {
  constructor(
    public items: ListItemWrapper[],
    private onChange: (value: ISCrapListItem[]) => void
  ) {}

  private get highestIndex() {
    return this.items.length - 1;
  }

  remove(index: number) {
    this.items = this.items.filter((_, i) => i !== index);
    this.items[Math.min(index, this.highestIndex)].giveFocus();
    this.fireOnChange();
  }

  add(index: number, ...listItems: ListItemWrapper[]) {
    this.items.splice(index, 0, ...listItems);
    this.fireOnChange();
  }

  update(index: number, updatedItem: ISCrapListItem) {
    this.items[index].raw = updatedItem;
    this.fireOnChange();
  }

  moveFocusUp(index: number) {
    this.items[this.getNextLowerIndex(index)].giveFocus();
  }

  moveFocusDown(index: number) {
    this.items[this.getNextHigherIndex(index)].giveFocus();
  }

  moveItemUp(index: number) {
    const lowerIndex = this.getNextLowerIndex(index);

    if (lowerIndex > index) {
      const item = this.items.splice(0, 1);
      this.add(this.highestIndex + 1, item[0]);
    } else {
      const upperItem = this.items[index];
      const lowerItem = this.items[lowerIndex];

      this.items[lowerIndex] = upperItem;
      this.items[index] = lowerItem;
    }

    this.fireOnChange();
  }

  moveItemDown(index: number) {
    const higherIndex = this.getNextHigherIndex(index);

    if (higherIndex < index) {
      const item = this.items.splice(this.highestIndex, 1);
      this.add(0, item[0]);
    } else {
      const lowerItem = this.items[index];
      const upperItem = this.items[higherIndex];

      this.items[higherIndex] = lowerItem;
      this.items[index] = upperItem;
    }

    this.fireOnChange();
  }

  moveCheckedToBottom() {
    this.items = this.items.sort((a, b) => {
      return a.raw.isCompleted === b.raw.isCompleted
        ? 0
        : a.raw.isCompleted
        ? 1
        : -1;
    });

    this.fireOnChange();
  }

  toggleChecked() {
    const isMajorityCompleted =
      this.items.filter((i) => i.raw.isCompleted).length >
      this.items.length / 2;

    const areAllSameState =
      this.items.filter((i) => i.raw.isCompleted === isMajorityCompleted)
        .length === this.items.length;

    console.log("before", this.items);

    this.items = this.items.map((i) => {
      i.raw.isCompleted = areAllSameState
        ? !isMajorityCompleted
        : isMajorityCompleted;
      return i;
    });

    console.log("after", this.items);

    this.fireOnChange();
  }

  deleteChecked() {
    this.items = this.items.filter((i) => !i.raw.isCompleted);

    this.fireOnChange();
  }

  private fireOnChange() {
    this.onChange(this.items.map((i) => i.raw));
  }

  private getNextHigherIndex(index: number) {
    const nextIndex = index + 1;
    return nextIndex > this.highestIndex ? 0 : nextIndex;
  }

  private getNextLowerIndex(index: number) {
    const nextIndex = index - 1;
    return nextIndex < 0 ? this.highestIndex : nextIndex;
  }
}
