declare interface Match {
  key: string
  match: string
  output: string
}

declare interface Syntax {
  key: string
  matches?: Match[]
  type?: string
}

declare interface Word {
  index: number
  key: string
  parent?: string
  sub?: Word
  syntax?: Syntax
  value: string
}
