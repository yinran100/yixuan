console.warn('[boc.react]: `src/entry/service-hoc`中相关变量已经迁移, 请移步到`decorator/service`中和`decorator/service-assister`中直接引入对应变量')

export {
  requestFailErrMsg,
  noNetworkErrMsg,
  getErrorMsg,
  requestOptsWrapper,
  setAtomParamsWapper,
  inkeLoginApiWrapper,
  inkeLoginApiWrapperNoTransfrom
} from '@decorator/service-assister';

export {
  messageDeocator,
  messageDecorate,
  messageDecorator,
  activityDecorator,
} from 'decorator/service'
