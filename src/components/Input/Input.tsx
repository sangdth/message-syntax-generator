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
import { isEqual } from 'lodash';
import {
  useDebounce,
  useWindowSize,
  // usePrevious,
} from 'react-use';
// import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import c from 'classnames';
// import { makeHash, updateArray } from '../../helpers';
import './styles.scss';

const { Option } = Select;
const syntaxTypes = ['date', 'time', 'number', 'plural', 'select', 'selectordinal'];

const Input = (props: any) => {
  const {
    // onChange,
    root,
    output,
  } = props;

  const { width: windowWidth } = useWindowSize();

  const [text, setText] = useState(output.value);
  const [syntaxes, setSyntaxes] = useState<Syntax[]>(output.syntaxes);

  const [words, setWords] = useState<Word[]>([]);
  const [selected, setSelected] = useState<Word>(null);

  const initial = useMemo(() => {
    if (selected) {
      const found = syntaxes.find((s: Syntax) => isEqual(s.word, selected));
      if (found) {
        return {
          key: found.key,
          type: found.type,
          matches: found.matches,
        };
      }
    }
    return { key: '', type: '', matches: [{ match: '' }] };
  }, [selected, syntaxes]);

  const [key, setKey] = useState(initial.key);
  const [type, setType] = useState(initial.type);
  const [matches, setMatches] = useState(initial.matches);
  const [lock, setLock] = useState(false);


  /* -------------------------------------------------------------------
   * Computed variables
   */
  const refs = useMemo(() => words.map(() => createRef<HTMLSpanElement>()), [words]);

  const arrowPosition = useMemo(() => {
    if (selected) {
      const { index } = selected;
      if (refs && refs[index] && refs[index].current) {
        const { left, width } = refs[index].current.getBoundingClientRect();
        return left - ((windowWidth - 1080) / 2) + width / 2 - 20;
      }
    }
    return 0;
  }, [refs, selected, windowWidth]);

  /* -------------------------------------------------------------------
   * Callback, functions
   */
  const wordClick = useCallback((word: Word) => {
    if (!selected || (selected && selected.index !== word.index)) {
      setSelected(word);
      setLock(true);
    } else {
      setSelected(null);
      setLock(false);
    }
  }, [selected]);

  /* -------------------------------------------------------------------
   * Handling side effects
   */
  useDebounce(() => {
    if (text) {
      setWords(text.split(' ')
        .filter((word: string) => word)
        .map((value: string, index: number) => ({
          index,
          value,
        })));
    }
  }, 250, [text]);

  useDebounce(() => {
    if (key && type !== '') {
      const newSyntax: Syntax = {
        key,
        type,
        matches,
        word: selected,
      };

      const tmp = syntaxes.filter((s: Syntax) => words.find((w: Word) => isEqual(s.word, w)));
      const index = tmp.findIndex((s: Syntax) => isEqual(s.word, selected));

      if (index > -1) {
        tmp.splice(index, 1, newSyntax);
      } else {
        tmp.push(newSyntax);
      }

      setSyntaxes(tmp);
    }
  }, 250, [key, type]);

  useEffect(() => {
    if (selected) {
      const found = syntaxes.find((s: Syntax) => isEqual(s.word, selected));
      if (found) {
        setKey(found.key);
        setType(found.type);
        setMatches(found.matches);
      } else {
        setKey('');
        setType('');
        setMatches([{ match: '' }]);
      }
    }
  }, [selected, syntaxes]);

  useEffect(() => {
    if (!text) {
      setSelected(null);
      setWords([]);
    }
  }, [text]);

  console.log({ syntaxes });

  /* -------------------------------------------------------------------
   * Rendering
  return matches.map((match: Match, index: number) => (
    <Fragment key={match.match}>
      <Row type="flex" align="middle" gutter={[10, 10]}>
        {!root && (
          <>
            <Col span={2} offset={1} className="label-col">
              Match:
            </Col>
            <Col span={4}>
              <AntInput
                value={match.match}
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
          <Input
            root={false}
            output={format.output}
            onChange={() => {}}
          />

   */
  return (
    <>
      <Row type="flex" align="middle" gutter={[10, 10]}>
        {!root && (
          <Col span={2} offset={1} className="label-col">
            Output:
          </Col>
        )}
        <Col span={root ? 24 : 19}>
          <AntInput
            disabled={lock}
            value={text}
            size={root ? 'large' : undefined}
            onChange={(e: any) => setText(e.target.value)}
          />
        </Col>
      </Row>

      {text && (
      <Row className="text" type="flex" align="middle" gutter={[10, 10]}>
        <Col span={24} offset={root ? 0 : 3}>
          {words.map((word: Word) => (
            <span
              className={c('word', word.value, {
                selected: selected && word.index === selected.index,
              })}
              key={word.index}
              onClick={() => wordClick(word)}
              ref={refs[word.index]}
              role="presentation"
            >
              {word.value}
            </span>
          ))}
        </Col>
      </Row>
      )}

      {selected && (
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
              onChange={(event: any) => setKey(event.target.value)}
            />
          </Col>

          <Col span={2} offset={1} className="label-col">
            Type:
          </Col>
          <Col span={4}>
            <Select
              className="select-options"
              defaultValue=""
              value={type}
              onChange={(syntaxType: string) => setType(syntaxType)}
            >
              <Option value=""> – </Option>
              {syntaxTypes.map((syntaxType: string) => (
                <Option key={syntaxType} value={syntaxType}>
                  {syntaxType}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>
      )}
    </>
  );
};

Input.PropsTypes = {
  onChange: PropTypes.func.isRequired,
  root: PropTypes.bool.isRequired,
  output: PropTypes.object.isRequired,
};

export default Input;
