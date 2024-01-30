'use strict';
const { IssueSchema, Project } = require('../models.js');

module.exports = function (app) {
  app.route('/api/issues/:project')

    .get(async (req, res) => {
      let project = req.params.project;
      //GET request handling here
      try {

        if(Object.entries(req.query).length == 0) {
          let projectDoc = await Project.findOne({name: project});
          let issues = projectDoc.issues;

          return res.json(issues);
          
        }

        //Handle GET queries
        let queryObj = {};
        let filters = req.query;
        
        for (const key in filters) {
          
          // Add the filter to the queryObject
          queryObj[`issues.${key}`] = filters[key];
          
        }

        Project.findOne(
          { name: project },
          { 'issues.$': { $elemMatch: queryObj } },
          (err, project) => {
            if (err) {
              console.error('Error: ', err);
              return res.status(500).json({ error: 'Internal server error' });
            }
        
            if (!project) {
              return res.status(404).json({ error: 'Project not found' });
            }
        
            const matchingIssue = project.issues[0];
        
            if (!matchingIssue) {
              return res.status(404).json({ error: 'No matching issues found' });
            }
        
            res.json(matchingIssue);
          }
        );


      } catch(err) {
          console.error(err.name);

      }

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
          { name: project },
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
