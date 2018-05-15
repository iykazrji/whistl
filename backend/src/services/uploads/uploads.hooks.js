const { authenticate } = require('@feathersjs/authentication').hooks;
const dauria = require('dauria');

const convertFileToBase64 = () => {
  return (context) => {
    console.log('Data: ')
    console.log(context.params.file)

    // Handle File...
    if (!context.data.uri && context.params.file ) {
      const file = context.params.file;
      const uri = dauria.getBase64DataURI(file.buffer, file.mimetype);
      context.data = { uri: uri };
    }
  }
}

const formatUploadResponse = () => {
  return (context) => {
    let upload_path = context.app.get('img_upload_path')
    context.result.path = `${upload_path}/${context.result.id}`
    delete context.result.uri
  }
}
module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [ convertFileToBase64() ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [ formatUploadResponse() ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
