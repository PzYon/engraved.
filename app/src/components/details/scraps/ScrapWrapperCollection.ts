import { ScrapWrapper } from "./ScrapWrapper";

export class ScrapWrapperCollection {
  private wrappers: ScrapWrapper[] = [];

  private index = -1;

  private get highestIndex() {
    return this.wrappers.length - 1;
  }

  add(wrapper: ScrapWrapper) {
    this.wrappers.push(wrapper);
  }

  setEditMode() {
    this.wrappers[this.index].setIsEditMode();
  }

  moveFocusDown() {
    this.index = this.getNextHigherIndex(this.index);
    this.wrappers[this.index].giveFocus();
  }

  moveFocusUp() {
    this.index = this.getNextLowerIndex(this.index);
    this.wrappers[this.index].giveFocus();
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
