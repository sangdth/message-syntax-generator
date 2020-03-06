declare interface Word {
  index: number
  value: string
}

declare interface Match {
  match: string
  output?: Ouput
}

declare interface Syntax {
  key: string
  type?: string
  matches?: Match[]
  word: Word
}

declare interface Output {
  value: string
  syntaxes?: Syntax[]
}
