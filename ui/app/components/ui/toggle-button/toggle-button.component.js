import React from 'react';
import PropTypes from 'prop-types';
import ReactToggleButton from 'react-toggle-button';

const trackStyle = {
  width: '40px',
  height: '24px',
  padding: '0px',
  borderRadius: '26px',
  border: '2px solid #8E8E8E',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const offTrackStyle = {
  ...trackStyle,
  border: '2px solid #8E8E8E',
};

const thumbStyle = {
  width: '18px',
  height: '18px',
  display: 'flex',
  boxShadow: 'none',
  alignSelf: 'center',
  borderRadius: '50%',
  position: 'relative',
};

const colors = {
  activeThumb: {
    base: '#1677FE',
  },
  inactiveThumb: {
    base: '#1677FE',
  },
  active: {
    base: '#ffffff',
    hover: '#ffffff',
  },
  inactive: {
    base: '#e5e5e5',
    hover: '#e5e5e5',
  },
};

const ToggleButton = (props) => {
  const { value, onToggle, offLabel, onLabel } = props;

  const modifier = value ? 'on' : 'off';

  return (
    <div className={`toggle-button toggle-button--${modifier}`}>
      <ReactToggleButton
        value={value}
        onToggle={onToggle}
        activeLabel=""
        inactiveLabel=""
        trackStyle={value ? trackStyle : offTrackStyle}
        thumbStyle={thumbStyle}
        thumbAnimateRange={[3, 18]}
        colors={colors}
      />
      <div className="toggle-button__status">
        <span className="toggle-button__label-off">{offLabel}</span>
        <span className="toggle-button__label-on">{onLabel}</span>
      </div>
    </div>
  );
};

ToggleButton.propTypes = {
  value: PropTypes.bool,
  onToggle: PropTypes.func,
  offLabel: PropTypes.string,
  onLabel: PropTypes.string,
};

export default ToggleButton;
