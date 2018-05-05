// profiles-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const profiles = new Schema({
    userId: { type: String, required: true },
    firstName: {type: String},
    lastName: {type: String},
    provider: {type: String},
    type: {type: String},
    email: {type: String}
  }, {
    timestamps: true
  });

  return mongooseClient.model('profiles', profiles);
};
