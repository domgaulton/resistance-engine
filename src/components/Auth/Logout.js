import React, { Component } from 'react';
import { ContextUserConsumer } from "../../context/ContextFirebaseUserProvider";

class Logout extends Component {
  componentDidMount(){
    this.props.logoutUser();
  }

  render(){
    return (
      <p>Logged out</p>
    );
  }
}

const LogoutUpdate = (props) => (
  <ContextUserConsumer>
    {({ logoutUser }) => (
      <Logout
        // remember to spread the existing props otherwise you lose any new ones e.g. 'something' that don't come from the provider
        {...props}
        logoutUser={logoutUser}
      />
    )}
  </ContextUserConsumer>
);

export default LogoutUpdate;