const { analyticsReportingDemo } = require('./analytics-reporting-api-demo');

async function runDemo() {
  const demoResponse = await analyticsReportingDemo();
  console.log(JSON.stringify(demoResponse));
}

runDemo();