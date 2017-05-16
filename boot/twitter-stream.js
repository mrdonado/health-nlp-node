const log = require('./logger');

const getTwitterClient = (Twitter, config) => {
  return new Twitter({
    consumer_key: config.twitter.consumerKey,
    consumer_secret: config.twitter.consumerSecret,
    access_token_key: config.twitter.accessTokenKey,
    access_token_secret: config.twitter.accessTokenSecret
  });
};

const parseWords = (data) => {
  return data.toString().split('\n');
};

const induceQuery = (text, words) => {
  return words.reduce((q, word) => {
    if (text.indexOf(word) > -1 && word.length > q) {
      return word;
    }
    return q;
  }, '');
};

const parseFile = (fs, wordsFileName) => {
  return new Promise((resolve, reject) => {
    fs.readFile(wordsFileName, (err, data) => {
      if (err) { return reject(err); }
      resolve(parseWords(data));
    });
  });
};

const dataCb = (beanstalkd, words) => {
  return (event) => {
    const query = induceQuery(event.text, words);
    if (query === '' || event.lang !== 'en') {
      return;
    }
    const job = {
      'user_name': event.user.screen_name,
      'user_description': event.user.description,
      'created_at': (new Date()).toISOString(),
      'message': event.text,
      'source': 'twitter',
      'query': query
    };
    beanstalkd.put(10, 1, 60, JSON.stringify(job),
      (err, jobid) => {
        //
      });
  };
};

const errorCb = function (error) {
  log.error('Twitter stream error:' + error.toString());
};

const startStream = (Twitter, beanstalkd, config) => {
  return (words) => {
    const client = getTwitterClient(Twitter, config);
    const stream = client.stream('statuses/filter', {
      track: words.join(',')
    });
    stream.on('data', dataCb(beanstalkd, words));
    stream.on('error', errorCb);
  };
};


module.exports = {
  runTwitterStream: (Twitter, beanstalkd, fs, config) => {
    parseFile(fs, './boot/twitter-query-words.txt')
      .then(startStream(Twitter, beanstalkd, config));
  },
  startStream,
  errorCb,
  dataCb,
  parseFile,
  induceQuery,
  parseWords,
  getTwitterClient
};
