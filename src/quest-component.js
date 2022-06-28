import {entity} from "./entity.js";


export const quest_component = (() => {

  const _TITLE = 'Tom Wanyama:';
  const _TEXT = `Welcome Adventurer! Welcome to the ETB Learning Factory, I see you are ready to learn so please go inside! I must test you with some PLC tasks that will analyze your programming and ladder logic skills. Go into the learning factory, take a look at the assembly line, and find the robot arm. Rearrange the logic symbols on the left by dragging to the right panel so the ladder logic is correct and then please come back to me.`;

  class QuestComponent extends entity.Component {
    constructor() {
      super();

      const e = document.getElementById('quest-ui');
      e.style.visibility = 'hidden';
    }

    InitComponent() {
      this._RegisterHandler('input.picked', (m) => this._OnPicked(m));
      
    }

    _OnPicked(msg) {
      // The first quest is hard coded
      const quest = {
        id: 'Tom-PLCQuest',
        title: _TITLE,
        text: _TEXT,
      };
      // The quest is then added to the journal so the user is able to access any time during gameplay
      this._AddQuestToJournal(quest);
    }

    _AddQuestToJournal(quest) {
      const ui = this.FindEntity('ui').GetComponent('UIController');
      ui.AddQuest(quest);
    }
  };

  return {
      QuestComponent: QuestComponent,
  };
})();