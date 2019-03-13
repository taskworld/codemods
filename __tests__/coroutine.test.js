const transform = require('../coroutine')
const defineInlineTest = require('jscodeshift/dist/testUtils').defineInlineTest

defineInlineTest(
  transform,
  {},
  `
  const blah = Bluebird.coroutine(function* (a: string) {
    const x = yield f(a as any)
    return x
  })
  `,
  `
  const blah = Bluebird.method(async function(a: string) {
    const x = await f(a as any)
    return x
  })
  `
)

defineInlineTest(
  transform,
  {},
  `
  const blah = Bluebird.coroutine(function* (a: string) {
    const x = yield* f(a as any)
    return x
  })
  `,
  `
  const blah = Bluebird.method(async function(a: string) {
    const x = await Bluebird.coroutine(() => f(a as any))()
    return x
  })
  `
)
