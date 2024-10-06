import React from 'react'
import { useContext } from 'react'
import { UserContext } from '../../App'
import './Header.css'

function Header() {
  const { user } = useContext(UserContext);

  return (
    <header>
      {user ? (
        <h1>Hello, {user.name}!</h1>
      ) : ''}
    </header>
  );
}

export default Header;