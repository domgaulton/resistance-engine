import React from 'react';
import { Router, Route } from "react-router-dom";
import FirebaseUserProvider from "../context/ContextFirebaseUserProvider";
import MessageProvider from "../context/ContextMessageProvider";
import Index from "../components/Index";
import Login from '../components/Auth/Login';
import Logout from '../components/Auth/Logout';
import User from "../components/User/Index";
import Settings from "../components/Settings/Index";
import Navigation from '../components/Navigation';
import MessageBanner from '../components/General/MessageBanner';
import { createBrowserHistory } from "history";
const history = createBrowserHistory();

function AppRouter() {
  return (
    <Router history={history}>
      <MessageProvider>
        <FirebaseUserProvider>
          <MessageBanner />
          <Route path="/" component={Index} />
          <Route path="/login" exact component={Login} />
          <Route path="/logout" exact component={Logout} />
          <Route path="/user/:userId" component={User} />
          <Route path="/settings" component={Settings} />
          <Navigation />
        </FirebaseUserProvider>
      </MessageProvider>
    </Router>
  );
}

export default AppRouter;
