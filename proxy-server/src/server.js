const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const { makeExecutableSchema } = require('graphql-tools');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const fetchEOC = require('./handler/dyanmo/');

const PORT = process.env.PORT || 8080;

const app = express();

app.use(helmet());
app.use(cors());

let cache = null;

setInterval(() => {
  cache = null;
}, 172800000);

const filter = data => (caseLocationDistrict, caseComplete) => {
  let items = data;
  if (caseLocationDistrict) {
    items = data.filter(
      item => item.CaseLocationDistrict === caseLocationDistrict
    );
  }
  if (typeof caseComplete === 'boolean') {
    items = data.filter(item => item.CaseComplete === caseComplete);
  }
  return items;
};

const schema = makeExecutableSchema({
  typeDefs: require('./types/index.js').v1,
  resolvers: {
    Query: {
      getDisasterSummary: (root, args) => {
        const { caseLocationDistrict, caseComplete } = args;
        return new Promise((resolve, reject) => {
          if (!cache) {
            resolve(
              fetchEOC().then(response => {
                cache = response.items;
                return {
                  items: filter(cache)(caseLocationDistrict, caseComplete),
                  total: cache.length
                };
              })
            );
          } else {
            resolve({
              items: filter(cache)(caseLocationDistrict, caseComplete),
              total: cache.length
            });
          }
        });
      }
    }
  }
});

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

app.get('/disasters', (req, res) => {
  if (!cache) {
    fetchEOC()
      .then(response => {
        cache = response.items;
        res.status(200).send({
          items: filter(cache)(),
          total: cache.length
        });
      })
      .catch(err => console.log(err));
  } else {
    res.status(200).send({
      items: filter(cache)(),
      total: cache.length
    });
  }
});

app.listen(PORT, () => console.log(`Server starting port ${PORT}`));
