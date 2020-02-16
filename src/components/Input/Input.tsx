import React, {
  createRef,
  Fragment,
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
import {
  useDebounce,
  useWindowSize,
  usePrevious,
} from 'react-use';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import c from 'classnames';
import './styles.scss';

const { Option } = Select;

const Input = (props: any) => {
  const {
    onChange,
    onClick,
    onSelect,
    root,
    value,
  } = props;

  const makeHash = () => Math.random().toString(36).slice(-9);

  const initialSyntax = useMemo(() => {
    if (value && value.syntax) {
      return value.syntax;
    }
    return [{ key: '', type: 'none', matches: [] }];
  }, [value]);

  const initialInputText = {
    match: '',
    key: '',
    output: '',
  };

  const [text, setText] = useState('');
  const [words, setWords] = useState([]);
  const [inputText, setInputText] = useState(initialInputText);
  const [selected, setSelected] = useState();
  const [cachePosition, setCachedPosition] = useState();
  const [sub, setSub] = useState(value ? value.sub : null);
  const [syntax, setSyntax] = useState(initialSyntax);

  useEffect(() => {
    if (!text) {
      setSelected(undefined);
    }
  }, [text]);

  useDebounce(() => {
    setWords(text.split(' ')
      .filter((s: string) => s)
      .map((s: string, i: number) => ({
        index: i,
        id: `${makeHash()}`,
        value: s,
      })));
  }, 350, [text]);

  const initialMatches = useMemo(() => {
    if (selected && selected.syntax) {
      return selected.syntax.matches;
    }
    return [{ id: makeHash(), match: '', output: '' }];
  }, [selected]);

  const [matches, setMatches] = useState(initialMatches);

  const initialNested = useMemo(() => {
    if (selected) {
      return !!selected.sub;
    }
    return false;
  }, [selected]);

  const [nested, setNested] = useState(initialNested);

  const refs = useMemo(
    () => words.map(() => createRef<HTMLSpanElement>()),
    [words],
  );

  const { width: ww } = useWindowSize();

  const arrowPosition = useMemo(() => {
    if (selected) {
      const { index } = selected;
      if (refs && refs[index]) {
        const { current: cc } = refs[index];
        // TODO: Every times the text change, refs are created again
        // which make the current be destroyed
        if (cc) {
          const { left: l, width: w } = cc.getBoundingClientRect();
          return l - ((ww - 1080) / 2) + w / 2 - 20;
        }
        // TODO: this is a hacky way to keep the arrow at position
        // the correct way is preserving the ref of word
        return cachePosition;
      }
    }
    return 0;
  }, [cachePosition, refs, selected, ww]);

  // const prevPosition = usePrevious(arrowPosition);

  useEffect(() => {
    if (arrowPosition) {
      setCachedPosition(arrowPosition);
    }
  }, [arrowPosition]);

  // console.log({ arrowPosition, prevPosition });

  const wordClick = useCallback((e: any, w: Word) => {
    onClick(e, w);
    if (selected === undefined || (selected && selected.id !== w.id)) {
      setSelected(w);
    } else {
      setSelected(undefined);
    }
  }, [onClick, selected]);

  const handleMatches = (k: string, f: string, v: string) => {
    const foundIndex = matches.findIndex((o: Match) => o.id === k);
    if (foundIndex > -1) {
      const tempMatches = [...matches];
      tempMatches.splice(foundIndex, 1, { ...matches[foundIndex], [f]: v });
      setMatches(tempMatches);
    }
  };

  useDebounce(() => {
    const { key, match, output } = inputText;
    let oldMatch;
    const foundIndex = matches.findIndex((o: Match) => o.match === match);
    if (foundIndex > -1) {
      oldMatch = matches[foundIndex];
    }
    setSyntax({
      ...syntax,
      key,
    });
  }, 200, [inputText]);

  const handleInputText = useCallback((e: any, k: string) => {
    setInputText({ ...inputText, [k]: e.target.value });
  }, [inputText]);

  const addBlankMatch = () => {
    const { match } = matches[matches.length - 1];
    if (match) {
      const tempMatches = [...matches];
      tempMatches.push({ key: makeHash(), match: '', output: '' });
      setMatches(tempMatches);
    }
  };

  const prevSelected = usePrevious(selected);

  useEffect(() => {
    if (prevSelected && selected) {
      if (!isEqual(selected, prevSelected)) {
        onSelect(selected);
        // onChange(selected, words);
      }
    }
  }, [onChange, onSelect, prevSelected, selected, words]);

  return matches.map((m: Match, i: number) => (
    <Fragment key={m.id}>
      <Row type="flex" align="middle" gutter={[10, 10]}>
        {!root && (
          <>
            <Col span={2} offset={1} className="label-col">
              Match:
            </Col>
            <Col span={4}>
              <AntInput
                onChange={(e: any) => handleMatches(m.id, 'match', e.target.value)}
              />
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
              {matches.length - 1 === i ? (
                <Button
                  type="primary"
                  icon="plus"
                  onClick={addBlankMatch}
                />
              ) : (
                <Button
                  icon="minus"
                  onClick={() => {}}
                />
              )}
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
          {words.map((w: Word) => (
            <span
              className={c('word', w.id, {
                selected: selected && w.id === selected.id,
              })}
              key={w.id}
              onClick={(e: any) => wordClick(e, w)}
              ref={refs[w.index]}
              role="presentation"
            >
              {w.value}
            </span>
          ))}
        </Col>
      </Row>
      )}

      {(root || nested) && selected && text && (
      <div className={c('actions', { root })}>
        {selected && (
          <div className="my-arrow" style={{ left: arrowPosition }} />
        )}

        <Row type="flex" align="middle" gutter={[10, 10]}>
          <Col span={2} offset={1} className="label-col">
            Key:
          </Col>
          <Col span={4}>
            <AntInput onChange={(e: any) => handleInputText(e, 'key')} />
          </Col>

          <Col span={2} offset={1} className="label-col">
            Type:
          </Col>
          <Col span={4}>
            <Select
              className="select-options"
              defaultValue="none"
              onChange={(v: string) => setSyntax({ ...syntax, type: v })}
            >
              <Option value="none"> – </Option>
              <Option value="date">Date</Option>
              <Option value="number">Number</Option>
              <Option value="plural">Plural</Option>
              <Option value="select">Select</Option>
              <Option value="selectordinal">Select Ordinal</Option>
            </Select>
          </Col>
        </Row>

        <Input
          value={selected.sub}
          onSelect={(o: Word) => setSub(o)}
        />
      </div>
      )}
    </Fragment>
  ));
};

Input.PropsTypes = {
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  onSelect: PropTypes.func,
  root: PropTypes.bool,
  value: PropTypes.object,
};

Input.defaultProps = {
  onChange: () => {},
  onClick: () => {},
  onSelect: () => {},
  root: false,
  value: undefined,
};

export default Input;
