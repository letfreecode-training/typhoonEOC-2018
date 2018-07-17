const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'ap-southeast-1' });
const table = 'EOC';

const fetchEOC = (caseLocationDistrict, caseComplete) =>
  new Promise((resolve, reject) => {
    const params = {
      TableName: table
    };
    dynamodb.scan(params, (err, data) => {
      let items = data.Items;
      const total = data.Count;
      resolve({
        items,
        total: items.length
      });
    });
  });

module.exports = fetchEOC;
