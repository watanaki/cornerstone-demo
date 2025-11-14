import React from 'react'
import { Link } from 'react-router';

type Props = {
  route: string;
  text: string;
}

const NaviButton = ({ route, text }: Props) => {
  return (
    <Link
      to={route}
      className="p-2 bg-amber-100 rounded-2xl border-2 mb-2 inline-block hover:bg-amber-200 transition-colors"
    >
      {text}
    </Link>
  )
}

export default NaviButton;