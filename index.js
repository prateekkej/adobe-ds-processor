const { uploads, notifiers: notifiersConfiguration, flags } = require('./config.js')
const fileProcessor = require('./fileProcessor')
const uploader = require('./uploader')
const notifier = require('./notifier')

// Entry point to DS Automator
async function main () {
  notifier.configure(notifiersConfiguration)
  await fileProcessor.startProcessing(flags)
  if (uploads) {
    for (const uploadUser in uploads) {
      const uploaderDetail = uploads[uploadUser]
      if (uploaderDetail.enabled) {
        const res = await uploader.startUploadProcess(uploadUser, uploaderDetail, flags)
        notifier.notify(res, flags)
      }
    }
  }
  return 'Process Completed at ' + new Date()
}

main().then(console.log).catch(console.log)
