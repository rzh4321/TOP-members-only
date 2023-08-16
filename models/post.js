const mongoose = require("mongoose");
const { format } = require('date-fns');

const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String, required: true },
  timestamp: { type: Date, required: true },
  description: { type: String, required: true },
  member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
});

postSchema.virtual("url").get(function () {
    return `/posts/${this._id}`;
});

postSchema.virtual("formattedTimestamp").get(function () {
  const formatted = format(this.timestamp, 'MM-dd-yyyy HH:mm:ss');
  return formatted;
});


// Export model
module.exports = mongoose.model("Post", postSchema);
