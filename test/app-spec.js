const mocha = require('mocha'),
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  sinon = require('sinon'),
  logger = require('../boot/logger'),
  twitterStream = require('../boot/twitter-stream'),
  beanstalkd = require('../boot/beanstalkd'),
  mockRequire = require('mock-require');

chai.use(chaiHttp);
let app, sandbox;

before(() => {
  sandbox = sinon.sandbox.create();
  // Twitter stream and beanstalkd will be tested outside from here.
  // We don't want them to run while testing the app inialization
  sandbox.stub(twitterStream, 'runTwitterStream');
  sandbox.stub(beanstalkd, 'init');
  sandbox.stub(logger, 'trace');
  sandbox.stub(logger, 'debug');
  sandbox.stub(logger, 'error');
  sandbox.stub(logger, 'warn');
  app = require('../app');
});

after('stop mock requires', () => {
  sandbox.restore();
});

describe('App initialization ', () => {

  it('should create the app and initialize subcomponents', (done) => {
    expect(app).to.be.defined;
    expect(twitterStream.runTwitterStream.called).to.be.ok;
    expect(beanstalkd.init.called).to.be.ok;
    done();
  });

  it('should return an error when getting non existing routes',
    (done) => {
      chai.request(app)
        .get('/nonexistingroute')
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.status).to.equal(404);
          expect(res.error.message).to.equal("cannot GET /nonexistingroute (404)");
          done();
        });
    });

  it('should not return an error message when the environment is not development or test',
    (done) => {
      process.env.NODE_ENV = 'production';
      chai.request(app)
        .get('/nonexistingroute')
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(typeof res.body.status).to.equal('undefined');
          expect(res.error.message).to.equal("cannot GET /nonexistingroute (404)");
          process.env.NODE_ENV = 'test';
          done();
        });
    });

});