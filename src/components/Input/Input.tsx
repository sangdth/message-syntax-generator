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
  Divider,
  Input as AntInput,
  // Popover,
  Row,
  Select,
} from 'antd';
import { isEqual } from 'lodash';
import {
  useDebounce,
  useWindowSize,
  usePrevious,
} from 'react-use';
// import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import c from 'classnames';

import { makeHash } from '../../helpers';
import './styles.scss';

const { Option } = Select;
const syntaxTypes = ['date', 'time', 'number', 'plural', 'select', 'selectordinal'];

const Input = (props: any) => {
  const {
    onChange,
    root,
    match,
  } = props;

  const { width: windowWidth } = useWindowSize();

  const [syntaxes, setSyntaxes] = useState<Syntax[]>(match.output.syntaxes || []);

  const [selected, setSelected] = useState<Word>(null);

  const initial = useMemo(() => {
    const id = makeHash();
    if (selected) {
      const found = syntaxes.find((s: Syntax) => isEqual(s.word, selected));
      if (found) {
        return {
          key: found.key,
          type: found.type,
          matches: found.matches,
          inputs: found.matches.reduce((o: any, m: Match) => ({
            ...o,
            [m.id]: m.match,
          }), {}),
          outputs: found.matches.reduce((o: any, m: Match) => ({
            ...o,
            [m.id]: m.output.value,
          }), {}),
        };
      }
    }
    return {
      key: '',
      type: '',
      matches: [{
        id,
        match: '',
        output: { value: '' },
      }],
      inputs: { [id]: '' },
      outputs: { [id]: '' },
    };
  }, [selected, syntaxes]);

  const [text, setText] = useState(match.output.value);
  const [outputs, setOutputs] = useState(initial.outputs);
  const [words, setWords] = useState([]);
  const [key, setKey] = useState(initial.key);
  const [type, setType] = useState(initial.type);
  const [matches, setMatches] = useState(initial.matches);
  const [lock, setLock] = useState(false);
  const [matchInputs, setMatchInputs] = useState(initial.inputs);

  const refs = useMemo(() => words.map(() => createRef<HTMLSpanElement>()), [words]);

  /* -------------------------------------------------------------------
   * Computed variables
   */
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
      const found = syntaxes.find((s: Syntax) => isEqual(s.word, word));
      // If syntax does not exist, generate one
      if (!found) {
        setSyntaxes([...syntaxes, {
          key: '',
          type: '',
          matches,
          word,
        }]);
      }
      setLock(true);
    } else {
      setSelected(null);
      setLock(false);
    }
  }, [matches, selected, syntaxes]);

  const setMatch = useCallback((m: Match, i: number) => {
    const tmpMatches = [...matches];
    console.log('set sub match: ', match.id, match);
    tmpMatches.splice(i, 1, m);
    setMatches(tmpMatches);
  }, [match, matches]);

  /* -------------------------------------------------------------------
   * Handling side effects
   */
  useDebounce(() => {
    if (text.length > 0) {
      const wordsObject = text.split(' ')
        .filter((word: string) => word)
        .map((value: string, index: number) => ({
          id: match.id,
          ref: createRef<HTMLSpanElement>(),
          index,
          value,
        }));
      setWords(wordsObject);
    }
    onChange({ ...match, output: { ...match.output, value: text } });
  }, 250, [text]);

  /*
  const ids = Object.keys(outputs);
  if (ids.length > 0) {
  const wordsObject = ids.reduce((o: any, id: string) => ({
    ...o,
    [id]: outputs[id].split(' ')
      .filter((word: string) => word)
      .map((value: string, index: number) => ({ id, index, value })),
  }), {});
  setWords(wordsObject);
  */

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
  }, 250, [key, type, matches]);

  const prevMatchInputs = usePrevious(matchInputs);

  useEffect(() => {
    if (Object.keys(matchInputs).length > 0 && !isEqual(matchInputs, prevMatchInputs)) {
      setMatches((matches as Array<Match>).map((m: Match) => ({
        ...m,
        match: matchInputs[m.id],
      })));
    }
  }, [matchInputs, matches, prevMatchInputs]);

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
        setMatches([{
          id: makeHash(),
          match: '',
          output: { value: '' },
        }]);
      }
    }
  }, [selected, syntaxes]);

  useEffect(() => {
    if (Object.keys(outputs).length === 0) {
      setSelected(null);
      setWords([]);
    }
  }, [outputs]);

  /* -------------------------------------------------------------------
   * Rendering
   */

  return (
    <>
      {(matches as Array<Match>).map((match: Match, index: number) => (
        <Fragment key={match.id}>

          {!root && <Divider className="divider" />}

          <Row type="flex" align="middle" gutter={[10, 10]}>
            {!root && (
              <>
                <Col span={2} offset={1} className="label-col">
                  Match #{index}
                </Col>
                <Col span={4}>
                  <AntInput
                    value={matchInputs[match.id]}
                    onChange={(e: any) => setMatchInputs({
                      ...matchInputs,
                      [match.id]: e.target.value,
                    })}
                  />
                </Col>

                <Col span={2} offset={11}>
                  <Checkbox
                    checked
                    className="checkbox"
                  >
                    Nested
                  </Checkbox>
                </Col>

                {matches.length - 1 === index && (
                  <>
                    <Col span={1}>
                      <Button
                        icon="minus"
                        disabled={matches.length === 1}
                        onClick={() => setMatches(
                          matches.filter((m: Match) => m.id !== match.id),
                        )}
                      />
                    </Col>

                    <Col span={1} style={{ textAlign: 'right' }}>
                      <Button
                        type="primary"
                        icon="plus"
                        disabled={!match.match}
                        onClick={() => setMatches([...matches, {
                          id: makeHash(),
                          match: '',
                          output: { value: '' },
                        }])}
                      />
                    </Col>
                  </>
                )}
              </>
            )}
          </Row>

          <Row type="flex" align="middle" gutter={[10, 10]}>
            {!root && ( // output label, except the root
            <Col span={2} offset={1} className="label-col">
              Output
            </Col>
            )}
            <Col span={root ? 24 : 19}>
              <AntInput
                disabled={lock}
                size={root ? 'large' : undefined}
                value={root ? text : outputs[match.id]}
                onChange={(e: any) => (root
                  ? setText(e.target.value)
                  : setOutputs({
                    ...outputs,
                    [match.id]: e.target.value,
                  }))}
              />
            </Col>
          </Row>

          <Row className="text" type="flex" align="middle" gutter={[10, 10]}>
            <Col span={24} offset={root ? 0 : 3}>
              {(root ? words : outputs[match.id].split(' ')
                .filter((word: string) => word)
                .map((value: string, index: number) => ({
                  id: match.id,
                  ref: createRef<HTMLSpanElement>(),
                  index,
                  value,
                }))).map((word: Word) => (
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

          {(root || !!match.output) && selected && (
          <div className={c('actions', { root })}>
            {selected && (
            <div className="my-arrow" style={{ left: arrowPosition }} />
            )}

            <Row type="flex" align="middle" gutter={[10, 10]}>
              <Col span={2} offset={1} className="label-col">
                Key
              </Col>
              <Col span={4}>
                <AntInput
                  value={key}
                  onChange={(event: any) => setKey(event.target.value)}
                />
              </Col>

              <Col span={2} offset={1} className="label-col">
                Type
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

            right before
            {match.output && (
            <Input
              root={false}
              match={match}
              onChange={(m: Match) => setMatch(m, index)}
            />
            )}
          </div>
          )}
        </Fragment>
      ))}
    </>
  );
};

Input.PropsTypes = {
  onChange: PropTypes.func.isRequired,
  root: PropTypes.bool.isRequired,
  match: PropTypes.object.isRequired,
};

export default Input;
