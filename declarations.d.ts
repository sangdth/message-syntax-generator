declare interface Match {
  id: string
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
  id: string
  parent?: string
  sub?: Word
  syntax?: Syntax
  value: string
}
