const fs = require('fs')
const processorFileNames = fs.readdirSync('./processors')

const processors = {
}

processorFileNames.forEach(x => {
  if (!x.includes('index')) {
    const processor = require('./' + x)
    processors[processor.name] = processor
  }
})

module.exports = processors
