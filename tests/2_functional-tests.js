const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let _idOne;
let titleOne;
let dateOne;

suite('Functional Tests', function() {

    suite('POST /api/issues/:project tests', function() {
        
        //test 1
        test('Create an issue with every field: POST request to /api/issues/test', function(done) {
            chai
            .request(server)
            .keepOpen()
            .post('/api/issues/test')
            .send({
                issue_title:"Test1",
                  issue_text:"Test1 for get requests",
                  created_by:"test",
                  assigned_to:"assignTest",
                  status_text:"statusTest"        
                })
            .end((err, res)=>{

                if (err) console.error(err);

                assert.equal(res.status,200);

                 _idOne   = res.body._id;
                 titleOne = res.body.issue_title;
                 dateOne = res.body.updated_on;

                assert.equal(res.type, 'application/json');
                assert.include(res.body,{
                  issue_title:"Test1",
                    issue_text:"Test1 for get requests",
                    created_by:"test",
                    assigned_to:"assignTest",
                    status_text:"statusTest"        
                  })
                
                done();
            })

        });

        //test 2
        test('Create an issue with only required fields: POST request to /api/issues/test', function(done) {
            chai
            .request(server)
            .keepOpen()
            .post('/api/issues/test')
            .send({
                issue_title:"Test2",
                issue_text:"Test2 for get requests",
                created_by:"test",            
            })
            .end((err, res) => {

                if (err) console.error(err);

                assert.equal(res.status,200);
                assert.equal(res.type, 'application/json');
                assert.include(res.body, {
                    issue_title:"Test2",
                    issue_text:"Test2 for get requests",
                    created_by:"test",
                    assigned_to:"",
                    status_text:""        
                })
                
                done();
            });

        });

        //test 3
        test('Create an issue with missing required fields: POST request to /api/issues/test', function(done) {
            chai
            .request(server)
            .keepOpen()
            .post('/api/issues/test')
            .send({
                issue_title:"Test2",
                issue_text:"Test2 for get requests",           
            })
            .end((err, res) => {

                if (err) console.error(err);

                assert.equal(res.status,200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.error, "required field(s) missing")
                
                done();
            });

        });

    });

    suite('GET /api/issues/:project tests', function() {

        this.timeout(5000);
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

        //test 5
        test('View issues on a project with one filter: GET request to /api/issues/test?open=true', function(done) {
            chai
            .request(server)
            .keepOpen()
            .get('/api/issues/test?open=true')
            .end(function(err, res) {
                if (err) console.error(err);
                
                assert.deepEqual(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.isArray(res.body);

            });

            done();

        });

        //test 6
        test('View issues on a project with multiple filters: GET request to /api/issues/test?open=true&created_by=test', function(done) {          
            chai
            .request(server)
            .keepOpen()
            .get('/api/issues/test?open=true&created_by=test&status_text=')
            .end(function(err, res) {
                if (err) console.error(err);
                
                assert.deepEqual(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.isArray(res.body);
                assert.isNotEmpty(res.body);

            });

            done();

        });
    });

    suite('PUT requests to /api/issues/test', function() {

        //test 7
        test("Update one field on an issue: PUT request to /api/issues/test", function(done) {
            chai
            .request(server)
            .keepOpen()
            .put("/api/issues/test")
            .send({_id : _idOne, issue_title:"Updated with PUT request"})
            .end((err, res) => {
                assert.equal(res.status,200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.result,"successfully updated");
                done();
            })
        })

        //test 8
        test("Update multiple fields on an issue: PUT request to /api/issues/test", function(done) {
            chai
            .request(server)
            .keepOpen()
            .put("/api/issues/test")
            .send( {
                _id   : _idOne, 
                issue_title :"Updated with PUT request8",
                issue_test  :"Updated with other fields",

            })
            .end((err, res) => {
                assert.equal(res.status,200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.result,"successfully updated");
                done();
            })
        })

        //test 9
        test("Update an issue with missing _id: PUT request to /api/issues/test", function(done) {
            chai
            .request(server)
            .keepOpen()
            .put("/api/issues/test")
            .send({ 
                issue_title :"Updated with PUT request9",
                issue_text  :"Updated with other fields"
            })
            .end((err, res) => {
                assert.equal(res.status,200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.error, "missing _id");
              
              done();
            })
        })

        //test 10
        test("Update an issue with no fields to update: PUT request to /api/issues/test",function(done) {
            chai.request(server)
            .put("/api/issues/test")
            .send({_id: _idOne})
            .end((err, res) => {
                assert.equal(res.status,200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.error,"no update field(s) sent");
                done();
            })

        });

        //test 11
        test("Update an issue with an invalid _id: PUT request to  /api/issues/test",function(done) {
            chai.request(server)
            .put("/api/issues/test")
            .send({
                _id: _idOne+"asdf" ,
                issue_test: "updated by test11, which should not happen",
                open: false
            })
            .end((err, res) => {
                assert.equal(res.status,200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.error,"could not update");
                done();
            })

        });

    });

    suite('DELETE request to /api/issues/test', function() {

        //test 12
        test('Delete an issue: DELETE request to /api/issues/test', function(done) {
            chai
            .request(server)
            .keepOpen()
            .delete('/api/issues/test')
            .send( {
                _id: _idOne
            })
            .end( (err, res) => {
                if (err) console.error(err);
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.result, "successfully deleted");
                assert.equal(res.body._id, _idOne);

                done();
            })
        });

        //test 13
        test('Delete an issue with an invalid _id: DELETE request to /api/issues/test', function(done) {
            let _idTwo = _idOne + "asdf";
            chai
            .request(server)
            .keepOpen()
            .delete('/api/issues/test')
            .send( {
                _id: _idTwo
            })
            .end( (err, res) => {
                if (err) console.error(err);
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.error, "could not delete");
                assert.equal(res.body._id, _idTwo);

                done();
            })
        });

        //test 13
        test('Delete an issue with missing _id: DELETE request to /api/issues/test', function(done) {
            chai
            .request(server)
            .keepOpen()
            .delete('/api/issues/test')
            .end( (err, res) => {
                if (err) console.error(err);
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.error, "missing _id");

                done();
            })
        });


    });

});
  

