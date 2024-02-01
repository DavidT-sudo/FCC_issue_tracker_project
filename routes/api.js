'use strict';
const { Issue } = require('../models.js');
const mongoose = require('mongoose');

module.exports = function (app) {
  app.route('/api/issues/:project')

    .get(async (req, res) => {
      const startTime = process.hrtime();
      let project = req.params.project;
      //GET request handling here
      try {

        //Handle GET queries
        let updateObj = req.query;

        updateObj.project_name = project;

        //turn query strings into Boolean values for 'open' field
        if (updateObj.open) {
          
          switch(updateObj.open) {
          case "true":
            updateObj.open = true;
            break;
          case "false":
            updateObj.open = false;

          }
        }

        let issues = await Issue.find( updateObj, "-project_name -__v");

        if (issues) {
          const endTime = process.hrtime(startTime);
          const execTime = endTime[0] * 1000 + endTime[1] / 1e6;
          console.log("Execution time.............,,,,,,,, ", execTime);
        }

        if (!issues) {
          issues = [];
  
        }
        
        res.json(issues);
        console.log("Successfull GET request");
        
      } catch(err) {
          console.error(err);
          res.json({error: "Invalid queries"});

      }

    })
    
    .post(async function (req, res) {
      let project_name = req.params.project;

      let { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        console.log("req.body fields....",req.body);
        res.json({ error: "required field(s) missing" });
        return;
      }
      

      let nwIssue = {
        project_name,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      };

      try {
        nwIssue = new Issue(nwIssue);
        nwIssue = await nwIssue.save();

        delete nwIssue.project_name;

        res.json(nwIssue);

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
        console.log("req.body._id......... ",req.body._id);
        res.json({error: "missing _id"});
        return;
      }

      let {_id, ...updateObj} = req.body;

      console.log("_id and UpdateObj.....", _id, updateObj);

      if(Object.entries(updateObj).length == 0) {
        res.json({ 
          error: 'no update field(s) sent',
          '_id': req.body._id 
        });
        
        return;
      }
      
      try {

        if (updateObj.open) {

          switch(updateObj.open) {
          case "true":
            updateObj.open = true;
            break;
          case "false":
            updateObj.open = false;

          }
        }

        if(!mongoose.Types.ObjectId.isValid(_id)) {
          throw new Error("Invalid _id");
        }

       let updatedIssue = await Issue.findByIdAndUpdate(
         _id,
         {
         $set: updateObj
         }
       );

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

        let deletedIssue = await Issue.findByIdAndDelete(_id);

        if(!deletedIssue) {
          throw new Error("No issue found by that _id");
        }        
        
        console.log("deleted issue.... : ", deletedIssue._id);
        // Save the updated project document after removing the issue
        
        return res.json({ 
          result: 'successfully deleted',
          _id: deletedIssue._id 
        });
    
      } catch(err) {
        console.log(err);
        return res.json({ error: 'could not delete', _id: _id });

      }
      
    });
};
