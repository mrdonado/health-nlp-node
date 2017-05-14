[![Build Status][travis-badge]][travis-badge-url]
[![Coverage Status][coveralls-badge]][coveralls-badge-url]
[![Dependency Status][david-badge]][david-badge-url]
[![devDependency Status][david-dev-badge]][david-dev-badge-url]

[travis-badge]: https://travis-ci.org/fjrd84/health-nlp-node.svg?branch=master
[travis-badge-url]: https://travis-ci.org/fjrd84/health-nlp-node
[coveralls-badge]: https://coveralls.io/repos/github/fjrd84/health-nlp-node/badge.svg?branch=master
[coveralls-badge-url]: https://coveralls.io/github/fjrd84/health-nlp-node?branch=master
[david-badge]: https://david-dm.org/fjrd84/health-nlp-node.svg
[david-badge-url]: https://david-dm.org/fjrd84/health-nlp-node
[david-dev-badge]: https://david-dm.org/fjrd84/health-nlp-node/dev-status.svg
[david-dev-badge-url]: https://david-dm.org/fjrd84/health-nlp-node?type=dev

# health-nlp-node

This repository contains the nodeJS/express based web server of the ***health-nlp*** project.

The ***health-nlp*** project is an NLP (Natural Language Processing) demo composed by the following repositories:

- [health-nlp-frontend](https://github.com/fjrd84/health-nlp-frontend): frontend part. It displays the results of the analysis (stored in firebase) and explains everything about the project. It is an Angular based web application.
- [health-nlp-node](https://github.com/fjrd84/health-nlp-node): nodeJS/express backend for the health-nlp-angular frontend. It takes new job requests and sends them to the beanstalkd job queue.
- [health-nlp-analysis](https://github.com/fjrd84/health-nlp-analysis) (this repository): it processes jobs from beanstalkd and sends the results to firebase. It is a Python project.

This project is still on an early stage of development. As soon as there's an online demo available, you'll find a link here.


## Get this thing running

This project contains a nodeJS/Express app that gets jobs via a REST API and inserts them into a beanstalkd queue.

### Beanstalkd and the analyzer

This project depends on beanstalkd and the health-nlp-analyzer. You can find more information about how to set up your environment and run such services on the [health-nlp-analysis's readme](https://github.com/fjrd84/health-nlp-analysis).

By default, we're using port `11300`, IP `127.0.0.1` and the default pipe on beanstalkd. You can change this in the `.env` file.

### NPM Dependencies

In order to install the dependencies, you can simply type `npm install`.

### Configuration

Rename the `example.env` file into `.env` and modify the default values according to your system configuration.

### Run it!

Once beanstalkd is running on your machine and the configuration is ready, you can type `npm start` to start the web server.

## Unit Tests and Coverage

You can run the tests by typing this on the console:

`npm test`

And you can generate the coverage report with:

`npm coverage`

## Docker

If you want to deploy this service inside Docker containers, you will find the `docker-compose.yml` file on the root directory of this repository.
