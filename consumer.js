
const { CounterSchema } = require('./Counter');

const listen = (subscriber, db) => {
  const Counter = db.model('Counter', CounterSchema);

  subscriber.on('message', async (channel, message) => {
    if (channel === '__keyevent@0__:expired') {
      try {
        const counter = await Counter.findOne({});
        if (counter) {
          await Counter.updateOne(
            {},
            { $inc: { count: 1 } }
          );
        } else {
          const newCounter = new Counter({
            count: 1
          });
          await newCounter.save();
        }
      } catch (error) {
        console.error('Error updating counter:', error);
      }
    }
  });

  subscriber.subscribe('__keyevent@0__:expired');
}

module.exports = listen;
