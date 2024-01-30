const mongoose = require("mongoose");

// Creation of schema
const IssueSchema = new mongoose.Schema({
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
  },
  created_on: {
    type: Date,
    default: Date.now,
  },
  updated_on: {
    type: Date,
    default: Date.now,
  },
});

const ProjectSchema = new mongoose.Schema({
  name  : String,
  issues: [IssueSchema],
});

const Project = mongoose.model("Project", ProjectSchema);

module.exports = {
  IssueSchema,
  Project,
};
