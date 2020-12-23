import React, { Component } from 'react';
import { firestore, auth } from "../base";
import { ContextMessageConsumer } from './ContextMessageProvider';
import { withRouter } from "react-router";

const Context = React.createContext();
export const ContextUserConsumer = Context.Consumer;

const usersCollection = process.env.REACT_APP_FIREBASE_USERS_COLLECTION;

class FirebaseUserProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: '',
      userData: {},
      userLoggedIn: false,

      // Auth
      loginUser: (email, password) => this.handleLoginUser(email, password),
      createAuthUser: (email, password, name) => this.handleCreateAuthUser(email, password, name),
      logoutUser: () => this.handleLogoutUser(),
      deleteUser: (userId) => this.handleDeleteUser(userId),

      // Set User Data
      setUserData: (data) => this.handleSetUserData(data),
      updateUserData: (userId, fieldName, update) => this.handleUpdateUserData(userId, fieldName, update),

      // Settings
      resetPassword: (email) => this.handleResetPassword(email),
    };
  }

  componentDidMount(){
    auth.onAuthStateChanged(user => {
      if (user) {
        this.handleSetUserData(user.uid)

      } else {
        // No user is signed in.
        this.setState({
          userLoggedIn: false,
        })
      }
    });
  }

  // // // // // //
  // Auth
  // // // // // //

  handleLoginUser = (email, password) => {
    auth.signInWithEmailAndPassword(email, password)
    .then(response => {
      this.handleSetUserData(response.user.uid)
    })
    .catch(error => {
      const errorMessage = error.message;
      this.props.addMessage(errorMessage)
    });
  }

  // Create auth user, if successful add them to database collection
  handleCreateAuthUser = (email, password, name) => {
    auth.createUserWithEmailAndPassword(email, password)
    .then(response => {
      this.setState({
        userId: response.user.uid
      })
      this.handleCreateDatabaseUser(response.user.uid, name)
    })
    .catch(error => {
      const errorMessage = error.message;
      this.props.addMessage(errorMessage);
    });
  }

  handleCreateDatabaseUser = (userId, name) => {
    firestore.collection(usersCollection).doc(userId).set({
      // Set user details in here for collection
      name: name,
    })
    .then(() => {
      // attach user data to app
      this.handleSetUserData(userId);
    })
    .catch(error => {
      // console.error("Error writing document: ", error);
      this.props.addMessage(error);
    });
  }

  handleLogoutUser = () => {
    auth.signOut()
    .then(() => {
      this.setState({
        userLoggedIn: false,
        userId: '',
      })
    }).catch(error => {
      // An error happened.
      this.props.addMessage(error);
    });
  }

  handleDeleteUser = userId => {
    const userDoc = firestore.collection(usersCollection).doc(userId);
    userDoc.get()
    .then(() => {
      //Finally delete the user
      userDoc.delete().then(function() {
        const user = auth.currentUser;
        user.delete().then(function() {
          //user deleted
        }).catch(function(error) {
          // An error happened.
          console.log(error);
        });
      }).catch(function(error) {
        console.error("Error removing document: ", error);
      });
    })
    .then(() => {
      this.setState({
        userLoggedIn: false,
        userId: '',
      })
    })
  }

  // // // // // //
  // Set User Data
  // // // // // //


  // Set user data in react state (attach user data to app)
  handleSetUserData = userId => {
    this.setState({
      userId: userId
    })
    firestore.collection(usersCollection).doc(userId)
    .onSnapshot({
      includeMetadataChanges: true
    },(response) => {
      const userData = response.data();
      this.setState({
        userData,
        userLoggedIn: true,
      })
    });
  }

  handleUpdateUserData = (userId, fieldName, update) => {
    const user = firestore.collection(usersCollection).doc(userId)
    user.update({
      [fieldName]: update,
    })
  }

  // // // // // //
  // Settings
  // // // // // //

  handleResetPassword = email => {
    auth.sendPasswordResetEmail(email).then(() => {
      this.props.addMessage('An email will be sent if the email exists');
    }).catch(error => {
      this.props.addMessage(error);
    });
  }

  render(){
    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    );
  }

}

// export default FirebaseUserProvider;

const FirebaseUserProviderUpdate = props => (
  <ContextMessageConsumer>
    {({ addMessage }) => (
      <FirebaseUserProvider
        // remember to spread the existing props otherwise you lose any new ones e.g. 'something' that don't come from the provider
        {...props}
        addMessage={addMessage}
      />
    )}
  </ContextMessageConsumer>
);

export default  withRouter(FirebaseUserProviderUpdate);


