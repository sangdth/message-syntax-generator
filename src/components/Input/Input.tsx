import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Button,
  Checkbox,
  Col,
  Input as AntInput,
  // Popover,
  Row,
  Select,
} from 'antd';
import { usePrevious } from 'react-use';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import c from 'classnames';
import './styles.scss';

const { Option } = Select;

interface Word {
  key: string
  value: string
  index: number
  sub: Word | undefined
}

const Input = (props: any) => {
  const { onChange, onClick, root, value } = props;

  const [text, setText] = useState('');
  const [selected, setSelected] = useState(value);

  const initialNested = useMemo(
    () => {
      if (selected) {
        return !!selected.sub;
      }
      return false;
    },
    [selected],
  );

  const [nested, setNested] = useState(initialNested);

  const words = useMemo(
    () => text.split(' ')
      .filter((s: string) => s)
      .map((s: string, i: number) => ({
        index: i,
        key: `${i}-${Math.random().toString(36).slice(-5)}`,
        value: s,
        sub: undefined,
      })),
    [text],
  );

  const refs = useMemo(
    () => words.map(() => createRef<HTMLSpanElement>()),
    [words],
  );

  const arrowPosition = useMemo(
    () => {
      if (selected) {
        const { index } = selected;
        if (refs && refs[index]) {
          const { current } = refs[index];
          if (current) {
            const { x, left, width } = current.getBoundingClientRect();
            console.log({ x, left });
            return left + width / 2 - 20;
          }
        }
      }
      return 0;
    },
    [refs, selected],
  );

  const wordClick = useCallback(
    (event: any, word: Word) => {
      if (typeof onClick === 'function') {
        onClick(event);
      }
      if (!selected || selected.key !== word.key) {
        setSelected(word);
      } else {
        setSelected(undefined);
      }
    },
    [onClick, selected],
  );

  const prevSelected = usePrevious(selected);
  useEffect(
    () => {
      if (prevSelected && selected && onChange) {
        if (!isEqual(selected, prevSelected)) {
          onChange(selected, words);
        }
      }
    },
    [onChange, prevSelected, selected, words],
  );

  return (
    <>
      <Row type="flex" align="middle" gutter={[10, 10]}>
        {!root && (
          <>
            <Col span={2} offset={1} className="label-col">
              Match:
            </Col>
            <Col span={4}>
              <AntInput />
            </Col>
            <Col span={2} offset={10}>
              <Checkbox
                checked={nested}
                className="checkbox"
                onChange={(e: any) => setNested(e.target.checked)}
              >
                Nested
              </Checkbox>
            </Col>
            <Col span={3} style={{ textAlign: 'right' }}>
              <Button type="primary" icon="plus">
                Add match
              </Button>
            </Col>
          </>
        )}
      </Row>

      <Row type="flex" align="middle" gutter={[10, 10]}>
        {!root && (
          <Col span={2} offset={1} className="label-col">
            Output:
          </Col>
        )}
        <Col span={root ? 24 : 19}>
          <AntInput
            value={text}
            size={root ? 'large' : undefined}
            onChange={(e) => setText(e.target.value)}
          />
        </Col>
      </Row>

      {(root || nested) && text && (
      <Row className="text" type="flex" align="middle" gutter={[10, 10]}>
        <Col span={24} offset={root ? 0 : 3}>
          {words.map((word: Word) => (
            <span
              className={c('word', word.key, {
                selected: selected && word.key === selected.key,
              })}
              key={word.key}
              onClick={(event) => wordClick(event, word)}
              ref={refs[word.index]}
              role="presentation"
            >
              {word.value}
            </span>
          ))}
        </Col>
      </Row>
      )}

      {(root || nested) && selected && (
      <div className={c('actions', { root })}>
        {selected && (
          <div className="my-arrow" style={{ left: arrowPosition }} />
        )}

        <Row type="flex" align="middle" gutter={[10, 10]}>
          <Col span={2} offset={1} className="label-col">
            Key:
          </Col>
          <Col span={4}>
            <AntInput />
          </Col>

          <Col span={2} offset={1} className="label-col">
            Type:
          </Col>
          <Col span={4}>
            <Select
              className="select-options"
              defaultValue="none"
            >
              <Option value="none"> – </Option>
              <Option value="select">select</Option>
              <Option value="plural">plural</Option>
            </Select>
          </Col>
        </Row>

        <Input
          value={selected.sub}
          onChange={(o: any) => setSelected({ ...selected, sub: o })}
        />
      </div>
      )}
    </>
  );
};

Input.PropsTypes = {
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  root: PropTypes.bool,
  value: PropTypes.object,
};

Input.defaultProps = {
  onChange: null,
  onClick: null,
  root: false,
  value: undefined,
};

export default Input;
