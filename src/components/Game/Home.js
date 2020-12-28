import React, { useState, useContext, useEffect } from 'react';
import { FirebaseConsumer } from "../../context/FirebaseProvider";
import howManyNominations from '../../helpers/howManyNominations'
import howManySpiesRequired from '../../helpers/howManySpiesRequired'

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
  const selectionFinished = roundSelectionLength === howManyNominations(gameObject);
  const allVoted = roundVoteLength === playersLength;
  const votePassed = roundVoteLength && roundVote.filter(vote => vote.vote === true).length > playersLength / 2;
  const isAccused = roundSelection && roundSelection.includes(userIndex);
  const allRevealed = roundRevealLength === howManyNominations(gameObject);
  const revealSpies = roundReveal && roundReveal.filter(vote => vote.vote === true);
  const revealSpiesLength = revealSpies && revealSpies.length;

  const roundsWonBySpies = gameObject.rounds && gameObject.rounds.filter(vote => vote.vote === true)
  const roundsWonBySpiesLength = roundsWonBySpies && roundsWonBySpies.length
  const roundsWonByResistance = gameObject.rounds && gameObject.rounds.filter(vote => vote.vote === false)
  const roundsWonByResistanceLength = roundsWonByResistance && roundsWonByResistance.length

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
      if ( votes.length === howManyNominations(gameObject) ) {
        setVotes([]);
      }
    }
  }, [setSelection, props.game, round, votes, gameObject]);

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
      return 'Waiting for 5 players to sign in so that the admin can randomly allocate spies.'
    } else if ( !selectionFinished ) {
      if ( round === 0 ) {
        return `Spies Set! Dealer to select ${howManyNominations(gameObject)} names.`
      } else {
        return `Dealer to select ${howManyNominations(gameObject)} names.`
      }
    } else if ( !allVoted ) {
      return 'Names Selected - Are you happy with selection?'
    } else if ( !allRevealed ) {
      if ( !votePassed ) {
        return 'Votes did not pass - dealer to pass.'
      } else {
        return `Votes have passed - waiting for players to reveal. ${howManySpiesRequired(gameObject)} sp${howManySpiesRequired(gameObject) === 1 ? 'y' : 'ies'} need to sabotage!`;
      }
      
    } else if ( allRevealed ) {
      if ( revealSpiesLength === howManySpiesRequired(gameObject) ) {
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
    let spyString = ''
    spies.map((spyIndex, index) => {
      let spyName = ''
      if (index + 1 === spies.length) {
        spyName = ` and ${players[spyIndex]}`;
      } else if ( index  === spies.length ) {
        spyName = `, ${players[spyIndex]}`;
      } else {
        spyName = `${players[spyIndex]}`;
      }
      return spyString += spyName;
    })
    return spyString;
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
        <h1>{gameObject.gameName}</h1>
        <div className="gameScreen__rounds">
          {[...Array(5)].map((item, index) => {
            const roundData = gameObject[`round${index}Reveal`];
            const nomiationsRequired = howManyNominations({players, round: index})
            const roundVotes = roundData && roundData.length;
            let roundWon = undefined;
            if ( roundVotes === nomiationsRequired ) {
              const spiesRequired = howManySpiesRequired({players, round: index});
              const spiesRevealed = roundData.filter(item => item.vote === true).length
              if ( spiesRevealed >= spiesRequired ) {
                roundWon = true;
              } else {
                roundWon = false;
              }
            }
            return (
              <div key={index} className={`gameScreen__round-marker ${roundWon !== undefined ? roundWon ? 'lost' : 'won' : ''}`} />
            )
          })}
        </div>
        {(roundsWonBySpiesLength >= 3 || roundsWonByResistanceLength >= 3) ? (
          <React.Fragment>
            <h1>{`The ${roundsWonBySpiesLength >= 3 ? 'spies have' : 'resistance has'} won!`}</h1>
            <p>{`The spies were ${getOtherSpies()}`}!</p>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div>
              {howManyNominations(gameObject) === roundVoteLength ? (
                <p>Total Votes for Spies: {roundVote.filter(item => item.vote === 1).length}</p>
              ) : null}
            </div>
            
            <h2>Round {gameObject.round + 1}{dealer !== '' ? ` - ${dealerName} is the dealer` : ''}</h2>
            <h3>{getRoundPhase()}</h3>

            <p><strong>Players:</strong></p>
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
                    {userIndex === dealer && roundSelectionLength !== howManyNominations(gameObject) ? (
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
                ) : <div className="button-wrapper"><button className="button button--action" onClick={() => showHideCharacter()}>Reveal my role</button></div> }
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
                <p>As Admin - Click to randomly allocate spies and the dealer</p>
                <div className="button-wrapper">
                  <button className="button button--action" disabled={gameObject.players.length < 5} onClick={() => handleSetSpies()}>Set Spies</button>
                </div>
              </div>
            ) : (
              null
            )}

            <div className="gameScreen__restart-game">
              <p>Return to homescreen - this will log you out of the game</p>
              <div className="button-wrapper">
                <button className="button button--end-game" onClick={() => resetLocalStorage()}>End Game</button>
              </div>
            </div>
            </React.Fragment>
          )}
      </div>
      
    </React.Fragment>
  );
}

export default Game;
