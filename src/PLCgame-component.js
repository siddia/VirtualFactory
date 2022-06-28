import {entity} from "./entity.js";


export const PLCgame_component = (() => {

  const _TITLEgame = 'Ladder Logic:';
  const _TEXTgame = `Welcome Adventurer!`;

  class PLCComponent extends entity.Component {
    constructor() {
      super();

      const e = document.getElementById('PLC-ui');
      e.style.visibility = 'hidden';

      const b = document.getElementById('icon-bar-PLC');
      b.style.visibility = 'hidden';
    }

    InitComponent() {
      this._RegisterHandler('input.picked', (m) => this._OnPicked(m));
    }

    _OnPicked(msg) {
      const game = {
        id: 'game-PLC',
        title: _TITLEgame,
        text: _TEXTgame,
      };
      
      const c = document.getElementById('icon-bar-PLC');
      c.style.visibility = '';
    }

  };

  return {
      PLCComponent: PLCComponent,
  };
})();