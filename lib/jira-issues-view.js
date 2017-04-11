'use babel';
import SelectListView from 'atom-select-list';
import { dom as $, render } from 'etch';

import Jira from './jira';

export default class JiraIssuesView {
  constructor(serializedState) {
    this.step = serializedState ? serializedState.step : 0;

    this.jira = new Jira(
        atom.config.get('jira-issues.uri'),
        atom.config.get('jira-issues.email'),
        atom.config.get('jira-issues.password')
    );

    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('jira-issues');

    this.projectSelect = this.buildProjectSelect();
    this.issuetypeSelect = this.buildIssueTypeSelect({});

    this.element.appendChild(this.projectSelect.element);
    this.element.appendChild(this.issuetypeSelect.element);

    this.next();
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {
      return { step: this.step };
  }

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  next(item) {
    switch(this.step) {
        case 1:
            this.issuetypeSelect.update({
                items: item.issuetypes || [],
                loadingMessage: null,
            });
            break;
        default:
            this.jira.issueTypes()
                .then(projects => {
                    this.step = 0;
                    this.projectSelect.focus();
                    this.projectSelect.update({
                        items: projects.toJS(),
                        loadingMessage: null
                    });
                });
            break;
    }

     this.step++;
  }

  show() {
      this.element.removeClass('hide');
  }

  hide() {
      this.step = 0;
      this.element.addClass('hide');
  }

  buildProjectSelect() {
    const list = new SelectListView({
        items: [],
        emptyMessage: 'No Projects Found.',
        loadingMessage: 'Loading Projects.',
        itemsClassList: ['jira-list-item', 'jira-project'],
        filterKeyForItem: item => item.name,
        elementForItem: item => {
            return render($.li({}, `${item.key} - ${item.name}`));
        },
        didConfirmSelection: item => this.next(item),
        didCancelSelection: () => this.hide(),
    });

    return list;
  }

  buildIssueTypeSelect(project) {
    const types = project.issuetypes || [];
    return new SelectListView({
        items: types,
        emptyMessage: 'No Issue Types Found.',
        itemsClassList: ['jira-list-item', 'jira-issue'],
        filterKeyForItem: item => item.name,
        elementForItem: item => {
            return render($.li(
                { },
                $.span(
                    {},
                    $.img({
                        className: 'jira-icon',
                        src: item.iconUrl,
                    })
                ),
                item.name
            ));
        },
        didConfirmSelection: item => {
            this.issuetype = item;
            this.element.innerHTML = '';
            console.log(this.buildIssueForm(project, item));
            this.element.appendChild(this.buildIssueForm(project, item));
            console.log('confirmed', item)
        },
        didCancelSelection: () => {
            // this.element.innerHTML = '';
            // console.log('cancelled')
            // this.destroy();
        }
    });
  }

  buildIssueForm(project, issuetype) {
      return render($.form(
          {
              className: 'jira-issue-form',
              onSubmit: event => {
                  this.jira.create(
                      this.summary.getText(),
                      this.description.getText(),
                      project.id,
                      issuetype.id)
                  .then(response => {
                      console.log(response);
                      const uri = atom.config.get('jira-issues.host');
                      atom.notifications.addSuccess(`Issues ${response.keyy} cresated!`, { detail: `<a href="${uri}/browse/${response.key}">Visit ${response.key}</a>` });
                  });
              },
          },
          $.div(
              {
                  className: 'jira-form-group',
                  ref: 'summary',
              },
              $.label('Title'),
              $.input({ type: 'text' })
          ),
          $.div(
              { className: 'jira-form-group' },
              $.label('Description'),
              $.textarea({ ref: 'description' })
          )
      ));
  }
}
