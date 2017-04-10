'use babel';

import fetch from 'isomorphic-fetch';
import { fromJS } from 'immutable';

function parse(response) {
    if (response.status >= 400)
        return {
            status: response.status,
            reason: response.statusText,
        };

    return response.json();
}

function request(base, path, auth, ...rest) {
    const options = {
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
        },
        ...rest,
    };

    return fetch(`${base}${path}`, options)
        .then(parse);
}

export default class Jira {
    constructor(uri, user, pass, projectKeys = []) {
        this.authorization = btoa(`${user}:${pass}`);
        this.uri = uri;
        this.projectKeys = projectKeys;
    }

    me() {
        const path = '/rest/api/2/myself';

        return request(this.uri, path, this.authorization);
    }

    createIssue(summary, description, type = 10000, project = 10100) {
        const path =;
        const body = {
            fields: {
                summary,
                description,
                project: { id: project },
                issuetype: { id: type },
            },
        };

        return request(this.uri, path, this.authorization, { body });
    }

    issueTypes() {
        const path = '/rest/api/2/issue/createmeta';

        return request(this.uri, path, this.authorization)
            .then(response => {
                const { projects } = response;

                this.projects = fromJS(projects)
                    .filter(project => {
                        if (this.projectKeys.length > 0)
                            return this.projectKeys.includes(project.get('key'));

                        return true;
                    });

                return this.projects;
            });
    }
}
