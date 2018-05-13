const authentication = require('@feathersjs/authentication');
const jwt = require('@feathersjs/authentication-jwt');
const local = require('@feathersjs/authentication-local');
const oauth2 = require('@feathersjs/authentication-oauth2');
const GoogleStrategy = require('passport-google-oauth20');
const makeHandler = require('./oauth-handler');
const {checkIsEmpty} = require('./helpers')

const createUserOnLogin = () => {

  return context => {
    // Check if the @Params object contains the user we want 
    // to create...
    if (context.params.user && !checkIsEmpty(context.params.user)) {
      let provider = context.params.user.provider

      // Check if the authentication method is Google and Create user
      // Based on that User...
      if (provider === "google") {
        // Create a User Data object from the @Params Object
        let user_data = {
          googleId: context.params.user.id,
          email: context.params.user.email
        }
        
        // Call the @Users Service and check if User exists...
        return context.app.service('users').find({
          query: {
            googleId: user_data.googleId
          }
        }).then(response => {
          // if the response provides 0 records, create the User...
          if (response.total == '0') {
            // We can proceed to user creation
            let payload_params = context.data.payload;

            return context.app.service('users').create(user_data, payload_params)
              .then(
                response => {
                  context.result.user = response;
                  context.result.payload = context.data.payload;
                }
              )
              .catch(
                error => {
                  console.log(error)
                  context.result.error = error
                }
              )
          } else {
            context.result.error = "User already Exist..."
          }
        })

      }
    }
    return context;
  }

}

const returnUserData = (config) => {
  // This hook would return the User's Data after Authentication.

  return context => {

    // Check if @Params or @Data objects from the contexts are available...
    if (context.params.user || context.data.user) {
      context.result.user = context.data || context.params.user;
      
      // Delete Passwords from payload...
      delete context.result.user.password;
      
      // Create JWT response for User. This would ensure as long as a user's Data
      // is passed to the Authentication service, a valid JWT response would be provided
      // based on that User's Data...
      if (!checkIsEmpty(context.params.user)) {
        const options = {
          jwt: config.jwt,
          secret: config.secret
        };
        return context.app.passport.createJWT(context.result.user, options).then(token => {
          context.result.jwt_token = token
        }).catch(error => {
          console.log(error)
        })
      }
    }
    return context;
  }
}

module.exports = function (app) {
  const config = app.get('authentication');

  // Set up authentication with the secret
  app.configure(authentication(config));
  app.configure(jwt());
  app.configure(local());

  // Create the Handler by passing the app object
  let oauth_handler = makeHandler(app)

  // Create a Custom Verifier to access user profiles and access tokens.
  // This is important to get more control over the Oauth f;ow...
  class CustomVerifier extends oauth2.Verifier {
    verify(req, accessToken, refreshToken, profile, done) {
      // Get user profile information...
      if (profile.provider === 'google') {
        let user_data = {
          id: profile.id,
          firstname: profile.name.givenName,
          lastName: profile.name.familyName,
          type: 'user',
          provider: 'google',
          email: profile.emails[0].value
        }
        let payload = {
          user_profile: user_data,
          access_token: accessToken
        }
        // Send Payload to Data Context...
        // Add the @user_data to the Oauth response
        // The @user_data object would populate the context's @Params object.
        done(null, user_data, payload);
      }
    }
  }

  app.configure(oauth2(Object.assign({
    name: 'google',
    Verifier: CustomVerifier,
    Strategy: GoogleStrategy,
    handler: oauth_handler(config.google.successRedirect) // Handle Oauth
  }, config.google)));



  // The `authentication` service is used to create a JWT.
  // The before `create` hook registers strategies that can be used
  // to create a new valid JWT (e.g. local or oauth2)
  app.service('login').hooks({
    before: {
      create: [
        authentication.hooks.authenticate(config.strategies)
      ],
      remove: [
        authentication.hooks.authenticate('jwt')
      ]
    },
    after: {
      create: [createUserOnLogin(), returnUserData(config)]
    }
  });
};
