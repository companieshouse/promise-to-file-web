# Promise To File Web

### Overview

Web frontend for informing CH that a company with an overdue filing is still required and to
temporarily stop the company from being closed.

### Requirements

In order to run the service locally you will need the following:

- [NodeJS](https://nodejs.org/en/)
- [Git](https://git-scm.com/downloads)
- [Docker](https://www.docker.com/)
- [Tilt](https://tilt.dev/)
- [Typescript](https://www.typescriptlang.org/)

## Running locally on Docker env

The only local development mode available, using development orchestrator service in [Docker CHS Development](https://github.com/companieshouse/docker-chs-development), that uses [tilt](https://tilt.dev/).

1. Clone [Docker CHS Development](https://github.com/companieshouse/docker-chs-development) and follow the steps in the README.
2. Run `./bin/chs-dev modules enable promise-to-file`
3. Run `./bin/chs-dev development enable promise-to-file-web` (this will allow you to make changes in real time).
4. Run docker using `tilt up` in the docker-chs-development directory.
5. Use spacebar in the command line to open tilt window - wait for promise-to-file-web to become green.(If you have credential errors then  you may not be logged into `eu-west-2`.)
6. Open your browser and go to page <http://chs.local/company-required/>

Environment variables used to configure this service in docker are located in the file `services/modules/promise-to-file/promise-to-file-web.docker-compose.yaml`

### Requirements

1. node v18 (Concourse pipeline builds using Node 18 and live runs on Node 18)
2. npm 8.6
3. Docker

### Build and Test changes

1. To compile the project use `make build`
2. To test the project use `make test`
3. or `make clean build test`

### To build the Docker container

Ensure that you are logged into the AWS eu-west-2 region:

`aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin 416670754337.dkr.ecr.eu-west-2.amazonaws.com`

and then run:

`DOCKER_BUILDKIT=0 docker build --build-arg SSH_PRIVATE_KEY="$(cat ~/.ssh/id_rsa)" --build-arg SSH_PRIVATE_KEY_PASSPHRASE -t 169942020521.dkr.ecr.eu-west-1.amazonaws.com/local/promise-to-file-web .`

### Endpoints

Method | Path | Description
--- | --- | ---
GET | `/company-required/` | Returns the landing page for promise to file

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
