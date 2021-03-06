import React, { useState, useContext, useEffect } from 'react';
import { FirebaseConsumer } from "../../context/FirebaseProvider";
import howManyNominations from '../../helpers/howManyNominations'
import howManySpiesRequired from '../../helpers/howManySpiesRequired'

function Game(props) {
  const [ votes, setVotes ] = useState([]);
  const [ characterRevealed, setCharacterRevealed ] = useState(false)
  const { gameObject, findGame, setSpies, setSelection, setVote, setReveal, nextRound, passDealer, resetApp } = useContext(FirebaseConsumer);

  // Game Info
  const { gameName, gameStarted, round, dealer, players, admin, spies } = gameObject;
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

  const howManyRounds = 5;  
  const roundWins = [...Array(howManyRounds)].map((item, index) => {

    const roundData = gameObject[`round${index}Reveal`];
    const nomiationsRequired = howManyNominations({players, round: index})
    const roundVotes = roundData && roundData.length;
    let spyWins = undefined;
    if ( roundVotes === nomiationsRequired ) {
      const spiesRequired = howManySpiesRequired({players, round: index});
      const spiesRevealed = roundData.filter(item => item.vote === true).length
      if ( spiesRevealed >= spiesRequired ) {
        spyWins = 1;
      } else {
        spyWins = 0;
      }
    }
    return spyWins
  })

  const roundsWonBySpiesLength = roundWins.filter(item => item === 1).length;
  const roundsWonByResistanceLength = roundWins.filter(item => item === 0).length;

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
    let message = '';
    let instruction = '';
    if ( !spiesSet ) {
      message = 'Waiting for between 5 and 10 players to sign in so that the admin can randomly allocate spies.'
    } else if ( !selectionFinished ) {
      if ( round === 0 ) {
        message = `${howManySpiesRequired(gameObject)} spies set!`
        instruction = `Dealer to select ${howManyNominations(gameObject)} names.`
      } else {
        message = `Dealer to select ${howManyNominations(gameObject)} names.`
      }
    } else if ( !allVoted ) {
      message = 'Names Selected'
      instruction = 'Are you happy with selection?'
    } else if ( !allRevealed ) {
      if ( !votePassed ) {
        message = 'Votes did not pass.'
        instruction = 'Waiting for dealer to pass.'
      } else {
        message = 'Votes have passed - waiting for players to reveal.';
        if ( howManySpiesRequired(gameObject) > 1 ) {
          instruction = `${howManySpiesRequired(gameObject)} spies needed to sabotage!`
        }
      }
    } else if ( allRevealed ) {
      if ( revealSpiesLength >= howManySpiesRequired(gameObject) ) {
        message = `Round lost - ${revealSpiesLength} spy card${revealSpiesLength > 1 ? 's' : ''}!`
        instruction = 'Waiting for dealer to pass!'
      } else {
        if ( howManySpiesRequired(gameObject) === 1 ) {
          message = `Round won (No spy cards played)`
          instruction = 'Waiting for dealer to pass!'
        } else {
          message = `Round won (But ${revealSpiesLength} spy card${revealSpiesLength > 1 ? 's' : ''}! was played!)`
          instruction = 'Waiting for dealer to pass!'
        }
      }
    }
    return {message, instruction}
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
      } else if ( index + 2 === spies.length) {
        spyName = `${players[spyIndex]}`;
      } else {
        spyName = `${players[spyIndex]}, `;
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
    let voted = ' - Voted: No';
    let temp = [];
    roundVote.map(item => {
      if ( item.vote === true) {
        temp.push(item.index);
      }
      return temp;
    })
    if ( temp.includes(index) ) {
      voted = ' - Voted: Yes';
    }
    return voted;
  }

  const handleNextRound = () => {
    let nextDealer = dealer + 1;
    if ( nextDealer >= playersLength ) {
      nextDealer = 0;
    }
    nextRound(props.game, round, nextDealer)
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
        <h1>{gameObject.gameName} {gameStarted ? `- ${players.length} players` : null}</h1>
        {gameStarted ? (
          <table className="gameScreen__scores">
            <thead>
              <tr>
                <th></th>
                {[...Array(howManyRounds)].map((item, index) => {
                  return (
                    <td key={`round-${index}`} className={index === round ? 'currentRound' : null}>{index + 1}</td>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Win / Lose?</td>
                {[...Array(howManyRounds)].map((item, index) => {
                  return (
                    <td key={`win-lose-${index}`} className="gameScreen__scores-row">
                      <span className={`gameScreen__round-marker ${roundWins[index] !== undefined ? roundWins[index] ? 'lost' : 'won' : ''}`} />
                    </td>
                  )
                })}
              </tr>
              <tr>
                <td>Players</td>
                {[...Array(howManyRounds)].map((item, index) => {
                  return (
                    <td key={`spies-${index}`}>{howManyNominations({players, round: index})} {howManySpiesRequired({players, round: index}) > 1 ? '*' : null}</td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        ) : null}
        

        {(roundsWonBySpiesLength >= 3 || roundsWonByResistanceLength >= 3) ? (
          <React.Fragment>
            <h1>{`The ${roundsWonBySpiesLength >= 3 ? 'spies have' : 'resistance has'} won!`}</h1>
            <p>{`The spies were ${getOtherSpies()}`}!</p>
            <div className="gameScreen__restart-game">
              <p>Return to homescreen - this will log you out of the game</p>
              <div className="button-wrapper">
                <button className="button button--end-game" onClick={() => resetLocalStorage()}>End Game</button>
              </div>
            </div>      
          </React.Fragment>
        ) : (
          <React.Fragment>            
            <h2>Round {gameObject.round + 1}{dealer !== '' ? ` - ${dealerName} is the dealer` : ''}</h2>
            <h3>{getRoundPhase().message}</h3>

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
                    className={`${roundSelection && roundSelection.includes(index) ? 'voted' : ''}`}
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

            {getRoundPhase().instruction !== '' ? (
              <h2 className="gameScreen__instruction">{getRoundPhase().instruction}</h2>
            ) : null}
           

            {spiesSet ? (
              <React.Fragment>
                {characterRevealed ? (
                  <React.Fragment>
                    <h3>You are {resistanceOrSpy() ? 'a spy!' : 'in the resistance!'}</h3>
                    {resistanceOrSpy() ? (
                      <p>{`(The other spies are ${getOtherSpies()}`})</p>
                    ) : null}
                  </React.Fragment>
                ) : <div className="button-wrapper"><button className="button button--primary" onClick={() => showHideCharacter()}>Reveal my role</button></div> }
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
                <button className="button button--action" onClick={() => handleNextRound()}>Pass the Dealer</button>
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
