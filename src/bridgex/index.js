import { bridgeLegacy, bridgeCore } from 'ik-bridgex'
import bridgeCoreMock from './mocks/bridge-core-mock'
import bridgeLegacyMock from './mocks/bridge-legacy-mock'
import * as actions from './actions'
import * as links from './links'
import utils from 'utils'

const { useBridgeCoreMock, setWVJBIFrameUrl } = bridgeCore
const { useBridgeLegacyMock } = bridgeLegacy

// 站外场景, 将WVJBIframeUrl清空, 不做bridge初始化
if (!utils.ua.isInke) {
  setWVJBIFrameUrl(null)
}

/* eslint-disable react-hooks/rules-of-hooks */
useBridgeCoreMock(bridgeCoreMock)
useBridgeLegacyMock(bridgeLegacyMock)
/* eslint-enable react-hooks/rules-of-hooks */

export {
  actions,
  links,
}

const bridgeX = {
  actions,
  links,
}

export default bridgeX
