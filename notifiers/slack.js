const axios = require('axios').default
const configuration = { }

module.exports.info = {
  name: 'Slack Notification',
  version: 1.1,
  description: 'this extension will allow notification engine to send notifications to slack api.',
  identifier: 'slack'
}

module.exports.configure = function (config) {
  if (config.slack) {
    const channelURL = config.slack.channelURL
    configuration.channelURL = channelURL
    return true
  } else {
    return false
  }
}

module.exports.sendNotification = function (message) {
  const slackMessage = basicMessage(message)
  if (configuration.channelURL && Object.getPrototypeOf(configuration.channelURL) === Array.prototype) {
    configuration.channelURL.forEach(
      channelURL => {
        axios.post(channelURL, slackMessage, { headers: { 'content-type': 'application/json' } }).catch(response=>{
          console.error(response.message)})
      }
    )
  }
}

const basicMessage = function (message) {
  return {
    blocks: [
      {
        type: 'divider'
      }, {
        type: 'context',
        elements: [

          {
            type: 'mrkdwn',
            text: `File Name : *${message.fileName}*`
          }
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Status : *${message.status}*`
          }
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `At : ${message.ts}`
          }
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: 'Powered by *_Data Source Automator_*'
          }
        ]
      }
    ]
  }
}
