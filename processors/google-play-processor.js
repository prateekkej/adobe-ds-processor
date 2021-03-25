async function process (lookup, data, config) {
  if (config && config.enabled) {
    const finalData = {}
    data.forEach(x => {
      if (x['Transaction Type'].toLowerCase() === 'charge') {
        finalData[x.Description] = x
      }
    })
    data = []
    Object.values(finalData).forEach(x => data.push(x))
    return data
  } else {
    return data
  }
}

module.exports = {
  process,
  name: 'google-play-processor'
  // This name will be used in lookup file under processing pipeline

}
