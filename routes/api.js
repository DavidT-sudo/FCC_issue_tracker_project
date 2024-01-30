'use strict';
const { IssueSchema, Project } = require('../models.js');

module.exports = function (app) {
  app.route('/api/issues/:project')
    .get(function (req, res) {
      let project = req.params.project;
      //GET request handling here
    })
    
    .put(function (req, res) {
      let project = req.params.project;
      // Your PUT request handling code here
    })
    
    .delete(function (req, res) {
      let project = req.params.project;
      // Your DELETE request handling code here
      
    });
};
