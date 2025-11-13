import React from 'react'
import { Link } from 'react-router';

type Props = {
  route: string;
  text: string;
}

const NaviButton = ({ route, text }: Props) => {
  return (
    <button className='bg-amber-200 border-2 p-2 rounded-2xl'>
      <Link to={route}>{text}</Link>
    </button>
  )
}

export default NaviButton;