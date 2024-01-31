const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    suite('GET /api/issues/:project tests', function() {

        //test 4
        test('View issues on a project: GET request to /api/issues/{project}', function(done) {
            chai
            .request(server)
            .keepOpen()
            .get('/api/issues/test')
            .end(function(err, res) {
                if (err) console.error(err);
                
                assert.deepEqual(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.isArray(res.body);

            })

            done();
        })

    });
  
});
