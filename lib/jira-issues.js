'use babel';

import JiraIssuesView from './jira-issues-view';
import { CompositeDisposable } from 'atom';
import Jira from './jira';

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

    this.jira = new Jira(
        atom.config.get('jira-issues.uri'),
        atom.config.get('jira-issues.email'),
        atom.config.get('jira-issues.password')
    );

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

  async create() {
      this.modalPanel.show();

      const project = await this.jiraIssuesView.getProject(this.jira);

      if (!project) return;

      const issueType = await this.jiraIssuesView.getIssueType(project);

      if (!issueType) return;

      const issue = await this.jiraIssuesView.getIssueInformation();

      this.modalPanel.hide();

      if (!issue) return;

      const response = await this.jira.createIssue(
          issue.summary,
          issue.description,
          issueType.id,
          project.id
      );

      console.log(response);

      const uri = atom.config.get('jira-issues.host');

      atom.notifications.addSuccess(
          `Issues ${response.keyy} cresated!`,
          { detail: `<a href="${uri}/browse/${response.key}">Visit ${response.key}</a>` }
      );
  },

  checkout() {
    //  ask from the issue number
    //  get the issue number from jira
    //  append the issue number to the bottom of the screen for reference
  },

  move() {
    //  using the current issue
    //  find all the possible transitions
    //  select one and apply it.
  }
};
