const mocha = require('mocha'),
  chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  chaiHttp = require('chai-http'),
  express = require('express'),
  bodyParser = require('body-parser'),
  index = require('../../routes/index');

chai.use(chaiHttp);

const log = { trace: sinon.stub(), debug: sinon.stub(), info: sinon.stub() };

// Initialize a new express app just for the test
const app = express();
app.use(bodyParser.json());
const router = express.Router();
app.use('/', index(router, log));

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