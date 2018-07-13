/**
 * @author zacharyjuang
 */
import Handsontable from 'handsontable';

class MulticolumnSort extends Handsontable.plugins.BasePlugin {
  constructor(hotInstance) {
    super(hotInstance);
  }

  isEnabled() {
    return !!this.hot.getSettings().multicolumnSort;
  }

  enablePlugin() {
    super.enablePlugin();
  }

  disablePlugin() {
    super.disablePlugin();
  }

  updatePlugin() {
    this.disablePlugin();
    this.enablePlugin();

    super.updatePlugin();
  }

  onAfterChange(changes, source) {

  }

  destroy() {
    super.destroy();
  }
}

Handsontable.plugins.registerPlugin('multicolumnSort', MulticolumnSort);

export default MulticolumnSort;
