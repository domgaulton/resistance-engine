export default gameObject => {

  const players = gameObject.players && gameObject.players.length;
  const round = gameObject.round;
  
  let votes;  
  switch(players) {
    
    // 5 players
    case 5:
      switch(round) {
        case 0:
          votes = 2;
          break
        case 1:
          votes = 3;
          break
        case 2:
          votes = 2;
          break
        case 3:
          votes = 3;
          break
        case 4:
          votes = 3;
          break
        default:
          votes = '';
      }
      break

    // 6 players
    case 6:
      switch(round) {
        case 0:
          votes = 2;
          break
        case 1:
          votes = 3;
          break
        case 2:
          votes = 4;
          break
        case 3:
          votes = 3;
          break
        case 4:
          votes = 4;
          break
        default:
          votes = '';
      }
      break  
    default:
      votes = '';
  }

  return votes;
};
