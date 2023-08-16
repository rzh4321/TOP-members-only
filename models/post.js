const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String, required: true },
  timestamp: { type: Date, required: true },
  description: { type: String, required: true },
  password: { type: String, required: true },
  member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
});

postSchema.virtual("url").get(function () {
    return `/posts/${this._id}`;
});


// Export model
module.exports = mongoose.model("Post", postSchema);
