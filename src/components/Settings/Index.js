import React, { Component } from 'react';
import { ContextUserConsumer } from "../../context/ContextFirebaseUserProvider";
import { Link } from 'react-router-dom';
import Login from '../Auth/Login';
import PageHeader from '../General/PageHeader';

class Settings extends Component {

  render(){
    return this.props.userLoggedIn ? (
      <div className="container">
        <PageHeader title={this.props.userId}/>
        <nav>
          <ul className="item-list">
            <li className="item-list__item">
              <Link to={`/logout`}>
                <i className="material-icons">exit_to_app</i>
                <span>Logout</span>
              </Link>
            </li>
            <li className="item-list__item" style={{background: 'red'}} onClick={() => this.props.deleteUser(this.props.userId)}>
              <i className="material-icons">delete_forever</i>
              <span>Delete User</span>
            </li>
          </ul>
        </nav>
      </div>
    ) : (
      <Login />
    );;
  }
}

const SettingsUpdate = props => (
  <ContextUserConsumer>
    {({ userId, logoutUser, userLoggedIn, deleteUser  }) => (
      <Settings
        {...props}
        userId={userId}
        logoutUser={logoutUser}
        userLoggedIn={userLoggedIn}
        deleteUser={deleteUser}
      />
    )}
  </ContextUserConsumer>
);

export default SettingsUpdate;
