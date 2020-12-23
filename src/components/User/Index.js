import React, { Component } from 'react';
import { ContextUserConsumer } from "../../context/ContextFirebaseUserProvider";
import PageHeader from '../General/PageHeader';
import { Redirect } from 'react-router-dom';

class User extends Component {

  render(){
    return this.props.userLoggedIn && this.props.userData ? (
      <div className="container">
        <PageHeader title={`Welcome, ${this.props.userData.name}!`}/>
      </div>
    ) : (
      <Redirect push to="/login" />
    );
  }
}

const UserUpdate = props => (
  <ContextUserConsumer>
    {({ userLoggedIn, userData }) => (
      <User
        {...props}
        userLoggedIn={userLoggedIn}
        userData={userData}
      />
    )}
  </ContextUserConsumer>
);

export default UserUpdate;
