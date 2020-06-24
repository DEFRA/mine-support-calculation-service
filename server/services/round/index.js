function round (value, precision) {
  const raw = Math.round(value + `e${precision}`) + `e-${precision}`
  return Number(raw)
}

module.exports = round
