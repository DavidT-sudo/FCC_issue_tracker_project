const mongoose = require("mongoose");

// Creation of schema
const IssueSchema = new mongoose.Schema({
  
  project_name: {
    type: String,
    default: ""
  },  
  issue_title: {
    type: String,
    required: [true, 'Some required field(s) are missing'],
  },
  issue_text: {
    type: String,
    required: [true, 'Some required field(s) are missing'],
  },
  created_by: {
    type: String,
    required: [true, 'Some required field(s) are missing'],
  },
  assigned_to: {
    type: String,
    default: "",
  },
  status_text: {
    type: String,
    default: "",
  },
  open: {
    type: Boolean,
    default: true,
  }  
   
}, { 
timestamps: { 
  createdAt: "created_on", 
  updatedAt: "updated_on" 
  } 
}
);



const Issue = mongoose.model("Issue", IssueSchema);

module.exports = {
  Issue
};
