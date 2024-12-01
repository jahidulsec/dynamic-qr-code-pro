import Link from 'next/link';
import React from 'react';

function Footer() {
  return (
    <footer className="absolute bottom-3 left-[50%] -translate-x-[50%] text-sm">
      <Link target='_blank' href={{ pathname: 'https://impalaintech.com' }} className="text-center">
        Developed by <strong className="font-cb"> Impala Intech Ltd.</strong>
      </Link>
    </footer>
  );
}

export default Footer;
