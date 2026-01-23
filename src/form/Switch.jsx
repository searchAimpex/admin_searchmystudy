import React from 'react';
import styled from 'styled-components';

const Switch = ({ statusHandler, ele }) => {
  return (
    <StyledWrapper>
      <div className="checkbox tooltip-wrapper">
        <input
          id={`cbx-${ele._id}`}
          type="checkbox"
          checked={!!ele?.block}
          onChange={(e) => statusHandler(ele._id, e.target.checked)}
        />

        <label className="toggle" htmlFor={`cbx-${ele._id}`}>
          <span />
        </label>

        {/* Hover Remark */}
        <div className="tooltip">
          {ele?.block ? 'Block' : 'Unblock'}
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .checkbox input[type='checkbox'] {
    visibility: hidden;
    display: none;
  }

  .checkbox {
    position: relative;
    display: inline-block;
  }

  .checkbox .toggle {
    position: relative;
    display: block;
    width: 40px;
    height: 20px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .checkbox .toggle:before {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 34px;
    height: 14px;
    background: #9a9999;
    border-radius: 8px;
    transition: background 0.2s ease;
  }

  .checkbox .toggle span {
    position: absolute;
    top: 0;
    left: 0;
    width: 20px;
    height: 20px;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0 3px 8px rgba(154, 153, 153, 0.5);
    transition: all 0.2s ease;
  }

  .checkbox .toggle span:before {
    content: '';
    position: absolute;
    margin: -18px;
    width: 56px;
    height: 56px;
    background: rgba(79, 46, 220, 0.5);
    border-radius: 50%;
    transform: scale(0);
    opacity: 1;
    pointer-events: none;
  }

  /* Checked state */
  .checkbox input[type='checkbox']:checked + .toggle:before {
    background: #947ada;
  }

  .checkbox input[type='checkbox']:checked + .toggle span {
    background: #4f2edc;
    transform: translateX(20px);
    box-shadow: 0 3px 8px rgba(79, 46, 220, 0.2);
  }

  .checkbox input[type='checkbox']:checked + .toggle span:before {
    transform: scale(1);
    opacity: 0;
    transition: all 0.4s ease;
  }

  /* Tooltip */
  .tooltip {
    position: absolute;
    top: -32px;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: #fff;
    padding: 4px 8px;
    font-size: 12px;
    border-radius: 4px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

  .tooltip-wrapper:hover .tooltip {
    opacity: 1;
  }
`;

export default Switch;
