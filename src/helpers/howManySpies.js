export default players => {
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

  return spies
};
