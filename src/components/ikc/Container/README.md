## Container

> 这是一个解决H5页面铺满手机浏览器视图和fixed定位有问题的综合组件，包含两个子组件（固定视图容器`FixedContainer`和固定挂件容器`FixedWidget`）,**必须作为`Container`的子元素使用**

## Problem

手机浏览器的视图往往会因为顶部地址栏或底部工具栏挡住视图,出现`fixed`定位的元素会被遮挡住的问题；
或者，由于`fixed`定位的元素所在节点的原因，会被其他元素挡住；
再或者，由于浏览器的随意拖拽，导致`fixed`定位的元素被遮挡；
<!-- iphoneX等全面屏，需要留出安全区域，写法麻烦 -->

## Solution

- 将`document.body`的`overflow`设置为`hidden`,并只允许容器内部可Y轴滚动；
- 阻止`html`和`body`的垂直拖拽手势，即`touch-action: pan-x`
- 禁止页面缩放操作，减少对页面布局展示的影响
- 设置容器高度为浏览器窗口内部高度，并监听`resize`事件，保持容器高度始终铺满；
- 容器采用`flex`布局，固定视图占据固定高度，剩余空间分配给其他子元素，底部自动适配iphoneX
- 定挂件容器采用绝对定位`position: absolute`， 可自定义其位置

## Usage

页面所有内容都放在该容器内部：

```js
import { Container } from 'ikc'

const { FixedWidget, FixedContainer } = Container
const Page = () => (
  <Container>
    <div>hello, world!</div>
    <FixedWidget top={160} left={0}>
      <div >我的</div>
    </FixedWidget>
    <FixedContainer mode='bottom'>
      <div>底部</div>
    </FixedContainer>
  </Container>
)
```
