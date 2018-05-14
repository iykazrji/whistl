// Initializes the `uploads` service on path `/uploads`
const createService = require('feathers-mongoose');
const createModel = require('../../models/uploads.model');
const hooks = require('./uploads.hooks');
const blobService = require('feathers-blob');
const fs = require('fs-blob-store');
const blobStorage = fs('../../../uploads/images');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'uploads',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/uploads', blobService({ Model: blobStorage}));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('uploads');

  service.hooks(hooks);
};
