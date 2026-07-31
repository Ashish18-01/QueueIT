const path = require('path');
const YAML = require('yamljs');

const loadOpenApiSpec = () => YAML.load(path.resolve(__dirname, '../../../docs/api/openapi.yaml'));
module.exports = { loadOpenApiSpec };
