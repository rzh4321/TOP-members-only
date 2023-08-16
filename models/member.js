const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const memberSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  membership: { type: Boolean, required: true },
});


memberSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

memberSchema.virtual("url").get(function () {
    return `/members/${this._id}`;
});


// Export model
module.exports = mongoose.model("Member", memberSchema);
