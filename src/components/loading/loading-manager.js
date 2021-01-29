export default class LoadingManager {
  _queue = []

  show () {
    this._queue.push(1)
  }

  hide () {
    this._queue.pop()
  }

  clearQueue () {
    for (let i = 0; i < this._queue.length; i++) {
      this._queue.pop()
    }
  }

  get isQueueClear () {
    return this._queue.length === 0
  }
}
