const fs = require('fs')
const csvParser = require('csv-parser')
const validate = require('jsonschema').validate
const schema = JSON.parse(fs.readFileSync('./lookup-schema.json'))
const availableProcessors = require('./processors')
const utf8 = require('to-utf-8')

// Get All the lookups available
async function getLookups () {
  const dir = fs.readdirSync('./lookups')
  const jsons = dir.filter(x => x.endsWith('.json'))
  const lookups = {}
  for (const lookup of jsons) {
    const lookupJson = JSON.parse(fs.readFileSync('./lookups/' + lookup))
    if (validate(lookupJson, schema).errors.length > 0) { console.log('Error while validating lookup ', lookup); continue }
    if (lookupJson.enabled === false) continue
    const lookupName = lookupJson.meta ? lookupJson.meta.type : undefined
    if (!lookupName) {
      continue
    }
    const currentLookup = lookups[lookupName] = {}
    currentLookup.processors = lookupJson.processingPipeline
    currentLookup.data = lookupJson.lookup
    currentLookup.name = lookupName
  }
  return lookups
}

// Load data from storage
async function getData (lookupName) {
  const data = await new Promise((resolve, reject) => {
    const temp = []
    fs.createReadStream(`./data/data-${lookupName}.csv`)
      .pipe(utf8())
      .on('error', (err) => {
        console.error('Could not load data file for lookup - ' + lookupName)
        console.error('Error:' + err.message)
      })
      .pipe(csvParser({ quote: '"' }))
      .on('data', x => temp.push(x)).on('end', () => {
        resolve(temp)
      }).on('error', (err) => {
        console.error('Invalid data found for lookup - ' + lookupName)
        console.error('Error:' + err.message)
      })
  })
  return data
}

// Use Lookup to merge and map the data from data directory.
async function createAdobeDataSourceFormat (lookup, data) {
  const finalData = {}
  const lookupData = lookup.data
  lookupData.forEach(c => { finalData[c.adobeAnalyticsHeader] = [] })
  data.forEach(row => {
    for (const columnBlob of lookupData) {
      const column = columnBlob.rawDataColumn
      if (row[column]) {
        finalData[columnBlob.adobeAnalyticsHeader].push(row[column])
      } else {
        finalData[columnBlob.adobeAnalyticsHeader].push(columnBlob.default)
      }
    }
  })
  return { data: finalData, length: data.length }
}

// Merge All the processed data and output it to an uploadable template.
async function createTemplateFile (lookupName, processedData, rows) {
  const aaFinalHeaders = Object.keys(processedData)
  let fileData = ''
  aaFinalHeaders.forEach((v, i) => {
    fileData += v
    if (aaFinalHeaders[aaFinalHeaders.length - 1] === v) {
      fileData += '\n'
    } else {
      fileData += '\t'
    }
  })
  for (let i = 0; i < rows; i++) {
    for (const header of aaFinalHeaders) {
      fileData += processedData[header][i]
      if (aaFinalHeaders[aaFinalHeaders.length - 1] === header) {
        fileData += '\n'
      } else {
        fileData += '\t'
      }
    }
  }
  fs.writeFileSync(`./output/adobe-data-source-${lookupName}.txt`, fileData)
  fs.writeFileSync(`./output/adobe-data-source-${lookupName}.fin`, '')
}

// Driver function
async function main () {
  const lookups = await getLookups()
  for (const lookupName in lookups) {
    const lookup = lookups[lookupName]
    const data = await getData(lookupName)
    if (data) {
      const processors = lookup.processors
      let processedData = data
      let successfullyProcessed = true
      for (const processor of processors) {
        const processorName = processor.name
        if (availableProcessors[processorName] && availableProcessors[processorName].process && processor.enabled) {
          try {
            processedData = await availableProcessors[processorName].process(lookup, processedData, processor)
          } catch (exc) {
            console.log(exc)
            successfullyProcessed = false
            break
          }
        }
      }
      if (!successfullyProcessed) continue
      const { data: finalData, length: finalDataLength } = await createAdobeDataSourceFormat(lookup, processedData)
      createTemplateFile(lookupName, finalData, finalDataLength)
      console.log('Data Completed for ' + lookupName)
    }
  }
}

module.exports.startProcessing = main
