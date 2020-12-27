import React, {   useContext } from 'react';
import { FirebaseConsumer } from "../../context/FirebaseProvider";
import Game from '../Game/Home'

function App(props) {
  const { gameObject, createGame, joinGame } = useContext(FirebaseConsumer);

  // const snakeCase = string => {
  //   return string.replace(/\W+/g, " ")
  //   .split(/ |\B(?=[A-Z])/)
  //   .map(word => word.toLowerCase())
  //   .join('_');
  // };

  const handleCreateGame = () => {
    // const gameName = prompt('Unique name for your game?');
    // const userName = prompt('Unique name for your user name?');
    // if (gameName && userName) {
    //   createGame(gameName, userName);
    // } else {
    //   return;
    // }

    createGame();
  }

  const handleJoinGame = () => {
    // const gameName = prompt('What is the name of your game?');
    // if ( gameName ) {
    //   joinGame(gameName);
    // } else {
    //   return;
    // }

    joinGame();
  }

  // console.log(gameObject, window.localStorage.getItem('resistanceEngine'))

  const gameId = gameObject.name || window.localStorage.getItem('resistanceEngineGameName');
  // const userName = gameObject.name || window.localStorage.getItem('resistanceEngineName');

  return gameObject.name === undefined && window.localStorage.getItem('resistanceEngineGameName') === null ? (
    <div className="homescreen">
      <div className="homescreen_admin">
        <h1>Resistance Engine</h1>
        <p>Anon voting and engine for playing resistance</p>
        <h3>Start a new game (create host and admin)</h3>
        <button className="button button--positive" onClick={() => handleCreateGame()}>Create A New Game</button>
        <h3>Join existing game</h3>
        <button className="button button--action" onClick={() => handleJoinGame()}>Join An Existing Game</button>
      </div>
    </div>
  ) : (
    <Game game={gameId} />
  );
}

export default App;
