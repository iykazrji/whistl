import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Route exact path="/" component={LoginButton} />
          <Route path="/auth/google/callback" component={authCallbackHandler} />
        </div>
      </Router>
      
    );
  }
}

window.authWindow = ()=>{ window.open("http://localhost:3030/auth/google/", "Sign in to Google", "resizable=yes,top=200,left=500,width=400,height=400")}
let openAuthWindow = () => {
  window.authWindow()
}

let getQueryVariable = (variable) => {
  var query = window.location.search.substring(1);
  console.log(query)
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) == variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  console.log('Query variable %s not found', variable);
}

let LoginButton = (props)=>{
  return(
    <div className="App">
      <button onClick={openAuthWindow}>Login with google</button>
    </div>
  )
}


let authCallbackHandler = (props) =>{
  var token = getQueryVariable('token');
  if (token) {
    window.localStorage.setItem('feathers-jwt', token);
    window.close()
  }

  return(
    <div>Meant to handle auth callback</div>
  )
}
export default App;
