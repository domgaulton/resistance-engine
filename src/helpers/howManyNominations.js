export default gameObject => {
  let players = 0
  if (gameObject.players && gameObject.players.length) {
    players = gameObject.players.length;
  } else {
    players = gameObject.players;
  }
  const round = gameObject.round;

  let nominiations;  
  switch(players) {
    
    // 5 players
    case 5:
      switch(round) {
        case 0:
          nominiations = 2;
          break
        case 1:
          nominiations = 3;
          break
        case 2:
          nominiations = 2;
          break
        case 3:
          nominiations = 3;
          break
        case 4:
          nominiations = 3;
          break
        default:
          nominiations = '';
      }
      break

    // 6 players
    case 6:
      switch(round) {
        case 0:
          nominiations = 2;
          break
        case 1:
          nominiations = 3;
          break
        case 2:
          nominiations = 4;
          break
        case 3:
          nominiations = 3;
          break
        case 4:
          nominiations = 4;
          break
        default:
          nominiations = '';
      }
      break  

    // 7 players
    case 7:
      switch(round) {
        case 0:
          nominiations = 2;
          break
        case 1:
          nominiations = 3;
          break
        case 2:
          nominiations = 3;
          break
        case 3:
          nominiations = 4;
          break
        case 4:
          nominiations = 4;
          break
        default:
          nominiations = '';
      }
      break  

    // 8, 9 or 10 players
    case 8:
    case 9:
    case 10:
      switch(round) {
        case 0:
          nominiations = 3;
          break
        case 1:
          nominiations = 4;
          break
        case 2:
          nominiations = 4;
          break
        case 3:
          nominiations = 5;
          break
        case 4:
          nominiations = 5;
          break
        default:
          nominiations = '';
      }
      break  
    

    default:
    nominiations = '';
  }

  return nominiations;
};
