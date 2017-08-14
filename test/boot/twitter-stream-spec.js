const mocha = require('mocha'),
  chai = require('chai'),
  sinon = require('sinon'),
  twitterStream = require('../../boot/twitter-stream'),
  log4js = require('log4js'),
  expect = chai.expect;


describe('twitter stream components', () => {

  it('should create the twitter client', () => {
    const Twitter = sinon.stub();
    const config = {
      twitter: {
        consumerKey: 'ck',
        consumerSecret: 'cs',
        accessTokenKey: 'atk',
        accessTokenSecret: 'ats'
      }
    };
    twitterStream.getTwitterClient(Twitter, config);
    expect(Twitter.args[0][0]).to.eql({
      consumer_key: 'ck',
      consumer_secret: 'cs',
      access_token_key: 'atk',
      access_token_secret: 'ats'
    });
  });

  it('should parse the words', () => {
    const words = twitterStream.parseWords('word1\nword2');
    expect(words).to.eql(['word1', 'word2'])
  });

  it('should induce a query', () => {
    const query1 = twitterStream
      .induceQuery('some example text',
      ['word1', 'word2', 'example']);

    expect(query1).to.eql('example');

    const query2 = twitterStream
      .induceQuery('some example text',
      ['word1', 'text', 'example']);

    expect(query2).to.eql('example');

    const query3 = twitterStream
      .induceQuery('some example text',
      ['word1', 'word2', 'word3']);

    expect(query3).to.eql('');

  });

  it('should parse a file', (done) => {
    const fs = {
      readFile: (filename, cb) => {
        cb(null, 'some data');
      }
    }
    twitterStream
      .parseFile(fs, 'somefile.txt')
      .then((data) => {
        expect(data).to.deep.equal(['some data']);
        done();
      });
  });

  it('should insert a job into the beanstalkd', () => {
    const beanstalkd = { put: sinon.stub() };
    words = ['test1', 'test2', 'test3'],
      demoEvent = {
        text: 'Some test1 to rule the world',
        lang: 'en',
        user: {
          screen_name: 'fakeuser4you',
          description: 'this is a real fake user'
        }
      },
      expectedJob = {
        user_name: 'fakeuser4you',
        user_description: 'this is a real fake user',
        message: 'Some test1 to rule the world',
        source: 'twitter',
        query: 'test1'
      };
    twitterStream.dataCb(beanstalkd, words)(demoEvent);
    expect(beanstalkd.put.args[0][0]).to.eql(10);
    expect(beanstalkd.put.args[0][1]).to.eql(1);
    expect(beanstalkd.put.args[0][2]).to.eql(1);
    let receivedJob = JSON.parse(beanstalkd.put.args[0][3]);
    delete receivedJob.created_at;
    expect(receivedJob).to.eql(expectedJob);

  });

  it('should insert no job into the queue when the language is not English or no query has been identified', () => {
    const event = {
      text: 'Some random text not containing any word from the list.',
      lang: 'en'
    },
      beanstalkd = { put: sinon.stub() },
      words = ['word1', 'word2'],
      dataCb = twitterStream.dataCb(beanstalkd, words);

    dataCb(event);
    event.text = 'Some text containing word1 from the list';
    event.lang = 'cn';
    twitterStream.dataCb(beanstalkd, words)(event);
    // No event should create a new job
    expect(beanstalkd.put.callCount).to.eql(0);
  });

  it('should not process the same message twice', () => {
    const event = {
      text: 'A message containing word1',
      lang: 'en',
      user: {
        description: 'your worst enemy',
        screen_name: 'who cares'
      }
    },
      beanstalkd = { put: sinon.stub() },
      words = ['word1', 'word2'],
      dataCb = twitterStream.dataCb(beanstalkd, words);
    dataCb(event);
    event.text = 'A MESSAGE containing word1  ';
    dataCb(event);
    event.text = 'A MESSAGE containing word1 http://someurl.com/asdfa ';
    dataCb(event);
    event.text = '   A     https://asdfasdf.asdf/asdfasdf MESSAGE CONTAINING    word1 http://asdfafsdf/fssfd    ';
    dataCb(event);
    // Only one job should be created.
    expect(beanstalkd.put.callCount).to.eql(1);
  });

  it('should try to parse a file that doesn\'t exist', (done) => {
    const fs = {
      readFile: (filename, cb) => {
        cb('not found', null);
      }
    }
    twitterStream
      .parseFile(fs, 'somefile.txt')
      .then((data) => {
        console.warn(data);
      })
      .catch((err) => {
        expect(err.message).to.equal('not found');
        done();
      });
  });

  it('should log an error', () => {
    const log = { error: sinon.stub() };
    twitterStream.errorCb(log)('Some error');
    expect(log.error.args[0]).to.match(/Twitter stream error/);
  });

  it('should start a stream', () => {
    let mode = '';
    let config = {};
    const Twitter = function () { };
    Twitter.prototype.stream = function (_mode, _config) {
      mode = _mode;
      config = _config;
      return { on: () => { } };
    }

    twitterStream.startStream(Twitter, null, { twitter: {} }, null)(['word1', 'word2']);
    expect(mode).to.eql('statuses/filter');
    expect(config).to.eql({
//      filter_level: 'low',
      language: 'en',
      track: 'word1,word2'
    });
  });

  it('should start the twitter stream', () => {
    const parseFileStub = sinon
      .stub(twitterStream, 'parseFile')
      .returns({
        then: () => { }
      });
    twitterStream.runTwitterStream(null, null, null, null, null);
    expect(parseFileStub.args[0][1]).to.contain('twitter-query-words.txt');
  });

  it('should process messages removing urls and setting them to lowercase for later comparison', () => {
    expect(twitterStream
      .processedMessage('Some MESSAGE '))
      .to.eql('some message');
    expect(twitterStream
      .processedMessage('message with url http://www.google.com/asfd in between'))
      .to.eql('message with url in between');
  });

  it('should identify when a specified message already has an equivalent one into the buffer', () => {
    expect(twitterStream
      .repeatedMessage(['sdafsafd', 'some message'], 'some MESSAGE'))
      .to.be.ok;

    expect(twitterStream
      .repeatedMessage(['sdafsafd', 'some message'], 'some https://asdfasdf.fdsf/asdfa MESSAGE'))
      .to.be.ok;

    expect(twitterStream
      .repeatedMessage(['sdafsafd', 'bla bla bla'], 'some https://asdfasdf.fdsf/asdfa MESSAGE'))
      .not.to.be.ok;
  });

  it('should extend the buffer to a maximum of n elements',
    () => {
      expect(twitterStream
        .updateBuffer(['asdf', 'asdf2', 'asdf3'], 3, 'some message')).to.eql(['asdf2', 'asdf3', 'some message']);

      expect(twitterStream
        .updateBuffer([], 3, 'some message')).to.eql(['some message']);
    });

  it('should move the equivalent message in the buffer to the last position', () => {
    const buffer = ['some message', 'other message', 'a new message here'];
    expect(twitterStream
      .messageToTop(buffer, ' some  MESSAGE'))
      .to.eql(['other message', 'a new message here', 'some message']);
    expect(twitterStream
      .messageToTop(buffer, 'unrelated message'))
      .to.eql(buffer);
  });


});