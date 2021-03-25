module.exports = {
  uploads: {
    USER_1: {
      host: 'ftp.omniture.com',
      password: 'PASSWORD',
      enabled: false,
      lookups: ['LOOKUP-TYPE-FROM-LOOKUP.JSON']
    }
  },
  notifiers: {
    slack: {
      channelURL: ['https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXX/XXXXXXXXX']
    }
  },
  flags: {
    deleteAfterUpload: false
  }
}
