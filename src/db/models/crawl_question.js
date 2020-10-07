const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const table = "crawl_question";
const Schema = new mongoose.Schema(
  {
    question_link: { type: String, required: true, unique: true },
    q_id: { type: String },
    status: { type: Number, default: 1 },
  },
  {
    strict: false,
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);
Schema.plugin(mongoosePaginate);
Schema.options.toJSON = {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};
let CrawlQuestionModel = mongoose.model(table, Schema);

module.exports = CrawlQuestionModel;
