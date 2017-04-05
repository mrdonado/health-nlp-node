const mocha = require('mocha'),
    expect = require('chai').expect,
    mockRequire = require('mock-require');


describe('App initialization ', () => {
    // We mock fivebeans, in order to test the connectivity with
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
});