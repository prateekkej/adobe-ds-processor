const notifiers = require('./notifiers')

function notify (res) {
  for (const result in res) {
    sendNotification(res[result])
  }
}

function configure (config) {
  if (!config) { console.log('No notification receivers configured'); return }
  for (const notifier in notifiers) {
    notifiers[notifier].configure(config)
  }
}

function sendNotification (message) {
  for (const notifier in notifiers) {
    notifiers[notifier].sendNotification(message)
  }
}
module.exports = {
  notify,
  configure
}
