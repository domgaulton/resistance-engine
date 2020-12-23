import React, { useEffect, useContext } from 'react';
import { FirebaseConsumer } from "../../context/FirebaseProvider";

function App(props) {
  const { gameObject, createGame, joinGame } = useContext(FirebaseConsumer);

  // useEffect(() => {
  //   const dateId = Date.now().toString();
  //   createPage(dateId);
  // }, [createPage]);

  const handleCreateGame = () => {
    const x = prompt('Unique name for your game?');
    createGame(x);
  }

  const handleJoinGame = () => {
    const x = prompt('What is the name of your game?');
    // joinGame(x);
    console.log(x);
  }

  return (
    <div className="admin">
      <h1>Resistance Engine</h1>
      <p>Anon voting and engine for playing resistance</p>
      <h3>Start a new game (create host and admin)</h3>
      <button onClick={() => handleCreateGame()}>Create Game</button>
      <h3>Join existing game</h3>
      <button onClick={() => handleJoinGame()}>Join Game</button>
    </div>
  );
}

export default App;
