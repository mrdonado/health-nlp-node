const mocha = require('mocha'),
  chai = require('chai'),
  expect = chai.expect,
  chaiHttp = require('chai-http'),
  express = require('express'),
  bodyParser = require('body-parser'),
  index = require('../../routes/index');

chai.use(chaiHttp);

// Initialize a new express app just for the test
app = express();
app.use(bodyParser.json());
app.use('/', index);

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