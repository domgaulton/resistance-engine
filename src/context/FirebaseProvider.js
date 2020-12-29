import React, { useState } from 'react';
import { firestore, firebase } from "../firebase/firebase";
import howManySpies from '../helpers/howManySpies';

const Context = React.createContext();
export const FirebaseConsumer = Context;

const pageCollection = process.env.REACT_APP_FIREBASE_PAGE_COLLECTION;

function FirebaseProvider(props) {

  const validatePrompt = (promptText) => {
    const input = prompt(promptText);
    if ( input === null ) {
      return;
    } else if (input === "") {
      alert("You must enter a name!");
      return validatePrompt(promptText);
    } else if (!/^[a-zA-Z0-9]+$/.test(input)) {
      alert("Please only enter letters or numbers");
      return validatePrompt(promptText)
    }
    return input;
  }

  const handleCreateGame = () => {
    const gameName = validatePrompt('What is the name of the game?')
    if ( gameName ) {
      const adminName = validatePrompt('What is your name?')
      if ( adminName ) {
        firestore.collection(pageCollection).doc(gameName).set({
          gameName,
          admin: adminName,
          gameStarted: false,
          players: [
            adminName
          ],
          round: 0,
          dealer: '',
        })
        .then(() => {
          firestore.collection(pageCollection).doc(gameName)
          .onSnapshot({
            includeMetadataChanges: true
          },response => {
            const update = response.data();
            setPageState(prevState => ({
              ...prevState,
              gameObject: update,
            }))
          });
          window.localStorage.setItem('resistanceEngineGameName', gameName)
          window.localStorage.setItem('resistanceEngineUserName', adminName)
        })
        .catch(error => {
          // console.error("Error writing document: ", error);
          console.log(error)
        });
      }
    }
  }

  const handleJoinGame = () => {
    const gameName = validatePrompt('What is name of the game?')
    if ( gameName ) {
      const checkCollection = firestore.collection(pageCollection).doc(gameName)
      checkCollection.get().then(response => {
        if (response.exists) {
          const update = response.data();
          if ( !update.gameStarted ) {
            const userName = validatePrompt('What is your name?')
            const collection = firestore.collection(pageCollection).doc(gameName)
            collection.update({
              players: firebase.firestore.FieldValue.arrayUnion(userName),
            })
            .then(() => {
              firestore.collection(pageCollection).doc(gameName)
              .onSnapshot({
                includeMetadataChanges: true
              },response => {
                const update = response.data();
                setPageState(prevState => ({
                  ...prevState,
                  gameObject: update,
                }))
              });
              window.localStorage.setItem('resistanceEngineGameName', gameName)
              window.localStorage.setItem('resistanceEngineUserName', userName)
            })
            .catch(error => {
              // console.error("Error writing document: ", error);
              console.log(error)
            });
          } else {
            alert('This game has already started so you cannot join')
            return;     
          }
        } else {
          alert('Game not found')
          return;
        }
      }).catch(function(error) {
          console.log("Error getting document:", error);
      });
    }
  }

  const handleFindGame = (gameName) => {
    const collection = firestore.collection(pageCollection).doc(gameName)
    collection.get()
    .then(() => {
      firestore.collection(pageCollection).doc(gameName)
      .onSnapshot({
        includeMetadataChanges: true
      },response => {
        const update = response.data();
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

  const getRandomNumbers = (existingArray, lengthRequired, maxNumber) => {
    let array = [...existingArray]
    const randomNumber = Math.floor(Math.random() * maxNumber)
    if ( array.length !== lengthRequired ) {
      if ( !array.includes(randomNumber) ) {
        array.push(randomNumber)
        return getRandomNumbers(array, lengthRequired, maxNumber)
      } else {
        return getRandomNumbers(array, lengthRequired, maxNumber)
      }
    } else {
      return array;
    }
  }

  const handleSetSpies = (gameName, players) => {
    const randomSpies = getRandomNumbers([], howManySpies(players.length), players.length);

    const collection = firestore.collection(pageCollection).doc(gameName);
    collection.update({
      gameStarted: true,
      spies: randomSpies,
      dealer: Math.floor(Math.random() * players.length),
    })
    .then(() => {
      firestore.collection(pageCollection).doc(gameName)
      .onSnapshot({
        includeMetadataChanges: true
      },response => {
        const update = response.data();
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

  // Let dealer select players
  const handleSetSelection = (gameName, roundNumber, votes) => {
    const collection = firestore.collection(pageCollection).doc(gameName)
    const dynamicRound = `round${roundNumber}Selection`;
    collection.update({
      [dynamicRound]: votes,
    })
    .then(() => {
      firestore.collection(pageCollection).doc(gameName)
      .onSnapshot({
        includeMetadataChanges: true
      },response => {
        const update = response.data();
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

  // Players Vote
  const handleSetVote = (gameName, roundNumber, index, vote) => {
    const collection = firestore.collection(pageCollection).doc(gameName)
    const dynamicApproval = `round${roundNumber}Vote`;
    collection.update({
      [dynamicApproval]: firebase.firestore.FieldValue.arrayUnion({index, vote}),
    })
    .then(() => {
      firestore.collection(pageCollection).doc(gameName)
      .onSnapshot({
        includeMetadataChanges: true
      },response => {
        const update = response.data();
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

  // Players Vote
  const handleSetReveal = (gameName, roundNumber, index, vote) => {
    const collection = firestore.collection(pageCollection).doc(gameName)
    const dynamicApproval = `round${roundNumber}Reveal`;
    collection.update({
      [dynamicApproval]: firebase.firestore.FieldValue.arrayUnion({index, vote}),
    })
    .then(() => {
      firestore.collection(pageCollection).doc(gameName)
      .onSnapshot({
        includeMetadataChanges: true
      },response => {
        const update = response.data();
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

  // Next Round
  const handleNextRound = (gameName, round, dealer) => {
    const collection = firestore.collection(pageCollection).doc(gameName)
    collection.update({
      round: firebase.firestore.FieldValue.increment(1),
      dealer,
    })
    .then(() => {
      firestore.collection(pageCollection).doc(gameName)
      .onSnapshot({
        includeMetadataChanges: true
      },response => {
        const update = response.data();
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

  // Next Round
  const handlePassDealer = (gameName, round, dealer) => {
    const dynamicSelection = `round${round}Selection`;
    const dynamicVote = `round${round}Vote`;
    const collection = firestore.collection(pageCollection).doc(gameName)
    collection.update({
      [dynamicSelection]: firebase.firestore.FieldValue.delete(),
      [dynamicVote]: firebase.firestore.FieldValue.delete(),
      dealer,
    })
    .then(() => {
      firestore.collection(pageCollection).doc(gameName)
      .onSnapshot({
        includeMetadataChanges: true
      },response => {
        const update = response.data();
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

  const handleResetApp = () => {
    setPageState(prevState => ({
      ...prevState,
      gameObject: {},
    }))
  }


  const [pageState, setPageState] = useState({
    // admin: '',
    gameObject: {},
    createGame: (gameName, adminName) => handleCreateGame(gameName, adminName),
    joinGame: (gameName) => handleJoinGame(gameName),
    findGame: (gameName) => handleFindGame(gameName),
    setSpies: (gameName, players) => handleSetSpies(gameName, players),
    setSelection: (gameName, roundNumber, votes) => handleSetSelection(gameName, roundNumber, votes),
    setVote: (gameName, roundNumber, index, vote) => handleSetVote(gameName, roundNumber, index, vote),
    setReveal: (gameName, roundNumber, index, vote) => handleSetReveal(gameName, roundNumber, index, vote),
    nextRound: (gameName, round, dealer ) => handleNextRound(gameName, round, dealer ),
    passDealer: (gameName, round, dealer ) => handlePassDealer(gameName, round, dealer ),
    resetApp: () => handleResetApp(),
  });

  return (
    <Context.Provider value={pageState}>
      {props.children}
    </Context.Provider>
  );
}

export default FirebaseProvider;


