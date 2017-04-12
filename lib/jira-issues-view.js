'use babel';
import SelectListView from 'atom-select-list';
import { dom as $, render } from 'etch';

import Jira from './jira';

export default class JiraIssuesView {
  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('jira-issues');;
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  getProject(jira) {
    return new Promise(resolve => {
        const list = new SelectListView({
            items: [],
            emptyMessage: 'No Projects Found.',
            loadingMessage: 'Loading Projects.',
            itemsClassList: ['jira-list-item', 'jira-project'],
            filterKeyForItem: item => item.name,
            elementForItem: item => {
                return render($.li({}, `${item.key} - ${item.name}`));
            },
            didConfirmSelection: resolve,
            didCancelSelection: () => resolve(undefined),
        });

        this.element.appendChild(list.element);
        list.focus();

        jira.issueTypes()
            .then(projects => {
                list.update({
                    items: projects.toJS(),
                    loadingMessage: null,
                })
            })
    });
  }

  getIssueType(project) {
    const types = project ? project.issuetypes : [];
    return new Promise(resolve => {
        const list = new SelectListView({
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
            didConfirmSelection: resolve,
            didCancelSelection: () => resolve(undefined),
        });

        this.element.replaceChild(list.element, this.element.firstChild);
        list.focus();
    });
  }

  getIssueInformation() {
      return new Promise(resolve => {
          let summary, description;
          this.element.replaceChild(render($.form(
              {
                  className: 'jira-issue-form',
                  onSubmit: event => {
                      resolve({
                          summary: summary.summary.getText(),
                          description: description.description.getText(),
                      });
                  },
              },
              summary = $.div(
                  {
                      className: 'jira-form-group',
                      ref: 'summary',
                  },
                  $.label({ className: 'input-label' }, 'Title'),
                  $.input({ className: 'input-text', type: 'text' })
              ),
              description = $.div(
                  { className: 'jira-form-group' },
                  $.label({ className: 'input-label' }, 'Description'),
                  $.textarea({ className: 'input-textarea', ref: 'description' })
              ),
              $.div(
                  { className: 'jira-form-group' },
                  $.button({ className: 'btn btn-primary', type: 'submit' }, 'Submit')
              )
          )), this.element.firstChild);
      });
  }
}
