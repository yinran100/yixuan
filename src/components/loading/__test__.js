import loading from './index.js'

loading.show()

setTimeout(() => {
  loading.hide()

  setTimeout(() => {
    loading.show()
  }, 1500)
}, 2500)
