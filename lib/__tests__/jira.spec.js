import { expect } from 'chai';
import { List } from 'immutable';
import nock from 'nock';

import Jira from '../jira';

describe('jira', () => {
    let jira;
    const URI = 'https://mb3.atlassian.net';

    beforeEach(() =>
        jira = new Jira(URI, 'eric.adamski@mb3online.com', ''));

    afterEach(() => nock.cleanAll());

    it('should get my user information', async () => {
        // Arrange
        const data = {
            self: 'https://mb3.atlassian.net/rest/api/2/user?username=eric.adamski',
            key: 'eric.adamski',
            name: 'eric.adamski',
            emailAddress: 'eric.adamski@mb3online.com',
            avatarUrls: {
                '16x16': 'https://avatar-cdn.atlassian.com/7fd433e6bee2874faa3448bdcb7e8736?s=16&d=https%3A%2F%2Fmb3online.atlassian.net%2Fsecure%2Fuseravatar%3Fsize%3Dxsmall%26ownerId%3Deric.adamski%26avatarId%3D10600%26noRedirect%3Dtrue',
                '24x24': 'https://avatar-cdn.atlassian.com/7fd433e6bee2874faa3448bdcb7e8736?s=24&d=https%3A%2F%2Fmb3online.atlassian.net%2Fsecure%2Fuseravatar%3Fsize%3Dsmall%26ownerId%3Deric.adamski%26avatarId%3D10600%26noRedirect%3Dtrue',
                '32x32': 'https://avatar-cdn.atlassian.com/7fd433e6bee2874faa3448bdcb7e8736?s=32&d=https%3A%2F%2Fmb3online.atlassian.net%2Fsecure%2Fuseravatar%3Fsize%3Dmedium%26ownerId%3Deric.adamski%26avatarId%3D10600%26noRedirect%3Dtrue',
                '48x48': 'https://avatar-cdn.atlassian.com/7fd433e6bee2874faa3448bdcb7e8736?s=48&d=https%3A%2F%2Fmb3online.atlassian.net%2Fsecure%2Fuseravatar%3FownerId%3Deric.adamski%26avatarId%3D10600%26noRedirect%3Dtrue'
            },
            displayName: 'Eric Adamski',
            active: true,
            timeZone: 'Etc/GMT',
            locale: 'en_US',
            groups: { size: 1, items: [] },
            applicationRoles: { size: 1, items: [] },
            expand: 'groups,applicationRoles'
        };

        nock(URI)
            .get('/rest/api/2/myself')
            .reply(200, data);

        // Act
        const me = await jira.me();

        // Assert
        expect(me).to.not.be.empty;
        expect(me).to.contain.all.keys([
            'name',
            'emailAddress',
            'avatarUrls',
            'displayName',
        ]);
    });

    it('should get issue type information', async () => {
        // Arrange
        const data = {
            "expand": "projects",
            "projects": [
                {
                    "self": "https://mb3.atlassian.net/rest/api/2/project/10100",
                    "id": "10100",
                    "key": "PRNA",
                    "name": "ProjecName",
                    "avatarUrls": {},
                    "issuetypes": [
                        {
                            "self": "https://mb3.atlassian.net/rest/api/2/issuetype/10001",
                            "id": "10001",
                            "description": "A task that needs to be done.",
                            "iconUrl": "",
                            "name": "Task",
                            "subtask": false
                        },
                        {
                            "self": "https://mb3.atlassian.net/rest/api/2/issuetype/10002",
                            "id": "10002",
                            "description": "The sub-task of the issue",
                            "iconUrl": "",
                            "name": "Sub-task",
                            "subtask": true
                        },
                        {
                            "self": "https://mb3.atlassian.net/rest/api/2/issuetype/10000",
                            "id": "10000",
                            "description": "A user story. Created by JIRA Software - do not edit or delete.",
                            "iconUrl": "",
                            "name": "Story",
                            "subtask": false
                        },
                        {
                            "self": "https://mb3.atlassian.net/rest/api/2/issuetype/10003",
                            "id": "10003",
                            "description": "A problem which impairs or prevents the functions of the product.",
                            "iconUrl": "",
                            "name": "Bug",
                            "subtask": false
                        },
                        {
                            "self": "https://mb3.atlassian.net/rest/api/2/issuetype/10004",
                            "id": "10004",
                            "description": "A big user story that needs to be broken down. Created by JIRA Software - do not edit or delete.",
                            "iconUrl": "",
                            "name": "Epic",
                            "subtask": false
                        }
                    ]
                }
            ]
        };

        nock(URI)
            .get('/rest/api/2/issue/createmeta')
            .reply(200, data);

        // Act
        const projects = await jira.issueTypes();

        // Assert
        expect(projects).to.not.be.empty;
        expect(projects).to.be.instanceof(List);
        expect(new Set(projects.get(0)
            .get('issuetypes')
            .map(type => type.name))).to.deep.equal(new Set([
            'Epic',
            'Story',
            'Task',
            'Sub-Task',
            'Bug',
        ]));
    });

    it('should fail gracefully', async () => {
        // Arrange
        nock(URI)
            .get('/rest/api/2/myself')
            .reply(401);

        // Act
        const me = await jira.me();

        // Assert
        expect(me).to.not.be.empty;
        expect(me).to.have.keys([
            'status',
            'reason',
        ]);
    });
});
