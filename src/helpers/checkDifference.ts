import type { Card } from "../interfaces/cards";

const checkDifference = (cards: Card[], htmlResult: Card[]): Card[] =>
  htmlResult.filter(
    ({ link: id1 }) => !cards.some(({ link: id2 }) => id2 === id1)
  );

export default checkDifference;
