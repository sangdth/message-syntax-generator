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
  const { onChange, onClick, root, value } = props;

  const makeHash = () => Math.random().toString(36).slice(-5);

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
  const [inputText, setInputText] = useState(initialInputText);
  const [current, setCurrent] = useState();
  const [cachePosition, setCachedPosition] = useState();
  const [sub, setSub] = useState(value ? value.sub : null);
  const [syntax, setSyntax] = useState(initialSyntax);

  const words = useMemo(
    () => text.split(' ')
      .filter((s: string) => s)
      .map((s: string, i: number) => ({
        index: i,
        key: `${i}-${makeHash()}`,
        value: s,
      })),
    [text],
  );

  const selected = useMemo(() => {
    if (current !== undefined) {
      return {
        ...words[current],
        sub,
        syntax,
      };
    }
    return undefined;
  }, [current, sub, syntax, words]);

  const initialMatches = useMemo(() => {
    if (selected && selected.syntax) {
      return selected.syntax.matches;
    }
    return [{ key: makeHash(), match: '', output: '' }];
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
    if (current !== undefined) {
      if (refs && refs[current]) {
        const { current: cc } = refs[current];
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
  }, [cachePosition, current, refs, ww]);

  // const prevPosition = usePrevious(arrowPosition);

  useEffect(() => {
    if (arrowPosition) {
      setCachedPosition(arrowPosition);
    }
  }, [arrowPosition]);

  // console.log({ arrowPosition, prevPosition });

  const wordClick = useCallback((e: any, w: Word, i: number) => {
    if (typeof onClick === 'function') {
      onClick(e, w, i);
    }
    if (current === undefined || (selected && selected.key !== w.key)) {
      setCurrent(i);
    } else {
      setCurrent(undefined);
    }
  }, [current, onClick, selected]);

  const handleMatches = (k: string, f: string, v: string) => {
    const foundIndex = matches.findIndex((o: Match) => o.key === k);
    if (foundIndex > -1) {
      const tempMatches = [...matches];
      tempMatches.splice(foundIndex, 1, { ...matches[foundIndex], [f]: v });
      setMatches(tempMatches);
    }
  };

  const [isReady] = useDebounce(() => {
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

  console.log({ matches });

  const handleInputText = useCallback((e: any, k: string) => {
    setInputText({ ...inputText, [k]: e.target.value });
  }, [inputText]);

  const addBlankMatch = () => {
    const { match, output } = matches[matches.length - 1];
    console.log('asdfsadf', { match, output });
    if (match) {
      console.log('123');
      const tempMatches = [...matches];
      console.log({ tempMatches });
      tempMatches.push({ key: makeHash(), match: '', output: '' });
      setMatches(tempMatches);
    }
    console.log('adflll');
  };

  const prevSelected = usePrevious(selected);

  useEffect(() => {
    if (prevSelected && selected && onChange) {
      if (!isEqual(selected, prevSelected)) {
        onChange(selected, words);
      }
    }
  }, [onChange, prevSelected, selected, words]);

  return matches.map((m: Match, i: number) => (
    <Fragment key={m.key}>
      <Row type="flex" align="middle" gutter={[10, 10]}>
        {!root && (
          <>
            <Col span={2} offset={1} className="label-col">
              Match:
            </Col>
            <Col span={4}>
              <AntInput
                // onChange={(e: any) => handleInputText(e, 'match')}
                onChange={(e: any) => handleMatches(m.key, 'match', e.target.value)}
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
              {matches.length - 1 === i && (
              <Button
                type="primary"
                icon="plus"
                onClick={addBlankMatch}
              >
                Add match
              </Button>
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
          {words.map((w: Word, i: number) => (
            <span
              className={c('word', w.key, {
                selected: selected && w.key === selected.key,
              })}
              key={w.key}
              onClick={(e) => wordClick(e, w, i)}
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
          onChange={(o: any) => setSub(o)}
        />
      </div>
      )}
    </Fragment>
  ));
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
