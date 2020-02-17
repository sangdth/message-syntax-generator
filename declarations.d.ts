declare interface Match {
  id: string
  match: string
  output: string
  subData?: Word[]
}

declare interface Syntax {
  key: string
  matches?: Match[]
  type?: string
}

declare interface Word {
  index: number
  id: string
  syntax?: Syntax
  value: string
}
