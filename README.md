# Promise To File Web

### Overview

Web frontend for informing CH that a company with an overdue filing is still required and to
temporarily stop the company from being closed.

### Requirements

In order to run the service locally you will need the following:

- [NodeJS](https://nodejs.org/en/)
- [Git](https://git-scm.com/downloads)

### Getting started

To build the service:

1. Navigate to the `promise-to-file-web` directory and run make
2. Locally: [Run Vagrant](https://companieshouse.atlassian.net/wiki/spaces/DEV/pages/73269545/New+Starter+Guide+-+Setting+up+CHS)
3. Locally: Run `vagrant ssh chs-kafka -c "cd /vagrant; ./scripts/build_kafka.sh" -- -n`
4. In Vagrant: Run:
   - `ubic start chs.core`
   - `ubic start chs.email`
   - `ubic start chs.chips`
   - `ubic start chs.filing-web.promise-to-file-api`
   - `ubic start chs.filing-web.promise-to-file-web`
5. In Browser: `http://web.chs-dev.internal:4000/company-required/`

These instructions are for a local vagrant environment

### Config variables


Key             | Example Value   | Description
----------------|---------------- |------------------------------------
CDN_HOST | //$CDN_HOST | Path to CH styling for frontend
LOG_LEVEL | debug |
HTTP_LOG_FORMAT | dev | 
COMPANY_STILL_REQUIRED_FEATURE_FLAG | true | Temporary feature flag
SHOW_SERVICE_UNAVAILABLE_PAGE | off | Used to inform user when site is undergoing a fix


### Further Information
For further information on running building and testing ch node js apps see the [Node Web Starter](https://github.com/companieshouse/node-web-starter/blob/master/README.md) page.

### Setting up Githooks

Run `make githooks` to configure your local project clone to use the hooks located in the `.githooks` directory.
