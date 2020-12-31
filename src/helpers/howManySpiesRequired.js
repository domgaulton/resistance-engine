export default gameObject => {
  let players = 0
  if (gameObject.players && gameObject.players.length) {
    players = gameObject.players.length;
  } else {
    players = gameObject.players;
  }
  const round = gameObject.round;

  let spies = 1;  
  switch(players) {
    case 7:
    case 8:
    case 9:
    case 10:
      switch(round) {
        case 0:
        case 1:
        case 2:
          spies = 1;
          break
        case 3:
          spies = 2;
          break
        case 4:
          spies = 1;
          break
        default:
          spies = 1;
          break
      }
      break
    default:
      spies = 1;
    break
  }

  return spies
};
