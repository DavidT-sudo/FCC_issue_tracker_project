'use strict';
const { IssueSchema, Project } = require('../models.js');
const mongoose = require('mongoose');

module.exports = function (app) {
  app.route('/api/issues/:project')

    .get(async (req, res) => {
      let project = req.params.project;
      //GET request handling here
      try {

        if(Object.entries(req.query).length == 0) {
          let projectDoc = await Project.findOne({name: project});
          let issues = [];

          if (projectDoc?.issues) {
            issues = projectDoc.issues;

          } 

          res.json(issues);
          return;   
        }

        //Handle GET queries
        let filters = req.query;

        //turn query strings into Boolean values for 'open' field
        switch(filters.open) {
          case "true":
            filters.open = true;
            break;
          case "false":
            filters.open = false;

        }
        
        // try the aggregation function
        const aggregationPipeline = [
          {
            $match: {
              name: project,
            },
          },
          {
            $project: {
              _id: 0,
              issues: {
                $filter: {
                  input: '$issues',
                  as: 'issue',
                  cond: {
                    $and: Object.entries(filters).map(([key, value]) => ({
                      $eq: [`$$issue.${key}`, value],
                    })),
                  },
                },
              },
            },
          },
        ];

        const projectQuery = await Project.aggregate(aggregationPipeline);

        // Extract the filtered issues array
        const filteredIssues = projectQuery.length > 0 ? projectQuery[0].issues : [];
        

        console.log("matching Issues...", filteredIssues.length, "queries: ", filters);
    
        res.json(filteredIssues);
      
      } catch(err) {
          console.error(err);

      }

    })
    
    .post(async function (req, res) {
      let project = req.params.project;
      console.log("Processing post request...");

      let { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: "required field(s) missing" });
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
        res.json({error: "missing _id"});
        return;
      }

      let _id = req.body._id;

      let updateObj = {};

      for(const key in req.body) {
        //Add updated field values to updateObj
        updateObj[`issues.$.${key}`] = req.body[key];
      }
      // remove the _id field, we are not setting it
      delete updateObj['issues.$._id'];

      if(Object.entries(updateObj).length == 0) {
        res.json({ 
          error: 'no update field(s) sent',
          '_id': _id 
        });
        
        return;
      }
      
      try {  //set update date
        updateObj.updated_on = Date.now();

        if(!mongoose.Types.ObjectId.isValid(_id)) {
          console.log()
          throw new Error("Invalid _id");
        }

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
          throw new Error('Project not found');
        }

        const updatedIssue = updatedProject.issues.find((issue) => issue._id.toString() === _id);
    
        if (!updatedIssue) {
          throw new Error('Issue not found');
        }
    
        res.json({  result: 'successfully updated', '_id': updatedIssue._id });

      } catch(err) {
        
          console.error(err);
          res.json({ error: 'could not update', '_id': _id });
      }

    })
    
    .delete(async (req, res) => {
      let project = req.params.project;
      // Your DELETE request handling code here

      if(!req.body._id) {
        res.json({ error: 'missing _id' });
        return;
      }

      let _id = req.body._id;

      try {

        if(!mongoose.Types.ObjectId.isValid(_id)) {
          throw new Error("Invalid _id");
        }

        let projectDoc = await Project.findOne({ "issues._id": _id });

      //find the issue and remove it from the array
      const issueIndex = projectDoc.issues.findIndex(issue => issue._id == _id);

      let deletedIssue;
      console.log("issue index............... ", issueIndex);
      if (issueIndex !== -1) {
        // Remove the issue from the issues array
        deletedIssue = projectDoc.issues.splice(issueIndex, 1)[0];

        console.log("deleted issue.... : ", deletedIssue._id);
        // Save the updated project document after removing the issue
        await projectDoc.save();

      } else {
        console.log("No Issue found with id: ", _id);
        throw new Error("Issue not found");

      }

        
        res.json({ 
          result: 'successfully deleted',
          '_id': deletedIssue._id 
        });
        return;

      } catch(err) {
        console.log(err);
        res.json({ error: 'could not delete', '_id': _id });

      }
      
    });
};
