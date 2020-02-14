import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  // Col,
  Input as AntInput,
  // Popover,
  // Row,
  // Select,
} from 'antd';
import PropTypes from 'prop-types';
import c from 'classnames';
import './styles.scss';

const Input = (props: any) => {
  const { onClick } = props;

  const [text, setText] = useState('');
  const [selected, setSelected] = useState({
    key: '',
    value: '',
    index: 0,
  });

  const words = useMemo(() => text.split(' ')
    .filter((s) => s)
    .map((w, i) => ({
      index: i,
      key: `${i}-${Math.random().toString(36).slice(-5)}`,
      value: w,
    })), [text]);

  const wordClick = useCallback((e: any, s: any) => {
    setSelected(s);
    if (onClick) {
      onClick(e);
    }
  }, [onClick]);

  return (
    <div>
      <AntInput
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="text">
        {words.map(({ index, key, value }) => (
          <span
            role="presentation"
            className={c('word', value, {
              selected: selected && key === selected.key,
            })}
            onClick={(e) => wordClick(e, { index, key, value })}
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
};

Input.PropsTypes = {
  onChange: PropTypes.func,
  onClick: PropTypes.func,
};

Input.defaultProps = {
  onChange: null,
  onClick: null,
};

export default Input;
