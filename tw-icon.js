'use strict'

const isClassNameAttribute = attr =>
  attr && attr.name && attr.name.name === 'className'

module.exports = (file, api, options) => {
  const j = api.jscodeshift
  const code = j(file.source)

  code
    .findJSXElements(x => x === 'span' || x === 'i')
    .forEach(function(path) {
      const node = path.value
      const open = node.openingElement
      const className = open.attributes.filter(isClassNameAttribute)[0]
      if (!className) return
      if (!className.value) return
      if (className.value.type.toString() !== 'Literal') return
      if (!className.value.value) return
      if (node.children && node.children.length) return
      const match = className.value.value.match(/^tw-icon-(\S+)/)
      if (!match) return
      open.name.name = 'Icon'
      className.name.name = 'name'
      className.value.value = match[1]
      open.selfClosing = true
      node.closingElement = null
      node.children = []
    })

  const replacedSource = code.toSource()
  return replacedSource
}
