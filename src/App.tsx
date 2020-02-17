import React, {
// useState,
// useMemo,
} from 'react';
import c from 'classnames';
import Input from './components/Input';
import './App.scss';

const App = () => (
  <div className="App">
    <h2>Message Syntax Generator</h2>
    <Input
      root
      onSelect={(o: Word) => console.log('onSelect', { o })}
      onChange={(o: any) => console.log({ o })}
    />
    <div className={c('select-area', 'block')} />
  </div>
);

export default App;
