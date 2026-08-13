const React = require('react');

const ReactQuill = React.forwardRef((props, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { theme, modules, formats, bounds, placeholder, onChange, onKeyUp, value, ...rest } = props;

  return React.createElement('textarea', {
    ...rest,
    ref,
    value: value || '',
    onChange: (e) => onChange && onChange(e.target.value),
    'data-testid': 'react-quill-mock',
  });
});

module.exports = ReactQuill;
