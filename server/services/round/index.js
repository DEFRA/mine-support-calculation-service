function round (value, precision) {
  return Number(Math.round(value + `e${precision}`) + `e-${precision}`)
}

module.exports = round
