const mocha = require('mocha'),
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  sinon = require('sinon'),
  logger = require('../boot/logger'),
  twitterStream = require('../boot/twitter-stream'),
  beanstalkd = require('../boot/beanstalkd');

chai.use(chaiHttp);

describe('App initialization ', () => {

  let app, sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    // Twitter stream and beanstalkd will be tested outside from here.
    // We don't want them to run while testing the app inialization
    sandbox.stub(twitterStream, 'runTwitterStream');
    sandbox.stub(beanstalkd, 'connect');
    sandbox.stub(logger, 'trace');
    sandbox.stub(logger, 'debug');
    sandbox.stub(logger, 'error');
    sandbox.stub(logger, 'warn');
    app = require('../app');
  });

  afterEach('stop mock requires', () => {
    beanstalkd.connect.restore();
    sandbox.restore();
  });

  it('should create the app and initialize subcomponents', (done) => {
    expect(app).to.be.ok;
    expect(twitterStream.runTwitterStream.called).to.be.ok;
    expect(beanstalkd.connect.called).to.be.ok;
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