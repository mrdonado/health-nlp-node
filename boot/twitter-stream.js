/**
 * Given the twitter constructor (see module 'twitter') and the
 * configuration parameters, it returns a twitter client object,
 * that can be directly used to interact with the twitter API.
 * @param {function} Constructor obtained from the 'twitter'
 * module.
 * @param {Object} Configuration obtained from the ./boot/configuration.js module
 * @returns {Object} The client twitter instance
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
 * @param {string} data read from a file
 * @return {string[]} array containing the lines of data on each
 * element.
 */
const parseWords = (data) => {
  return data.toString().split('\n');
};

/**
 * It obtains longest word of the words array that is present
 * into the text.
 * @param {string} text
 * @param {string[]} words
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
 * It returns a processed version of the input message, in order
 * to ease the comparison between messages that are equivalent.
 * @param {string} _message
 * @returns {string} processed message
 */
const processedMessage = (_message) => {
  // Convert the message to lower case
  let message = _message.toLowerCase();
  // Remove any url
  message = message.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
  // Remove excess of spaces in between
  message = message.replace(/[\t\s]{2,}/g, ' ');
  // Trim
  message = message.trim();
  return message;
};

/**
 * It returns a boolean telling if an equivalent message to the
 * one passed by parameter is present into the given buffer.
 * @param {string[]} buffer with previous messages
 * @param {string} message to be compared
 * @returns {boolean} true when an equivalent message has been
 * found into the buffer
 */
const repeatedMessage = (buffer, message) => {
  return buffer.indexOf(processedMessage(message)) > -1;
};

/**
 * If the equivalent message to the message input is present
 * in the _buffer array, a copy of _buffer will be returned
 * where the equivalent message has been moved to the last
 * element.
 * @param {string[]} _buffer
 * @param {string} message
 * @returns {string[]} updated buffer
 */
const messageToTop = (_buffer, message) => {
  const pmessage = processedMessage(message);
  // If there is no equivalent message, the input buffer
  // is returned
  if (!repeatedMessage(_buffer, message)) {
    return _buffer;
  }
  let buffer = _buffer.slice(); // copy the buffer
  buffer.splice(buffer.indexOf(pmessage), 1);
  buffer.push(pmessage);
  return buffer;
};

/**
 * It returns a new updated buffer with a proccessed version of
 * the specified message on top of it. The maximum buffer size
 * will be of n messages.
 * If the specified buffer already has n elements, the oldest
 * one will be discarded.
 * @param {string[]} buffer
 * @param {number} desired maximum length
 * @returns {string[]} new buffer
 */
const updateBuffer = (_buffer, n, message) => {
  // Get a copy of the buffer with a max of n elements
  let buffer = _buffer.slice(Math.max(_buffer.length - n + 1, 0));
  // Add the message at the end and return
  buffer.push(processedMessage(message));
  return buffer;
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
  // A buffer will store the last messages in order to track
  // them and thus be able to avoid analyzing the same
  // message twice
  let buffer = [];
  return (event) => {
    const query = induceQuery(event.text, words);
    if (query === ''
      || event.lang !== 'en') {
      // Message not relevant. Finish here.
      return;
    } else if (repeatedMessage(buffer, event.text)) {
      // Repeated message. Probably spam. We update the buffer
      // with this message on the top.
      buffer = messageToTop(buffer, event.text);
      return;
    }
    buffer = updateBuffer(buffer, 1000, event.text);
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
  processedMessage,
  repeatedMessage,
  updateBuffer,
  messageToTop,
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
