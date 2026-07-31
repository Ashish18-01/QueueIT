const { loadOpenApiSpec } = require('../src/config/swagger');
const spec = loadOpenApiSpec();
if (!spec.openapi || !spec.info) throw new Error('Invalid OpenAPI specification');
console.log(`OpenAPI ${spec.info.title || 'specification'} loaded successfully`);
