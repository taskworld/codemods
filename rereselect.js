// https://astexplorer.net/

export default function transformer(file, api) {
  const j = api.jscodeshift;
  var feature = 'tw-tasklists/'
  var root = j(file.source)
  
  function queryFn(fn, args) {
    return j.arrowFunctionExpression(
      [j.identifier('query')],
      j.blockStatement([
        ...fn.params.map((a,i) => {
          return j.variableDeclaration(
            'const',
            [
              j.variableDeclarator(
                a,
                j.callExpression(j.identifier('query'), [
                  args[i]
                ])
              )
            ]
          )
        }),
        ...fn.body.type === 'BlockStatement' ? fn.body.body : [j.returnStatement(fn.body)]
      ])
    )
  }
  
  root
    .find(j.VariableDeclarator, {
      init: {
        callee: { name: 'createSelector' }
      }
	})
    .forEach(path => {
      var fn = path.node.init.arguments.slice(-1)[0]
      j(path.get('init')).replaceWith(
        j.callExpression(
          j.identifier('makeNamedSelector'),
          [
            j.stringLiteral(feature + path.node.id.name),
            queryFn(fn, path.node.init.arguments)
          ]
        )
      )
    })
  
  root
    .find(j.VariableDeclarator, {
      init: {
        body: {
          callee: { name: 'createSelector' }
        }
      }
	})
    .forEach(path => {
      var fn = path.node.init.body.arguments.slice(-1)[0]
      j(path.get('init')).replaceWith(
        j.callExpression(
          j.identifier('makeParameterizedSelector'),
          [
            j.stringLiteral(feature + path.node.id.name),
            j.arrowFunctionExpression(
              path.node.init.params,
              queryFn(fn, path.node.init.body.arguments)
            )
          ]
        )
      )
    })
  
  root
    .find(j.VariableDeclarator, {
      init: {
        callee: {
          object: { name: '_' },
          property: { name: 'memoize', }
        },
        arguments: [{
          body: {
            callee: { name: 'createSelector' }
          }
        }]
      }
	})
    .forEach(path => {
      var fn = path.node.init.arguments[0].body.arguments.slice(-1)[0]
      j(path.get('init')).replaceWith(
        j.callExpression(
          j.identifier('makeParameterizedSelector'),
          [
            j.stringLiteral(feature + path.node.id.name),
            j.arrowFunctionExpression(
              path.node.init.arguments[0].params,
              queryFn(fn, path.node.init.arguments[0].body.arguments)
            )
          ]
        )
      )
    })
  
  return root.toSource();
}
