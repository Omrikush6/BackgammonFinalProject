import React from 'react';
import './Checker.css';

const Checker = ({ color }) => {
  return <div className={`checker ${color}`}></div>;
};

export default Checker;