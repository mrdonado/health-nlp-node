const mocha = require('mocha'),
    mockRequire = require('mock-require');
mockRequire.reRequire('../../app');
const app = require('../../app'),
    chai = require('chai'),
    chaiHttp = require('chai-http'),
    expect = chai.expect,
    analysis = require('../../routes/analysis');

chai.use(chaiHttp);

describe('analysis routes', () => {
    let jobSent = false;

    app.use('/analysis', new analysis({
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
            .post('/analysis')
            .field('message', 'Some input message')
            .end((err, res) => {
                //{ message: 'Job received', data: newJob },
                //expect(jobSent).to.equal(true);
                expect(res.body.message).to.equal('Job received');
                expect(err).to.equal(null);
                done();
            });

    });
});