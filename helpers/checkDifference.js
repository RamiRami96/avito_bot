const checkDifference = (cards, res) =>
  res.filter(({ link: id1 }) => !cards.some(({ link: id2 }) => id2 === id1));

module.exports = checkDifference;
