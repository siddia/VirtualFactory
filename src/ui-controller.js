import {entity} from './entity.js';

export const ui_controller = (() => {

  class UIController extends entity.Component {
    constructor(params) {
      super();
      this._params = params;
      this._quests = {};
    }
  
    InitComponent() {
      this._iconBar = {
        stats: document.getElementById('icon-bar-stats'),
        inventory: document.getElementById('icon-bar-inventory'),
        quests: document.getElementById('icon-bar-quests'),
        plc: document.getElementById('icon-bar-PLC'),
        plcL2: document.getElementById('level2'),
        plcL3: document.getElementById('level3'),
        plcL4: document.getElementById('level4'),
        infoScreen: document.getElementById('icon-bar-infoScreen'),
        page1: document.getElementById('page-bar-infoScreen1'),
        page2: document.getElementById('page-bar-infoScreen2'),
        page3: document.getElementById('page-bar-infoScreen3'),
        page4: document.getElementById('page-bar-infoScreen4'),
        page5: document.getElementById('page-bar-infoScreen5'),
        page6: document.getElementById('page-bar-infoScreen6'),
        page7: document.getElementById('page-bar-infoScreen7'),
        page8: document.getElementById('page-bar-infoScreen8'),
        page9: document.getElementById('page-bar-infoScreen9'),
        enterGame: document.getElementById('enter'),
        aboutGame: document.getElementById('about-team'),
      };

      this._ui = {
        inventory: document.getElementById('inventory'),
        stats: document.getElementById('stats'),
        quests: document.getElementById('quest-journal'),
        plc: document.getElementById('PLC-ui'),
        plcL2: document.getElementById('PLC-ui-lvl2'),
        plcL3: document.getElementById('PLC-ui-lvl3'),
        plcL4: document.getElementById('PLC-ui-lvl4'),
        infoScreen: document.getElementById('infoScreen-journal'),
        page1: document.getElementById('infoScreen-ui'),
        page2: document.getElementById('infoScreen-ui2'),
        page3: document.getElementById('infoScreen-ui3'),
        page4: document.getElementById('infoScreen-ui4'),
        page5: document.getElementById('infoScreen-ui5'),
        page6: document.getElementById('infoScreen-ui6'),
        page7: document.getElementById('infoScreen-ui7'),
        page8: document.getElementById('infoScreen-ui8'),
        page9: document.getElementById('infoScreen-ui9'),
        enterGame: document.getElementById('enterscreen'),
        aboutGame: document.getElementById('aboutUsID'),
        clickMe: document.getElementById('icon-bar-clickme-popup'),
      };

      this._iconBar.inventory.onclick = (m) => { this._OnInventoryClicked(m); };
      this._iconBar.stats.onclick = (m) => { this._OnStatsClicked(m); };
      this._iconBar.quests.onclick = (m) => { this._OnQuestsClicked(m); };
      this._iconBar.plc.onclick = (m) => { this._OnPLCClicked(m); };
      this._iconBar.plcL2.onclick = (m) => { this._OnPLCL2Clicked(m); };
      this._iconBar.plcL3.onclick = (m) => { this._OnPLCL3Clicked(m); };
      this._iconBar.plcL4.onclick = (m) => { this._OnPLCL4Clicked(m); };
      this._iconBar.infoScreen.onclick = (m) => { this._OnInfoClicked(m); };
      this._iconBar.page1.onclick = (m) => { this._OnPage1Clicked(m); };
      this._iconBar.page2.onclick = (m) => { this._OnPage2Clicked(m); };
      this._iconBar.page3.onclick = (m) => { this._OnPage3Clicked(m); };
      this._iconBar.page4.onclick = (m) => { this._OnPage4Clicked(m); };
      this._iconBar.page5.onclick = (m) => { this._OnPage5Clicked(m); };
      this._iconBar.page6.onclick = (m) => { this._OnPage6Clicked(m); };
      this._iconBar.page7.onclick = (m) => { this._OnPage7Clicked(m); };
      this._iconBar.page8.onclick = (m) => { this._OnPage8Clicked(m); };
      this._iconBar.page9.onclick = (m) => { this._OnPage9Clicked(m); };
      this._iconBar.enterGame.onclick = (m) => { this._OnEnterGameClicked(m); };
      this._iconBar.aboutGame.onclick = (m) => { this._OnAboutGameClicked(m); };
      this._HideUI();
      //this._iconBar.page1.onclick = (m) => { this._OnPage1Clicked(m); };
    }

    AddQuest(quest) 
    {
      if (quest.id in this._quests) {
        return;
      }

      const e = document.createElement('DIV');
      e.className = 'quest-entry';
      e.id = 'quest-entry-' + quest.id;
      e.innerText = quest.title;
      e.onclick = (evt) => {
        this._OnQuestSelected(e.id);
      };
      document.getElementById('quest-journal').appendChild(e);

      this._quests[quest.id] = quest;
      this._OnQuestSelected(quest.id);
    }

    _OnQuestSelected(id) {
      const quest = this._quests[id];

      const e = document.getElementById('quest-ui');
      e.style.visibility = '';

      const text = document.getElementById('quest-text');
      text.innerText = quest.text;
      const title = document.getElementById('quest-text-title');
      title.innerText = quest.title;
    }

    _HideUI() {
      this._ui.inventory.style.visibility = 'hidden';
      this._ui.stats.style.visibility = 'hidden';
      this._ui.quests.style.visibility = 'hidden';
      this._ui.plc.style.visibility = 'hidden';
      this._ui.plcL2.style.visibility = 'hidden';
      this._ui.plcL3.style.visibility = 'hidden';
      this._ui.plcL4.style.visibility = 'hidden';
      this._ui.infoScreen.style.visibility = 'hidden';
      this._ui.page1.style.visibility = 'hidden';
      this._ui.page2.style.visibility = 'hidden';
      this._ui.page3.style.visibility = 'hidden';
      this._ui.page4.style.visibility = 'hidden';
      this._ui.page5.style.visibility = 'hidden';
      this._ui.page6.style.visibility = 'hidden';
      this._ui.page7.style.visibility = 'hidden';
      this._ui.page8.style.visibility = 'hidden';
      this._ui.page9.style.visibility = 'hidden';
      //this._ui.enterGame.style.visibility = 'hidden';
      this._ui.aboutGame.style.visibility = 'hidden';
      //this._ui.clickMe.style.visibility = 'hidden';
    }
    
    _OnQuestsClicked(msg) {
      const visibility = this._ui.quests.style.visibility;
      this._HideUI();
      this._ui.quests.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnPLCClicked(msg) {
      const visibility = this._ui.plc.style.visibility;
      this._HideUI();
      this._ui.plc.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnPLCL2Clicked(msg) {
      const visibility = this._ui.plcL2.style.visibility;
      this._HideUI();
      this._ui.plcL2.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnPLCL3Clicked(msg) {
      const visibility = this._ui.plcL3.style.visibility;
      this._HideUI();
      this._ui.plcL3.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnPLCL4Clicked(msg) {
      const visibility = this._ui.plcL4.style.visibility;
      this._HideUI();
      this._ui.plcL4.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnStatsClicked(msg) {
      const visibility = this._ui.stats.style.visibility;
      this._HideUI();
      this._ui.stats.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnInfoClicked(msg) {
      const visibility = this._ui.infoScreen.style.visibility;
      this._ui.clickMe.style.visibility = 'hidden';
      this._HideUI();
      this._ui.infoScreen.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnPage1Clicked(msg) {
      const visibility = this._ui.page1.style.visibility;
      //this._HideUI();
      this._ui.page1.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnPage2Clicked(msg) {
      const visibility = this._ui.page2.style.visibility;
      //this._HideUI();
      this._ui.page2.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnPage3Clicked(msg) {
      const visibility = this._ui.page3.style.visibility;
      //this._HideUI();
      this._ui.page3.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnPage4Clicked(msg) {
      const visibility = this._ui.page4.style.visibility;
      //this._HideUI();
      this._ui.page4.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnPage5Clicked(msg) {
      const visibility = this._ui.page5.style.visibility;
      //this._HideUI();
      this._ui.page5.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnPage6Clicked(msg) {
      const visibility = this._ui.page6.style.visibility;
      //this._HideUI();
      this._ui.page6.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnPage7Clicked(msg) {
      const visibility = this._ui.page7.style.visibility;
      //this._HideUI();
      this._ui.page7.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnPage8Clicked(msg) {
      const visibility = this._ui.page8.style.visibility;
      //this._HideUI();
      this._ui.page8.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnPage9Clicked(msg) {
      const visibility = this._ui.page9.style.visibility;
      //this._HideUI();
      this._ui.page9.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnEnterGameClicked(msg) {
      const visibility = this._ui.enterGame.style.visibility;
      this._HideUI();
      this._ui.enterGame.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnAboutGameClicked(msg) {
      const visibility = this._ui.aboutGame.style.visibility;
      this._HideUI();
      this._ui.aboutGame.style.visibility = (visibility ? '' : 'hidden');
    }

    _OnInventoryClicked(msg) {
      const visibility = this._ui.inventory.style.visibility;
      this._HideUI();
      this._ui.inventory.style.visibility = (visibility ? '' : 'hidden');
    }

    Update(timeInSeconds) {
    }
  };

  return {
    UIController: UIController,
  };

})();