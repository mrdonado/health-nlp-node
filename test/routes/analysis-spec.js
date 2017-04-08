const mocha = require('mocha'),
    chai = require('chai'),
    chaiHttp = require('chai-http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    expect = chai.expect,
    analysis = require('../../routes/analysis');

chai.use(chaiHttp);

// Initialize a new express app just for the test
app = express();
app.use(bodyParser.json());

describe('analysis routes', () => {
    let jobSent = false;

    app.use('/testanalysis', analysis({
        put: function (a, b, c, jsonString, cb) {
            let json = JSON.parse(jsonString);
            expect(json.message).to.equal('Some input message');
            jobSent = true;
            cb();
        }
    }));

    it('should put the received job into the beanstalkd queue', (done) => {
        let newJob = {
            message: 'Some input message'
        };
        chai.request(app)
            .post('/testanalysis')
            .send(newJob)
            .end((err, res) => {
                expect(res.body.data.message).to.equal(newJob.message);
                expect(jobSent).to.equal(true);
                expect(res.body.message).to.equal('Job received');
                expect(err).to.equal(null);
                done();
            });

    });
});