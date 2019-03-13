'use strict'

const isClassNameAttribute = attr =>
  attr && attr.name && attr.name.name === 'className'

module.exports = /** @type {import('jscodeshift').Transform} */ (
  file,
  api,
  options
) => {
  const j = api.jscodeshift
  const code = j(file.source)

  code
    .find(j.CallExpression, {
      callee: { property: { name: 'coroutine' } },
      arguments: [{ type: 'FunctionExpression', generator: true }],
    })
    .forEach(path => {
      path.get('callee', 'property', 'name').replace('method')
      path.get('arguments', '0', 'generator').replace(false)
      path.get('arguments', '0', 'async').replace(true)
      j(path)
        .find(j.YieldExpression, { delegate: false })
        .replaceWith(y => j.awaitExpression(y.value.argument))
      j(path)
        .find(j.YieldExpression, { delegate: true })
        .replaceWith(y =>
          j.awaitExpression(
            j.callExpression(
              j.callExpression(
                j.memberExpression(
                  path.value.callee.object,
                  j.identifier('coroutine')
                ),
                [j.arrowFunctionExpression([], y.value.argument, true)]
              ),
              []
            )
          )
        )
    })

  const replacedSource = code.toSource()
  return replacedSource
}

module.exports.parser = 'ts'
