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
  // usePrevious,
} from 'react-use';
// import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import c from 'classnames';
import {
  makeHash,
  updateArray,
} from '../../helpers';
import './styles.scss';

const { Option } = Select;

const Input = (props: any) => {
  const {
    onChange,
    onChangeText,
    onClick,
    onSelect,
    root,
    data,
  } = props;

  const [text, setText] = useState('');
  const [words, setWords] = useState([]);
  const [selected, setSelected] = useState();
  const [cachePosition, setCachedPosition] = useState();
  const [key, setKey] = useState('');
  const [type, setType] = useState('none');
  const [lock, setLock] = useState(false);

  const foundSelected = useMemo(() => {
    if (selected) {
      return data.find((o: any) => o.id === selected.id);
    }
    return undefined;
  }, [data, selected]);

  // From data, if we had a syntax, get the matches from it
  const initialMatches = useMemo(() => {
    if (foundSelected && foundSelected.syntax) {
      return foundSelected.syntax.matches;
    }
    return [{ id: makeHash(), match: '', output: '' }];
  }, [foundSelected]);

  const [matches, setMatches] = useState(initialMatches);

  const { width: ww } = useWindowSize();

  /*
   * Computed variables
   */
  const refs = useMemo(
    () => words.map(() => createRef<HTMLSpanElement>()),
    [words],
  );

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

  /*
   * Callback, functions
   */
  const wordClick = useCallback((e: any, w: Word) => {
    onClick(e, w);
    if (selected === undefined || (selected && selected.id !== w.id)) {
      setSelected(w);
      onSelect(w);
      setLock(true);
    } else {
      setSelected(undefined);
      setLock(false);
    }
  }, [onClick, onSelect, selected]);

  const handleMatches = (i: string, f: string, v: string) => {
    const foundIndex = matches.findIndex((o: Match) => o.id === i);
    if (foundIndex > -1) {
      const tempMatches = [...matches];
      tempMatches.splice(foundIndex, 1, { ...matches[foundIndex], [f]: v });
      setMatches(tempMatches);
    }
  };

  const onSubSelect = (w: Word) => {
    // setSub(w);
    setSelected({ ...selected, sub: w });
    onSelect({ ...selected, sub: w });
  };

  const addBlankMatch = () => {
    const { match } = matches[matches.length - 1];
    if (match) {
      const tempMatches = [...matches];
      tempMatches.push({ id: makeHash(), match: '', output: '' });
      setMatches(tempMatches);
    }
  };

  const handleNestedMatch = (m: Match, s: boolean) => {
    if (s && !m.subData) {
      setMatches(updateArray(matches, { ...m, subData: [] }, 'id'));
    } else {
      setMatches(updateArray(matches, { ...m, subData: null }, 'id'));
    }
  };

  /*
   * Handling side effects
   */
  useEffect(() => {
    if (arrowPosition) {
      setCachedPosition(arrowPosition);
    }
  }, [arrowPosition]);

  useDebounce(() => {
  }, 250, []);

  useEffect(() => {
    if (!text) {
      onChangeText('');
      setSelected(undefined);
      setWords([]);
    }
  }, [onChangeText, text]);

  useDebounce(() => {
    if (text) {
      onChangeText(text);
      setWords(text.split(' ')
        .filter((s: string) => s)
        .map((s: string, i: number) => ({
          id: `${makeHash()}`,
          index: i,
          value: s,
        })));
    }
  }, 250, [text]);

  console.log({ matches });

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
                value={m.match}
                onChange={(e: any) => handleMatches(m.id, 'match', e.target.value)}
              />
            </Col>
            <Col span={2} offset={10}>
              <Checkbox
                checked={!!m.subData}
                className="checkbox"
                onChange={(e: any) => handleNestedMatch(m, e.target.checked)}
              >
                Nested
              </Checkbox>
            </Col>
            <Col span={3} style={{ textAlign: 'right' }}>
              {matches.length - 1 === i ? (
                <Button
                  disabled={!m.match}
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
            disabled={lock}
            value={root ? text : m.output}
            size={root ? 'large' : undefined}
            onChange={(e: any) => {
              if (root) {
                setText(e.target.value);
              } else {
                handleMatches(m.id, 'output', e.target.value);
              }
            }}
          />
        </Col>
      </Row>

      {(root || !!m.subData) && text && (
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

      {(root || !!m.subData) && selected && text && (
      <div className={c('actions', { root })}>
        {selected && (
          <div className="my-arrow" style={{ left: arrowPosition }} />
        )}

        <Row type="flex" align="middle" gutter={[10, 10]}>
          <Col span={2} offset={1} className="label-col">
            Key:
          </Col>
          <Col span={4}>
            <AntInput
              value={key}
              onChange={(e: any) => setKey(e.target.value)}
            />
          </Col>

          <Col span={2} offset={1} className="label-col">
            Type:
          </Col>
          <Col span={4}>
            <Select
              className="select-options"
              defaultValue="none"
              value={type}
              onChange={(t: string) => setType(t)}
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
          onSelect={(w: Word) => onSubSelect(w)}
        />
      </div>
      )}
    </Fragment>
  ));
};

Input.PropsTypes = {
  onChange: PropTypes.func,
  onChangeText: PropTypes.func,
  onClick: PropTypes.func,
  onSelect: PropTypes.func,
  root: PropTypes.bool,
  data: PropTypes.array,
};

Input.defaultProps = {
  onChange: () => {},
  onChangeText: () => {},
  onClick: () => {},
  onSelect: () => {},
  root: false,
  data: [],
};

export default Input;
