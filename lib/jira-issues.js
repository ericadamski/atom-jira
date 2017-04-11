'use babel';

import JiraIssuesView from './jira-issues-view';
import { CompositeDisposable } from 'atom';

export default {

  config: {
    'email': {
        type: 'string',
        title: 'Email',
        default: 'email',
        description: 'Your email used to access JIRA',
    },
    'password': {
        type: 'string',
        title: 'Password',
        default: 'password',
        description: 'Your passwod used to access JIRA',
    },
    'uri': {
        type: 'string',
        title: 'JIRA host',
        description: 'Your JIRA url',
        default: 'https://<host>.atlassian.net',
    },
  },

  jiraIssuesView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.jiraIssuesView = new JiraIssuesView(state.jiraIssuesViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.jiraIssuesView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'jira-issues:whoami': () => this.whoami(),
      'jira-issues:create': () => this.create(),
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.jiraIssuesView.destroy();
  },

  serialize() {
    return {
      jiraIssuesViewState: this.jiraIssuesView.serialize()
    };
  },

  toggle() {
    console.log('JiraIssues was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  },

  whoami() {
      this.toggle();
  },

  create() {
      this.modalPanel.show();
      this.jiraIssuesView.show();
  },

};
