import React, { Suspense, lazy } from 'react'
import { Route, Switch, HashRouter, Redirect } from 'react-router-dom'
import { InKeLoading } from 'components/loading/Loading'
import AnimationRouter from 'components/AnimationRouter'
import { AliveScope } from 'react-activation'
import { checkParmas } from 'utils/fixUtils'

import Home from '../views/Home'
const Motion = lazy(() => import('../views/Motion'))
const ReactHooks = lazy(() => import('../views/ReactHooks'))
// const Mobile = lazy(() => import('../views/Mobile'))
const Mobile = lazy(async () => {
  await new Promise(resolve => setTimeout(resolve, 200))
  return import('../views/Mobile')
})

export const routePaths = {
  HOME: '/',
  MOTION: '/motion',
  HOOKS: '/hooks',
  MOBILE: '/mobile'
}

const keyParmas = ['uid', 'sid'] // 页面必需的参数，没有就不传，可以是字符串，也可以是数组
const render = props => {
  // checkParmas(keyParmas)
  return <AnimationRouter {...props} fallback={<InKeLoading animateName='ball-scale' isStop={true} visible={true}/>}>
    <Route exact path={routePaths.HOME} render={props => <Home {...props}/>} />
    <Route exact path={routePaths.MOTION} render={props => <Motion {...props}/>} />
    <Route exact path={routePaths.HOOKS} render={props => <ReactHooks {...props}/>} />
    <Route exact path={routePaths.MOBILE} render={props => <Mobile {...props}/>} />
    <Redirect to={routePaths.HOME} />
  </AnimationRouter>
}

const appRouter = _ => <HashRouter hashType="noslash">
  <AliveScope>
    <Route path="/" render={render}/>
  </AliveScope>
</HashRouter>
export default appRouter
