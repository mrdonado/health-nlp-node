const mocha = require('mocha'),
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  mockRequire = require('mock-require');

chai.use(chaiHttp);

describe('App initialization ', () => {
  // We mock fivebeans, in order to test the connection with
  // beanstalkd without beanstalkd
  mockRequire('fivebeans', {
    client: function (host, port) {
      this.on = (event, cb) => {
        it('beanstalkd should expect a known event',
          () => {
            expect(['connect', 'error', 'close']).to.contain(event);
            expect(typeof cb).to.equal('function');
            expect(typeof cb()).to.equal('undefined');
          });
        return this;
      };
      this.connect = () => {
        return this;
      };
      this.use = (tube, cb) => {
        expect(tube).to.equal('default');
        expect(typeof cb).to.equal('function');
        expect(typeof cb()).to.equal('undefined');
      };
      return this;
    }
  });

  // With a mocked instance of fivebeans
  const app = require('../app');

  it('should create the app', (done) => {
    expect(app).to.be.defined;
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

  it('should not return an error message when the environment is not development',
    (done) => {
      app.set('env', 'production');
      chai.request(app)
        .get('/nonexistingroute')
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(typeof res.body.status).to.equal('undefined');
          expect(res.error.message).to.equal("cannot GET /nonexistingroute (404)");
          done();
        });
    });

});