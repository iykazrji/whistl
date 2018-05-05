const authentication = require('@feathersjs/authentication');
const jwt = require('@feathersjs/authentication-jwt');
const local = require('@feathersjs/authentication-local');
const oauth2 = require('@feathersjs/authentication-oauth2');
const GoogleStrategy = require('passport-google-oauth20');
const axios = require('axios');

const createUserOnLogin = () => {
  return context => {
    if (context.data.user) {
      let provider = context.data.user.provider
      if (provider === "google") {
        console.log("create user with google")
        let user_data = {
          googleId: context.data.user.id,
        }
        return context.app.service('users').find({
          query: {
            googleId: user_data.googleId
          }
        }).then(response => {
            console.log(response)
            if (response.total == '0') {
              console.log('No records, create user')
              // We can proceed to user creation
              let payload_params = context.data.payload;
              return context.app.service('users').create(user_data, payload_params)
                .then(
                  response => {
                    console.log("User created....")
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
            }else{
              context.result.error = "User already Exist..."
            }
          })

      }
    }
    return context;
  }
}
const returnUserData = () => {
  return context => {
    if (context.params.user) {
      context.result.user = context.params.user;
      // Delete Passwords from payload...
      delete context.result.user.password;
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

  // Create a Custom Verifier to access user profiles and access tokens.
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
        done(null, user_data, payload);
      }
    }
  }

  app.configure(oauth2(Object.assign({
    name: 'google',
    Verifier: CustomVerifier,
    Strategy: GoogleStrategy
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
      create: [createUserOnLogin()]
    }
  });
};
