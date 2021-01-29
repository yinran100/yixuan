
function metaToObj(content) {
  const parts = {}
  content.replace(/\s/g, '').split(',').forEach(token => {
    const [prop, val] = token.split('=')
    parts[prop] = val
  })
  return parts
}
// 手动设置viewport属性
export function setViewport(mode = {}) {
  typeof mode === 'string' && (mode = metaToObj(mode))
  let meta = [...document.querySelectorAll(`meta[name="viewport"]`)].pop() // 只取最后一个
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'viewport')
    document.head.appendChild(meta)
  }
  const content = meta.getAttribute('content') || '';

  const parts = {
    ...metaToObj(content),
    ...mode
  }
  meta.setAttribute('content', Object.entries(parts).map(token => token.join('=')).join(','));
}

// 判断是否支持某个css属性
export function isSuportCss(props) {
  return props in document.documentElement.style
}
