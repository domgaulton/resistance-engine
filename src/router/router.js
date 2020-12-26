import React from 'react';
import { Router, Route } from "react-router-dom";
import FirebaseProvider from '../context/FirebaseProvider';
import App from "../components/App/App";
import Page from "../components/Page/page";
import { createBrowserHistory } from "history";

const history = createBrowserHistory();

function AppRouter() {
  return (
    <Router history={history}>
      <FirebaseProvider>
        <Route path="/" exact component={App} />
        <Route path="/:pageId" component={Page} />
      </FirebaseProvider>
    </Router>
  );
}

export default AppRouter;
