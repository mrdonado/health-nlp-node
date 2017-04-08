const mocha = require('mocha'),
  chai = require('chai'),
  expect = chai.expect,
  chaiHttp = require('chai-http'),
  app = require('../../app');

chai.use(chaiHttp);

describe('index route', () => {
  it('GET / returns a JSON with a message of health-nlp-node', (done) => {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        expect(JSON.stringify(res.body))
          .to.equal(JSON.stringify({ message: 'health-nlp-node' }));
        done();
      });
  });
});