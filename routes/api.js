'use strict';
const { IssueSchema, Project } = require('../models.js');

module.exports = function (app) {
  app.route('/api/issues/:project')
    .get(function (req, res) {
      let project = req.params.project;
      //GET request handling here
    })
    
    .post(async function (req, res) {
      let project = req.params.project;
      console.log("Processing post request...");

      let { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: "Required field(s) are missing" });
        return;
      }

      let issue = {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        created_on: Date.now(),
        updated_on: Date.now()
      };

      try {
        const projectDoc = await Project.findOneAndUpdate(
          { projectName: project },
          {},
          { new: true, upsert: true }
        );

        projectDoc.issues.push(issue);
        const newIssue = await projectDoc.save();
        res.json(newIssue.issues[newIssue.issues.length - 1]);

      } catch (error) {
        if (error.name === "ValidationError") {
          return res.json({ error: "Required field(s) missing" });
        }
        res.send(error);
      }
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
