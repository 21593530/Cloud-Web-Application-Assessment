export function tokensMatch(first: string[], second: string[]) {
  return first.length === second.length && first.every((token, index) => token === second[index]);
}

export function tokensMatchInEitherDirection(first: string[], second: string[]) {
  return tokensMatch(first, second) || tokensMatch(first, [...second].reverse());
}
