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
        if (filters.open) {
          
          switch(filters.open) {
          case "true":
            filters.open = true;
            break;
          case "false":
            filters.open = false;

          }
        }

        /*  if (filters._id) {
          filters._id = new mongoose.Types.ObjectId(req.query._id);
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
        const filteredIssues = projectQuery.length > 0 ? projectQuery[0].issues : [];  */

        let queryDoc = await Project.findOne({name: project}).lean();

        let entries = Object.entries(filters);        

        let filteredArr = [];
        queryDoc.issues.forEach((issue) => {
          if (entries.every((prop) => prop[1] == issue[prop[0]])) {
            filteredArr.push(issue);
          }
        });

        
        res.json(filteredArr);
        console.log("Successfull GET request");
        return;
      
      } catch(err) {
          console.error(err);
          res.json({error: "Invalid queries"});

      }

    })
    
    .post(async function (req, res) {
      let project = req.params.project;

      let { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        console.log(req.body);
        res.json({ error: "required field(s) missing" });
        return;
      }

      let issue = {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      };

      try {
        const projectDoc = await Project.findOneAndUpdate(
          { name: project },
          {},
          { new: true, upsert: true }
        );

        if(!projectDoc) {
          throw new Error("Could not find or create Project");
        }

        projectDoc.issues.push(issue);
        
        const newIssue = await projectDoc.save();
        
        res.json(newIssue.issues[newIssue.issues.length - 1]);

      } catch (error) {
        if (error.name === "ValidationError") {
          console.log("Validation error............");
          res.json({ error: "required field(s) missing" });
          return;
        }
        console.log("unknown", error)
        res.json({error: "required field(s) missing"});
      }
    })
    
    .put(async (req, res) => {
      let project = req.params.project;
      
      //PUT request handling 
      if(!req.body._id) {
        res.json({error: "missing _id"});
        return;
      }

      let updateObj = {};
      let _id = req.body._id;

      for(const key in req.body) {
        //Add updated field values to updateObj
        updateObj[`issues.$.${key}`] = req.body[key];
      }
      // remove the _id field, we are not setting it
      delete updateObj['issues.$._id'];

      if(Object.entries(updateObj).length == 0) {
        res.json({ 
          error: 'no update field(s) sent',
          '_id': req.body._id 
        });
        
        return;
      }
      
      try {  

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
          throw new Error('Project not found, failted to update');
          
        }

        const updatedIssue = updatedProject.issues.find((issue) => issue._id.toString() === _id);
    
        if (!updatedIssue) {
          throw new Error('Issue not found');
        }

        console.log("UpdatedIssue....", updatedIssue._id.toString(), "typeof....", typeof updatedIssue);

        console.log("updated on.....", updatedIssue.updated_on.toString());
        res.json({  result: 'successfully updated', _id: updatedIssue._id.toString() });

      } catch(err) {
        
          console.error(err);
          res.json({ error: 'could not update', _id: _id });
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

        if(!projectDoc) {
          throw new Error("issue not found")
        }
        
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
          _id: deletedIssue._id 
        });
        return;

      } catch(err) {
        console.log(err);
        res.json({ error: 'could not delete', _id: _id });

      }
      
    });
};
