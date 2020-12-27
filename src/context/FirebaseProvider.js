import React, { useState } from 'react';
import { firestore, firebase } from "../firebase/firebase";

const Context = React.createContext();
export const FirebaseConsumer = Context;

const pageCollection = process.env.REACT_APP_FIREBASE_PAGE_COLLECTION;

function FirebaseProvider(props) {

  const validatePrompt = (promptText) => {
    let input = prompt(promptText);

    if (input === null || input === "") {
      alert("You must enter a name!");
      return validatePrompt(promptText);
    } else if (!/^[a-zA-Z0-9]+$/.test(input)) {
      alert("Please only enter letters or numbers");
      return validatePrompt(promptText)
    }
    return input
  }

  const handleCreateGame = () => {
    const gameName = validatePrompt('What is the name of the game?')
    const adminName = validatePrompt('What is your name?')
    firestore.collection(pageCollection).doc(gameName).set({
      gameName,
      admin: adminName,
      gameStarted: false,
      players: [
        adminName
      ],
      round: 0,
      dealer: '',
      rounds: [],
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

  const handleJoinGame = () => {
    const gameName = validatePrompt('What is name of the game?')
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

  const handleSetSpies = (gameName, players) => {
    // First assign random spies
    let spies = 2;
    
    switch(players) {
      case 5:
      case 6:
        spies = 2;
        break
      case 7:
      case 8:
      case 9:
        spies = 3;
        break;
      case 10:
        spies = 4
        break;
      default:
        spies = 2;
    }
    let randomArray = [];
    let i;
    for (i = 0; i < spies; i++) {
      const randomNumber = Math.floor(Math.random() * players.length)
      if ( !randomArray.includes(randomNumber) ) {
        randomArray.push(randomNumber)
      }
    }

    const collection = firestore.collection(pageCollection).doc(gameName);
    collection.update({
      gameStarted: true,
      spies: randomArray,
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

    

    // Score is set

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
    console.log(vote)
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
  const handleNextRound = (gameName, round, vote, dealer) => {
    console.log(vote)
    const collection = firestore.collection(pageCollection).doc(gameName)
    collection.update({
      rounds: firebase.firestore.FieldValue.arrayUnion({round, vote}),
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
    console.log(dynamicSelection, dynamicVote)
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
    console.log('reset')
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
    nextRound: (gameName, round, vote, dealer ) => handleNextRound(gameName, round, vote, dealer ),
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


