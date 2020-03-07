import React, {
  useState,
// useMemo,
} from 'react';
import c from 'classnames';
import Input from './components/Input';
import './App.scss';

const App = () => {
  const [output, setOutput] = useState<Output>({
    value: '',
    syntaxes: [],
  });

  console.log('# Main output: ', { output });

  return (
    <div className="App">
      <h2>Message Syntax Generator</h2>

      <Input
        root
        output={output}
        onChange={(out: Output) => setOutput(out)}
      />
      <div className={c('select-area', 'block')} />
    </div>
  );
};

export default App;
