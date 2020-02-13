import React, {
  useState,
  useMemo,
} from 'react';
import c from 'classnames';
import {
  Col,
  Input,
  Popover,
  Row,
  Select,
} from 'antd';
import './App.scss';

const { Option } = Select;

const App = () => {
  const [text, setText] = useState('');
  const [selected, setSelected] = useState('');

  const words = useMemo(() => text.split(' ')
    .filter((s) => s)
    .map((w, i) => ({
      key: `${i}-${Math.random().toString(36).slice(-5)}`,
      value: w,
    })), [text]);

  const current = useMemo(() => {
    const found = words.find((o) => o.key === selected);
    if (found) return found;
    return {
      key: '',
      value: '',
    };
  }, [selected, words]);

  const wordClick = (word: any) => {
    setSelected(word.key);
    console.log(word);
  };

  const content = (
    <div className="menu">
      <Row type="flex" align="middle" gutter={[0, 10]}>
        <Col span={6}>Key:</Col>
        <Col span={18}>
          <Input value={current.value} />
        </Col>
      </Row>

      <Row type="flex" align="middle" gutter={[0, 10]}>
        <Col span={6}>Type:</Col>
        <Col span={18}>
          <Select
            defaultValue="select"
            style={{ width: 120 }}
            onChange={(e: any) => console.log(e)}
          >
            <Option value="select">select</Option>
            <Option value="plural">plural</Option>
          </Select>
        </Col>
      </Row>
    </div>
  );

  return (
    <div className="App">
      <Input
        size="large"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="text">
        {words.map(({ key, value }) => (
          <Popover
            key={`${key}-${value}`}
            content={content}
            placement="bottom"
            trigger="click"
          >
            <span
              role="presentation"
              className={c('word', value, { selected: key === selected })}
              onClick={() => wordClick({ key, value })}
            >
              {value}
            </span>
          </Popover>
        ))}
      </div>
    </div>
  );
};

export default App;
