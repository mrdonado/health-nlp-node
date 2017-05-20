/**
 * Given the twitter constructor (see module 'twitter') and the
 * configuration parameters, it returns a twitter client object,
 * that can be directly used to interact with the twitter API.
 */
const getTwitterClient = (Twitter, config) => {
  return new Twitter({
    consumer_key: config.twitter.consumerKey,
    consumer_secret: config.twitter.consumerSecret,
    access_token_key: config.twitter.accessTokenKey,
    access_token_secret: config.twitter.accessTokenSecret
  });
};

/**
 * The words coming from a file are turned into an array
 * by splitting on every new line.
 */
const parseWords = (data) => {
  return data.toString().split('\n');
};

/**
 * It obtains longest word of the words array that is present
 * into the text.
 * @param text:string
 * @param words: string[]
 * @returns word:string the longest matching word or an empty
 * character if no match has been found.
 */
const induceQuery = (text, words) => {
  return words.reduce((q, word) => {
    if (text.indexOf(word) > -1 && word.length > q.length) {
      return word;
    }
    return q;
  }, '');
};

/**
 * Return a promise that resolves with the specified file's contents
 * when it has been successfully loaded.
 * 
 * The promise will be rejected if an exception happened while trying
 * to read the file.
 */
const parseFile = (fs, wordsFileName) => {
  return new Promise((resolve, reject) => {
    fs.readFile(wordsFileName, (err, data) => {
      if (err) { return reject(new Error(err)); }
      resolve(parseWords(data));
    });
  });
};

/**
 * Callback for the twitter stream when data are coming in.
 * 
 * This is a high order function. First configure it with an instance
 * of fivebeans' beanstalkd client and a list of words used as start
 * words.
 * 
 * A function will be returned that will be used as event callback
 * for incoming data.
 * 
 * The incoming data (message) will be sent to beanstalkd as a new
 * job for the analyzer.
 */
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
    beanstalkd.put(10, 1, 1, JSON.stringify(job),
      (err, jobid) => {
        //
      });
  };
};

/**
 * High order function. First call it with your logger, then it returns
 * a function that can be used as error callback for the twitter stream.
 */
const errorCb = (log) => {
  return (error) => {
    log.error('Twitter stream error:' + error.toString());
  };
};

const startStream = (Twitter, beanstalkd, config, log) => {
  return (words) => {
    const client = getTwitterClient(Twitter, config);
    const stream = client.stream('statuses/filter', {
      track: words.join(','),
      filter_level: 'low',
      language: 'en'
    });
    stream.on('data', dataCb(beanstalkd, words));
    stream.on('error', errorCb(log));
  };
};


module.exports = {
  startStream,
  errorCb,
  dataCb,
  parseFile,
  induceQuery,
  parseWords,
  getTwitterClient,
  runTwitterStream: function (Twitter, beanstalkd, fs, config, log) {
    this.parseFile(fs, './boot/twitter-query-words.txt')
      .then(this.startStream(Twitter, beanstalkd, config, log));
  }
};
