const mocha = require('mocha'),
  chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  beanstalkd = require('../../boot/beanstalkd');

describe('beanstalkd connection setup', () => {
  const config = {
    beanstalkd: {
      port: 11300,
      host: 'localhost'
    }
  }; // Example configuration
  it('should create a new instance, setup the callbacks and start the connection', () => {
    const log = sinon.stub();
    let cbEvents = [];
    const fivebeans = {
      client: function (host, port) {
      }
    }

    fivebeans.client.prototype.connect = () => { };

    fivebeans.client.prototype.on = function (event, cb) {
      cbEvents.push(event);
      return this;
    }

    const bt = beanstalkd.connect(fivebeans, config, log);
    expect(bt).to.be.ok;
    expect(cbEvents[0]).to.eql('connect');
    expect(cbEvents[1]).to.eql('error');
    expect(cbEvents[2]).to.eql('close');
  });

  it('should connect to the default pipe and log it', () => {
    let pipe;
    const _beanstalkd = {
      use: (_pipe, cb) => {
        pipe = _pipe;
        cb();
      }
    };
    const log = { info: sinon.stub() };
    beanstalkd.onConnect(_beanstalkd, config, log)();
    expect(log.info.args[0][0]).to.contain('Connected to beanstalkd');
    expect(pipe).to.eql('default');
  });

  it('should log an error when no connection could be established', () => {
    const log = { error: sinon.stub() };
    beanstalkd.onError(config, log)();
    expect(log.error.args[0][0]).to.contain('Error while connecting');
  });

  it('should log when the connecction has been closed', () => {
    const log = {info: sinon.stub()};
    beanstalkd.onClose(config, log)();
    expect(log.info.args[0][0]).to.contain('Connection to beanstalkd closed');
  });

});