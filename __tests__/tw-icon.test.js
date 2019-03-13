const transform = require('../tw-icon')
const defineInlineTest = require('jscodeshift/dist/testUtils').defineInlineTest

defineInlineTest(
  transform,
  {},
  `<span className="tw-icon-happy" />`,
  `<Icon name="happy" />`
)
