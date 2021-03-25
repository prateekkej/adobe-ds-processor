async function process (lookup, data, config) {
  let newDate
  const {
    enabled,
    dateRegex,
    useDefaultJSParser = false,
    dateSequence
  } = config
  if (enabled) {
    const lookupMap = lookup.data
    const dateColumn = lookupMap.find(temp => temp.adobeAnalyticsHeader === 'Date')
    if (dateColumn.length === 0) { return data }
    const regex = new RegExp(dateRegex)
    const dateFormatSeq = dateSequence ? dateSequence.split(',') : undefined
    for (const row of data) {
      const date = row[dateColumn.rawDataColumn]
      if (useDefaultJSParser) {
        const tempDate = new Date(date)
        if (isNaN(tempDate)) {
          throw new Error(`Default JS Date parser encountered an unexpected value in column ${dateColumn.rawDataColumn} of input data. Skipping data for lookup ${lookup.name}.
        Please toggle useDefaultJSParser switch in the lookup file and update dateRegex and dateSequence for date-processor`)
        }
        newDate = `${tempDate.getMonth() + 1}/${tempDate.getDate()}/${tempDate.getFullYear()}`
      } else if (dateFormatSeq) {
        const splitDate = date.match(regex)
        const brokenDate = {}
        dateFormatSeq.forEach((v, i) => {
          if (splitDate) { brokenDate[v] = splitDate[i + 1] }
        })
        newDate = `${brokenDate.month}/${brokenDate.day}/${brokenDate.year}`
      }
      row[dateColumn.rawDataColumn] = newDate || row[dateColumn.rawDataColumn]
    }
  }
  return data
}

module.exports = {
  process,
  name: 'date-processor'
  // This name will be used in lookup file under processing pipeline

}
