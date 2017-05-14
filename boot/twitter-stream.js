const dotenv = require('dotenv');
dotenv.load();

const config = require('./configuration'),
  fs = require('fs'),
  Twitter = require('twitter');

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

const parseFile = (wordsFileName) => {
  return new Promise((resolve, reject) => {
    fs.readFile(wordsFileName, (err, data) => {
      if (err) { return reject(err); }
      resolve(parseWords(data));
    })
  });
};

const dataCb = (words) => {
  return (event) => {
    const query = induceQuery(event.text, words);
    const job = {
      'user_name': event.user.screen_name,
      'user_description': event.user.description,
      'created_at': (new Date()).toISOString(),
      'message': event.text,
      'source': 'twitter',
      'query': query
    };
    console.log(JSON.stringify(job));
    //beanstalkd.put(0, 0, 60, JSON.stringify(job));
  }
};

const errorCb = function (error) {
  throw error;
};

const startStream = (words) => {
  const client = getTwitterClient(Twitter, config);
  const stream = client.stream('statuses/filter', {
    track: words.join(',')
  });
  stream.on('data', dataCb(words));
  stream.on('error', errorCb);
};

parseFile('./boot/twitter-query-words.txt')
  .then(startStream);
