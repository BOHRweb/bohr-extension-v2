import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MaterialTextField from '@material-ui/core/TextField';

const inputLabelBase = {
  transform: 'none',
  transition: 'none',
  position: 'initial',
  color: '#bfbfbf',
};

const styles = {
  materialLabel: {
    '&$materialFocused': {
      color: '#9BA9BC',
    },
    '&$materialError': {
      color: '#9BA9BC',
    },
    'fontSize': '16px',
    'fontWeight': '400',
    'color': '#9BA9BC',
  },
  materialFocused: {
    'color': '#071D3D',
  },
  materialUnderline: {
    'color': '#071D3D!important',
    '&:after': {
      borderBottom: '2px solid $blue',
    },
  },
  materialError: {},
  materialWhitePaddedRoot: {
    color: '#9BA9BC',
  },
  materialWhitePaddedInput: {
    'padding': '8px',
    'color': '#071D3D',
    '&::placeholder': {
      color: '#9BA9BC',
    },
  },
  materialWhitePaddedFocused: {
    color: '#071D3D',
  },
  materialWhitePaddedUnderline: {
    'color': '#071D3D',
    '&:after': {
      borderBottom: '2px solid #071D3D',
    },
  },
  // Non-material styles
  formLabel: {
    color: '#9b9b9b!important',
    '&$formLabelFocused': {
      color: 'pink',
    },
    '&$materialError': {
      color: 'pink',
    },
  },
  formLabelFocused: {},
  inputFocused: {},
  inputRoot: {
    "zIndex":99,
    'color': '#071D3D!important',
    'muiInputRoot':{
      color:'#071D3D!important'
    },
    'label + &': {
      marginTop: '9px',
      color:'#071D3D',
    },
    'border': '1px solid #BBC0C5',
    'height': '48px',
    'borderRadius': '6px',
    'padding': '0 16px',
    'display': 'flex',
    'alignItems': 'center',
    'color':'#071D3D!important',
    '&$inputFocused': {
      border: '1px solid $blue',
    },
  },
  largeInputLabel: {
    ...inputLabelBase,
    fontSize: '16px',
    color:'#071D3D',
  },
  inputLabel: {
    ...inputLabelBase,
    fontSize: '14px',
    color:'#bfbfbf !important',
  },
  inputMultiline: {
    lineHeight: 'initial !important',
  },
};

const getMaterialThemeInputProps = ({
  dir,
  classes: { materialLabel, materialFocused, materialError, materialUnderline },
  startAdornment,
  min,
  max,
  autoComplete,
}) => ({
  InputLabelProps: {
    classes: {
      root: materialLabel,
      focused: materialFocused,
      error: materialError,
    },
  },
  InputProps: {
    startAdornment,
    classes: {
      underline: materialUnderline,
    },
    inputProps: {
      dir,
      min,
      max,
      autoComplete,
    },
  },
});

const getMaterialWhitePaddedThemeInputProps = ({
  dir,
  classes: {
    materialWhitePaddedRoot,
    materialWhitePaddedFocused,
    materialWhitePaddedInput,
    materialWhitePaddedUnderline,
  },
  startAdornment,
  min,
  max,
  autoComplete,
}) => ({
  InputProps: {
    startAdornment,
    classes: {
      root: materialWhitePaddedRoot,
      focused: materialWhitePaddedFocused,
      input: materialWhitePaddedInput,
      underline: materialWhitePaddedUnderline,
    },
    inputProps: {
      dir,
      min,
      max,
      autoComplete,
    },
  },
});

const getBorderedThemeInputProps = ({
  dir,
  classes: {
    formLabel,
    formLabelFocused,
    materialError,
    largeInputLabel,
    inputLabel,
    inputRoot,
    input,
    inputFocused,
  },
  largeLabel,
  startAdornment,
  min,
  max,
  autoComplete,
}) => ({
  InputLabelProps: {
    shrink: true,
    className: largeLabel ? largeInputLabel : inputLabel,
    classes: {
      root: formLabel,
      focused: formLabelFocused,
      error: materialError,
    },
  },
  InputProps: {
    startAdornment,
    disableUnderline: true,
    classes: {
      root: inputRoot,
      input,
      focused: inputFocused,
    },
    inputProps: {
      dir,
      min,
      max,
      autoComplete,
    },
  },
});

const themeToInputProps = {
  'material': getMaterialThemeInputProps,
  'bordered': getBorderedThemeInputProps,
  'material-white-padded': getMaterialWhitePaddedThemeInputProps,
};

const TextField = ({
  error,
  classes,
  theme,
  startAdornment,
  largeLabel,
  dir,
  min,
  max,
  autoComplete,
  ...textFieldProps
}) => {
  const inputProps = themeToInputProps[theme]({
    classes,
    startAdornment,
    largeLabel,
    dir,
    min,
    max,
    autoComplete,
  });

  return (
    <MaterialTextField
      error={Boolean(error)}
      helperText={error}
      {...inputProps}
      {...textFieldProps}
    />
  );
};

TextField.defaultProps = {
  error: null,
  dir: 'auto',
  theme: 'bordered',
};

TextField.propTypes = {
  error: PropTypes.string,
  classes: PropTypes.object,
  dir: PropTypes.string,
  theme: PropTypes.oneOf(['bordered', 'material', 'material-white-padded']),
  startAdornment: PropTypes.element,
  largeLabel: PropTypes.bool,
  min: PropTypes.number,
  max: PropTypes.number,
  autoComplete: PropTypes.string,
};

export default withStyles(styles)(TextField);
