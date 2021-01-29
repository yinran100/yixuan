export default type => payload => {
  if (payload !== undefined) {
    return { type, payload }
  }
  return { type }
}
