const FTPClient = require('ftp')
const fs = require('fs')
const ignoreFiles = fs.readFileSync('./output/.ignore').toString().split('\n')

// Upload the file
function upload (fileName, fileData, ftpConnection) {
  return new Promise((resolve, reject) => {
    ftpConnection.put(fileData, fileName, (err) => {
      if (err) {
        fs.writeFileSync('./output/' + fileName + '.failed', 0)
        reject(err)
      } else {
        fs.writeFileSync('./output/' + fileName + '.complete', 1)
        console.log('Upload Completed for ' + fileName)
        resolve({ fileName, status: 'success', ts: new Date() })
      }
    })
  })
}

// Upload files one by one.
async function loopOverFiles (files, client, lookups, templateHeaders, flags) {
  const result = {}
  for (const fileName of files) {
    if (ignoreFiles === fileName || !lookups.find(x => fileName.includes(x))) { continue }
    const fileData = fs.readFileSync('./output/' + fileName)
    result[fileName] = await upload(fileName, fileData, client)
    if (flags && flags.deleteAfterUpload) {
      fs.unlinkSync('./output/' + fileName)
    }
    result[fileName].fileName = fileName
  }
  return result
}

// Create an FTP Client
function createClient (host, user, password) {
  const client = new FTPClient()
  client.connect({ host: host, password: password, user: user })
  client.on('error', (err) => {
    if (err.code === 530) {
      console.error('Error', err.message); console.log('program exited unsuccessfully')
    }
  })
  return client
}

// Driver Function
async function startUploadProcess (user, { host, password, lookups, templateHeaders }, flags) {
  let filesToUpload = fs.readdirSync('./output')
  filesToUpload = filesToUpload.filter(x => !x.endsWith('failed') && !x.endsWith('complete') && x !== '.ignore')
  filesToUpload = filesToUpload.sort((a, b) => a.endsWith('.txt') ? -1 : 0)
  const client = createClient(host, user, password)
  const result = await loopOverFiles(filesToUpload, client, lookups, templateHeaders, flags)
  client.logout((err) => {
    console.log(err || 'Success')
  })
  return result
}

module.exports = {
  startUploadProcess
}
