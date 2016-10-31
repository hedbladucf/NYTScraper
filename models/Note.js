// Require Mongoose and create Schema class
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Note Schema
// Note ID (Article ID) and Note text are needed.
var NoteSchema = new Schema({

  id: {

    type:String,

    required:true
  },

  note: {

    type:String,
    
    required:true
  }
});

// Create Node mongoose model and pass the NoteSchema
var Note = mongoose.model('Note', NoteSchema);

// Finally, export the Note.
module.exports = Note;