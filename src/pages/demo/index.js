import entry, { loadingUntilFirstContentPaint } from 'entry'
import initReactFastclick from 'react-fastclick'
import React from 'react'
import Router from './router'
import store from './store'
import './styles/index.less'

console.log('React Version: ', React.version)
loadingUntilFirstContentPaint()
initReactFastclick()
entry(Router, {
  store
})
