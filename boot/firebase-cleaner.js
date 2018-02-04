let app = null;

module.exports = (config, firebase) => ({
  clean: () => {
    // Connect to firebase
    if (app === null) {
      app = firebase.initializeApp(config.firebase.config);
    }
    app.auth().signInWithEmailAndPassword(config.firebase.user.email, config.firebase.user.password)
      .then((user) => {
        // Query: all messages older than 3 hours
        let ref = app.database().ref('/analysis'),
          now = Date.now(),
          cutoff = now - 3 * 60 * 60 * 1000,
          isoDate = (new Date(cutoff)).toISOString();
        // Remove old messages
        ref.orderByChild('created_at')
          .endAt(isoDate)
          .once('value', function (snap) {
            snap.forEach(child => {
              ref.child(child.key)
                .remove();
            });
          });
      })
      .catch((error) => {
        console.log('The user couldn\'t be authenticated.');
      });
  }
});