import {entity} from "./entity.js";


export const goose_component = (() => {

  class GooseComponent extends entity.Component {
    constructor(params) {
      super();
      this._health = params.health;
      this._params = params;
    }

    InitComponent() {

      this._UpdateUI();
    }

    IsAlive() {
      return this._health > 0;
    }

    _UpdateUI() {
      if (!this._params.updateUI) {
        return;
      }
    }
  };

  return {
    GooseComponent: GooseComponent,
  };

})();