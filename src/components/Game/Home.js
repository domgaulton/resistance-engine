import React, { useState, useContext, useEffect } from 'react';
import { FirebaseConsumer } from "../../context/FirebaseProvider";
import howManyVotes from '../../helpers/howManyVotes'

function Game(props) {
  const [ votes, setVotes ] = useState([]);
  const [ characterRevealed, setCharacterRevealed ] = useState(false)
  const { gameObject, findGame, setSpies, setSelection, setVote, setReveal, nextRound, passDealer, resetApp } = useContext(FirebaseConsumer);

  // Game Info
  const { gameName, round, dealer, players, admin, spies } = gameObject;
  const userName = window.localStorage.getItem('resistanceEngineUserName');
  const userIndex = players && players.indexOf(userName);
  const playersLength = players && players.length;
  const roundSelection = gameObject[`round${round}Selection`];
  const roundSelectionLength = roundSelection && roundSelection.length;
  const roundVote = gameObject[`round${round}Vote`];
  const roundVoteLength = roundVote && roundVote.length;
  const roundReveal = gameObject[`round${round}Reveal`];
  const roundRevealLength = roundReveal && roundReveal.length;
  
  // Game Dynamics
  const dealerName = players && players[gameObject.dealer];
  const userHasVoted = roundVote && (roundVote.find(vote => vote.index === userIndex) !== undefined)
  const spiesSet = spies && spies.length;
  const selectionFinished = roundSelectionLength === howManyVotes(gameObject);
  const allVoted = roundVoteLength === playersLength;
  const votePassed = roundVoteLength && roundVote.filter(vote => vote.vote === true).length > playersLength / 2;
  const isAccused = roundSelection && roundSelection.includes(userIndex);
  const allRevealed = roundRevealLength === howManyVotes(gameObject);
  const revealSpies = roundReveal && roundReveal.filter(vote => vote.vote === true);
  const revealSpiesLength = revealSpies && revealSpies.length;

  // Personal Info
  const isAdmin = userName === admin;
  const isDealer = userIndex === dealer;
  
  const handleSetSpies = () => {
    setSpies(gameName, players);
  }

  useEffect(() => {
    findGame(props.game);
  }, [props.game, findGame]);

  useEffect(() => {
    if (votes.length) {
      setSelection(props.game, round, votes);
      if ( votes.length === howManyVotes(gameObject) ) {
        setVotes([]);
      }
    }
  }, [setSelection, props.game, round, votes]);

  useEffect(() => {
    if ( characterRevealed === true ) {
      let timer1 = setTimeout(() => setCharacterRevealed(false), 2000)

      return () => {
        clearTimeout(timer1)
      }
    }
    
  }, [characterRevealed])

  const resetLocalStorage = () => {
    window.localStorage.removeItem('resistanceEngineGameName');
    window.localStorage.removeItem('resistanceEngineUserName');
    resetApp();
  }

  const getRoundPhase = () => {
    if ( !spiesSet ) {
      return 'Waiting for admin to set spies...'
    } else if ( !selectionFinished ) {
      if ( round === 0 ) {
        return `Spies Set! Dealer to select ${howManyVotes(gameObject)} names...`
      } else {
        return `Dealer to select ${howManyVotes(gameObject)} names...`
      }
    } else if ( !allVoted ) {
      return 'Names Selected - Are you happy with selection?'
    } else if ( !allRevealed ) {
      if ( !votePassed ) {
        return 'Votes did not pass - dealer to pass'
      } else {
        return 'Votes have passed - waiting for players to reveal'
      }
      
    } else if ( allRevealed ) {
      if ( revealSpiesLength ) {
        return `Round lost - ${revealSpiesLength} spy card${revealSpiesLength > 1 ? 's' : ''}! - Waiting for dealer to pass!`
      } else {
        return `Round won (No spy cards played) - Waiting for dealer to pass!`
      }
    }
    
  }

  const resistanceOrSpy = () => {
    let spy = false;
    gameObject.spies.map(spyIndex => {
      if ( gameObject.players[spyIndex] === userName ) {
        spy = true;
      }
      return spy;
    })
    return spy;
  }

  const getOtherSpies = () => {
    let spyArray = []
    spies.map(spyIndex => {
      spyArray.push(` ${players[spyIndex]}`)
    })
    return spyArray;
  }

  const handleRoundVote = (bool) => {
    setVote(props.game, gameObject.round, userIndex, bool);
  }

  const handleVoteClick = index => {
    setVotes(prevArray => [...prevArray, index]);
  }

  const handleRoundReveal = vote => {
    setReveal(props.game, gameObject.round, userIndex, vote)
  }

  const hasUserRevealed = () => {
    const userReveal = roundReveal && roundReveal.find(vote => vote.index === userIndex);
    if ( userReveal ) {
      return true;
    } else {
      return false;
    }
  }

  const showHideCharacter = (e) => {
    setCharacterRevealed(true)
  }

  const showVotes = index => {
    let voted = ' N';
    let temp = [];
    roundVote.map(item => {
      if ( item.vote === true) {
        temp.push(item.index);
      }
      return temp;
    })
    if ( temp.includes(index) ) {
      voted = ' Y';
    }
    return voted;
  }

  const handleNextRound = () => {
    const spies = roundReveal.filter(vote => vote.vote === true);
    // TO DO - get how many spies required
    const spiesPassed = spies.length > 0
    console.log(props.game, spiesPassed)
    let nextDealer = dealer + 1;
    if ( nextDealer >= playersLength ) {
      nextDealer = 0;
    }
    nextRound(props.game, round, spiesPassed, nextDealer)
  }

  const handlePassDealer = () => {
    let nextDealer = dealer + 1;
    if ( nextDealer >= playersLength ) {
      nextDealer = 0;
    }
    passDealer(props.game, round, nextDealer)
  }

  return (
    <React.Fragment>
      <div className="gameScreen">
        <div className="gameScreen__rounds">
          {[...Array(5)].map((item, index) => {
            const roundVoted = gameObject.rounds && gameObject.rounds[index] !== undefined;
            return (
              <div className={`gameScreen__round-marker ${roundVoted ? gameObject.rounds[index].vote ? 'lost' : 'won' : ''}`} />
            )
          })}
        </div>
        <div>
          {howManyVotes(gameObject) === roundVoteLength ? (
            <p>Total Votes for Spies: {roundVote.filter(item => item.vote === 1).length}</p>
          ) : null}
        </div>
        <h1>{gameObject.gameName}</h1>
        <h2>Round {gameObject.round + 1}{dealer !== '' ? ` - ${dealerName} is the dealer` : ''}</h2>
        <h3>{getRoundPhase()}</h3>

        <ul>
          {gameObject.players && gameObject.players.map((player, index) => {
            const nameObject = (
              <React.Fragment>
                {gameObject.dealer === index ? '* ' : ''} 
                {player}
                {allVoted ? showVotes(index) : null}
              </React.Fragment>
            )
            return (
              <li 
                key={index}
                className={roundSelection && roundSelection.includes(index) ? 'voted' : ''}
              >
                {userIndex === dealer && roundSelectionLength !== howManyVotes(gameObject) ? (
                  <button className="button button--vote" disabled={votes.includes(index)} onClick={() => handleVoteClick(index)}>{nameObject}</button>
                ) : (
                  nameObject
                )}
                
              </li>
            )
          })}
        </ul>

        {spiesSet ? (
          <React.Fragment>
            {characterRevealed ? (
              <React.Fragment>
                <h3>You are {resistanceOrSpy() ? 'a spy!' : 'in the resistance!'}</h3>
                {resistanceOrSpy() ? (
                  <p>{`(The other spies are; ${getOtherSpies()}`})</p>
                ) : null}
              </React.Fragment>
            ) : <button className="button button--action" onClick={() => showHideCharacter()}>Reveal my role</button> }
          </React.Fragment>
        ) : (
          null
        )}

        {isDealer ? (
          allVoted && !votePassed ? (
            <React.Fragment>
              <p>Vote didn't pass</p>
              <div className="button-wrapper">
                <button className="button button--action" onClick={() => handlePassDealer()}>Pass the Dealer</button>
              </div>
            </React.Fragment>
          ) : null
        ) : (
          null
        )}

        {allRevealed ? (
          isDealer ? (
            <button className="button button--neutral" onClick={() => handleNextRound()}>Pass the Dealer</button>
          ) : (
            null
          )
        ) : null}

        {allVoted ? (
          votePassed && !allRevealed ? (
            isAccused ? (
              <React.Fragment>
                <p>Vote was passed and you were nominated - What card will you play?</p>
                <div className="button-wrapper">
                  <button className="button button--positive" disabled={hasUserRevealed()} onClick={() => handleRoundReveal(false)}>Resistance</button>
                  <button className="button button--negative" disabled={hasUserRevealed() || resistanceOrSpy() === false} onClick={() => handleRoundReveal(true)}>Spy</button>
                </div>
              </React.Fragment>
            ) : (
              <p>Waiting for nominated players to show their hand</p>
            )
          ) : null
        ) : null}

        {selectionFinished && !allVoted ? (
          <React.Fragment>
            <p>Are you happy with this selection?</p>
            <div className="button-wrapper">
              <button className="button button--positive" disabled={userHasVoted} onClick={() => handleRoundVote(true)}>Yes</button>
              <button className="button button--negative" disabled={userHasVoted} onClick={() => handleRoundVote(false)}>No</button>
            </div>
          </React.Fragment>
        ) : (
          null
        )}

        {isAdmin && !spiesSet ? (
          <div>
            <h3>As Admin - Click to randomly allocate spies and the dealer</h3>
            <div className="button-wrapper">
              <button className="button button--action" disabled={gameObject.players.length < 5} onClick={() => handleSetSpies()}>Set Spies</button>
            </div>
          </div>
        ) : (
          null
        )}

        <div style={{marginTop: '100px'}}>
          <p>Return to homescreen - this will log you out of the game</p>
          <div className="button-wrapper">
            <button className="button button--end-game" onClick={() => resetLocalStorage()}>End Game</button>
          </div>
        </div>
      </div>
      
    </React.Fragment>
  );
}

export default Game;
