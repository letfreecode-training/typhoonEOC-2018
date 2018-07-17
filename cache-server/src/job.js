const schedule = require('node-schedule');
const axios = require('axios');
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'ap-southeast-1' });

const table = 'EOC';

// 最新災害專案的災情資料
const baseURL =
  'https://tpeoc.blob.core.windows.net/blobfs/GetDisasterSummary.json';

const fetchData = () =>
  axios({
    method: 'GET',
    url: baseURL,
    headers: {
      'User-Agent': '',
      'X-Powered-By': '',
      Host: '',
      MESSAGE: 'Thanks for Taiwan EOC.'
    }
  });

const job = schedule.scheduleJob('* */30 * * *', () => {
  fetchData()
    .then(response => response.data)
    .then(data => {
      const promises = data.map(
        d =>
          new Promise((resolve, reject) => {
            const params = {
              TableName: table,
              Item: {
                DPID: d.DPID,
                DPName: d.DPName,
                CaseID: d.CaseID,
                CaseTime: d.CaseTime,
                PName: d.PName,
                CaseLocationDistrict: d.CaseLocationDistrict,
                CaseLocationDescription: d.CaseLocationDescription,
                CaseDescription: d.CaseDescription,
                CaseComplete: d.CaseComplete,
                Wgs84X: d.Wgs84X,
                Wgs84Y: d.Wgs84Y
              }
            };
            dynamodb.put(params, (err, data) => {
              if (!err) resolve(d.CaseID);
              else reject(d.CaseID);
            });
          })
      );
      Promise.all(promises)
        .then(response => console.log('SUCCESS KEY:' + response))
        .catch(error => console.log('ERROR KEY: ' + error));
    })
    .catch(error => console.log(error));
});
