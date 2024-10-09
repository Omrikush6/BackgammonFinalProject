import React from 'react';
import './Checker.css';

const Checker = ({ color,onClick }) => {
  return <div onClick={onClick} className={`checker ${color}`}></div>;
};

export default Checker;