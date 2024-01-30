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
    
    .put(async (req, res) => {
      let project = req.params.project;
      
      //PUT request handling 
      if(!req.body._id) {
        res.json({error: "please include and _id field(s)"});
      }

      let _id = req.body._id;

      let updateObj = {};

      for(const key in req.body) {
        //Add updated field values to updateObj
        updateObj[`issues.$.${key}`] = req.body[key];
      }
      
      let delResult = delete updateObj['issues._id'];

      console.log("Is is deleted? => ", delResult);

      
      try {  //set update date
        updateObj.updated_on = Date.now();

        let updatedProject = await Project.findOneAndUpdate(
          {
            name: project,
            "issues._id": _id
          },
          {
            $set: updateObj
          },
          { new : true}

        );

        if (!updatedProject) {
          return res.status(404).json({ error: 'Project or issue not found' });
        }

        const updatedIssue = updatedProject.issues.find((issue) => issue._id.toString() === _id);
    
        if (!updatedIssue) {
          return res.status(404).json({ error: 'Issue not found in the project' });
        }
    
        res.json({
          "result":"successfully updated",
          "_id": updatedIssue._id
        });

      } catch(err) {
          console.error('Error:', err);
          res.status(500).json({ error: 'Internal server error' });
      }

    })
    
    .delete(function (req, res) {
      let project = req.params.project;
      // Your DELETE request handling code here
      
    });
};
