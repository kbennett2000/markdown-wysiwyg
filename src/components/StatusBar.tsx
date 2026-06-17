interface Props {
  words: number
  chars: number
}

export default function StatusBar({ words, chars }: Props) {
  const readMin = Math.max(1, Math.round(words / 200))
  return (
    <div className="status">
      <span>
        <b>{words}</b> words
      </span>
      <span>
        <b>{chars}</b> chars
      </span>
      <span>~{readMin} min read</span>
      <span className="badge">MARKDOWN · GFM</span>
    </div>
  )
}
