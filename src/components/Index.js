import React, { Component } from 'react';
import { ContextUserConsumer } from "../context/ContextFirebaseUserProvider";
import { Redirect } from 'react-router-dom';

class Index extends Component {

  render(){
    return this.props.userLoggedIn && this.props.userId !== '' ? (
      <Redirect push to={`/user/${this.props.userId}`} />
    ) : (
      <Redirect push to="/login" />
    );
  }
}

const IndexUpdate = props => (
  <ContextUserConsumer>
    {({ userId, userLoggedIn }) => (
      <Index
        {...props}
        userId={userId}
        userLoggedIn={userLoggedIn}
      />
    )}
  </ContextUserConsumer>
);

export default IndexUpdate;
