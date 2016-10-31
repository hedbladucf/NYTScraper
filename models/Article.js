// Require Mongoose and create Schema class
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Article Schema
// Article Title, Summary, and Note are all needed.
var ArticleSchema = new Schema({

  articleTitle: {

    type:String,

    required:true
  },

  articleSummary: {

    type:String,

    required:true
  },

  // This only saves the ObjectID for one single note.
  note: {

      type: Schema.Types.ObjectId,
      
      ref: 'Note'
  }
});

// Create Article mongoose model and pass the ArticleSchema
var Article = mongoose.model('Article', ArticleSchema);

// Finally, export the Article
module.exports = Article;