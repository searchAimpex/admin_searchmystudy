import React from 'react';
import styled from 'styled-components';

const Switch = ({ statusHandler, ele }) => {
  console.log(ele?.block, "||||||||||||||||||||||||||||||||||");

  return (
    <StyledWrapper>
      <div className="checkbox">
        <input
          id={`cbx-${ele._id}`}
          type="checkbox"
          checked={!!ele?.block}
          onChange={(e) => statusHandler(ele._id, e.target.checked)}
        />
        <label className="toggle" htmlFor={`cbx-${ele._id}`}>
          <span />
        </label>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .checkbox input[type="checkbox"] {
    visibility: hidden;
    display: none;
  }

  .checkbox .toggle {
    position: relative;
    display: block;
    width: 40px;
    height: 20px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transform: translate3d(0, 0, 0);
  }
  .checkbox .toggle:before {
    content: "";
    position: relative;
    top: 3px;
    left: 3px;
    width: 34px;
    height: 14px;
    display: block;
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
    display: block;
    background: white;
    border-radius: 10px;
    box-shadow: 0 3px 8px rgba(154, 153, 153, 0.5);
    transition: all 0.2s ease;
  }
  .checkbox .toggle span:before {
    content: "";
    position: absolute;
    display: block;
    margin: -18px;
    width: 56px;
    height: 56px;
    background: rgba(79, 46, 220, 0.5);
    border-radius: 50%;
    transform: scale(0);
    opacity: 1;
    pointer-events: none;
  }

  /* Updated CSS selectors to target any checkbox input */
  .checkbox input[type="checkbox"]:checked + .toggle:before {
    background: #947ada;
  }
  .checkbox input[type="checkbox"]:checked + .toggle span {
    background: #4f2edc;
    transform: translateX(20px);
    transition: all 0.2s cubic-bezier(0.8, 0.4, 0.3, 1.25), background 0.15s ease;
    box-shadow: 0 3px 8px rgba(79, 46, 220, 0.2);
  }
  .checkbox input[type="checkbox"]:checked + .toggle span:before {
    transform: scale(1);
    opacity: 0;
    transition: all 0.4s ease;
  }
`;

export default Switch;
