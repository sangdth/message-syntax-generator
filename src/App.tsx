import React, {
  useState,
  useMemo,
} from 'react';
import c from 'classnames';
import {
  Col,
  Row,
  Select,
} from 'antd';
import Input from './components/Input';
import './App.scss';

const { Option } = Select;

const App = () => {
  const content = (
    <div className="menu">
      <Row type="flex" align="middle" gutter={[10, 10]}>
        <Col span={8} className="label-col">Key:</Col>
        <Col span={16}>
          <Input />
        </Col>
      </Row>

      <Row type="flex" align="middle" gutter={[10, 10]}>
        <Col span={8} className="label-col">Type:</Col>
        <Col span={16}>
          <Select
            // defaultValue={value.type}
            style={{ width: 120 }}
            // onChange={(t: string) => setValue({ ...value, type: t })}
          >
            <Option value="none"> – </Option>
            <Option value="select">select</Option>
            <Option value="plural">plural</Option>
          </Select>
        </Col>
      </Row>

      <Row type="flex" align="middle" gutter={[10, 10]}>
        <Col span={8} className="label-col">
          Match / Output
        </Col>
        <Col span={16}>
          <Row type="flex" align="middle" gutter={[5, 5]}>
            <Col span={12}>
              <Input />
            </Col>
            <Col span={12}>
              <Input />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );

  return (
    <div className="App">
      <Input onClick={(o: any) => console.log({ o })} />
      <div className={c('select-area', 'block')} />
    </div>
  );
};

export default App;
