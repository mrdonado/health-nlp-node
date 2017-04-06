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
          });
        return this;
      };
      this.connect = () => {
        return this;
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
          done();
        });
    });
});