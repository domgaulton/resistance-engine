# Firebase Boilerplate

## Requirements
* Firebase account with Auth, Firestore and Spark (free) account
* Heroku account

## Overview
* Uses `create-react-app` 
* User context wraps app and routes
* Can create user with Auth, this sets a user in a firestore collection
* Deploy to heroku

## Instructions

### Github
1. Clone the repo

### Firebase Setup

1. Go to Firebase and set up an account and project (GA optional) - https://console.firebase.google.com/
2. Once set up you will see `Get started by adding Firebase to your app` - proceed by creating a web app within your project. For this tutorial we will create a dev and prod account so set up your project with `--dev` at the end in this case. 
3. Click yes to hosting
4. Press next when instructed to add SDK (we will add this later)
5. Install `npm install -g firebase-tools`
6. Run through the instructions below (see 'Firebase Deploy Instructions') and when prompted in the terminal you need to select `Firestore` and `Hosting`
7. When you are back on the dashboard click on the app and go to your settings. Scroll to the bottom and you will the SDK snippet, toggle on the config and copy the values into your `.env` or `.env.production` file.
8. In firebase console click on authentication and enable email / password authentication
9. Click in Cloud Firestore and this up. Change the rules to;
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write;
    }
  }
}
```
10. To add your production database, auth and hosting follow instructions above and then from your terminal type `firebase use --add`. When prompted for an alias use `production`. 

### Firebase Deploy Instructions
https://firebase.google.com/docs/hosting/multisites?authuser=0#set_up_deploy_targets
* Navigate to the root of your project;
1. `firebase login`
2. `firebase init`
3. `firebase deploy` || `firebase deploy --only hosting:[specific-hosting-name]`

### Project set up / Walkthrough

1. `npm install` and then `npm start`
2. You will see a login screen and a 'register' link below
3. When you register a user it does two things, it creates a user in the firebase auth and it also creates a user in the firestore user collection. To add more info to the firestore user collection see `src/context/ContextFirebaseUserProvider.js`