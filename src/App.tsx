import React, {
  useState,
// useMemo,
} from 'react';
import c from 'classnames';
import Input from './components/Input';
import './App.scss';

const App = () => {
  const [match, setMatch] = useState<Match>({
    id: 'root',
    match: '',
    output: {
      value: '',
      syntaxes: [],
    },
  });

  console.log('# Main match: ', { match });

  return (
    <div className="App">
      <h2>Message Syntax Generator</h2>

      <Input
        root
        match={match}
        onChange={(m: Match) => setMatch(m)}
      />
      <div className={c('select-area', 'block')} />
    </div>
  );
};

export default App;
