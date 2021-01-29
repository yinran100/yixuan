import entry, { loadingUntilFirstContentPaint } from 'entry'
import initReactFastclick from 'react-fastclick'
import React from 'react'
import Router from '@/demo/router'
import store from '@/demo/store'
import $log from 'utils/log'
import '@/demo/styles/index.less'

console.log('React Version: ', React.version)

loadingUntilFirstContentPaint()
$log.setBaseOptions({
  inkewid: 'ik_h5_react_demo',
  inkewname: 'inke_bpc_template_demo'
});
initReactFastclick()
entry(Router, {
  store
})
