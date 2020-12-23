import React, { useState } from 'react';
import { firestore } from "../firebase/firebase";

const Context = React.createContext();
export const FirebaseConsumer = Context;

const pageCollection = process.env.REACT_APP_FIREBASE_PAGE_COLLECTION;

function FirebaseProvider(props) {

  const handleCreateGame = (gameId) => {
    console.log(gameId, pageCollection)
    firestore.collection(pageCollection).doc(gameId).set({
      gameObject: {
        gameId,
      }, 
    })
    .then(() => {
      firestore.collection(pageCollection).doc(gameId)
      .onSnapshot({
        includeMetadataChanges: true
      },response => {
        const update = response.data().fireStore;
        setPageState(prevState => ({
          ...prevState,
          gameObject: update,
        }))
      });
    })
    .catch(error => {
      // console.error("Error writing document: ", error);
      console.log(error)
    });
  }

  const handleSetPageActive = (pageId) => {
    const collection = firestore.collection(pageCollection).doc(pageId)
    collection.update({
      fireStore: {
        pageId,
        deviceReady: false,
        pageActive: true,
        orientation: {},
      }, 
    })
    .then(() => {
      firestore.collection(pageCollection).doc(pageId)
      .onSnapshot({
        includeMetadataChanges: true
      },response => {
        const update = response.data().fireStore;
        setPageState(prevState => ({
          ...prevState,
          fireStore: update,
        }))
      });
    })
  }

  const handleSetOrientation = (pageId, orientation) => {
    const collection = firestore.collection(pageCollection).doc(pageId)
    collection.update({
      fireStore: {
        pageId,
        pageActive: true,
        deviceReady: true,
        orientation,
      },
    })
  }

  const [pageState, setPageState] = useState({
    gameObject: {},
    createGame: (pageId) => handleCreateGame(pageId),
    setPageActive: (pageId) => handleSetPageActive(pageId),
    setOrientation: (pageId, orientation) => handleSetOrientation(pageId, orientation),
  });

  return (
    <Context.Provider value={pageState}>
      {props.children}
    </Context.Provider>
  );
}

export default FirebaseProvider;


