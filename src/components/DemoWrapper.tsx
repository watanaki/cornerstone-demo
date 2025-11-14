import { type ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';
import NaviButton from './NaviButton';

const DemoWrapper = ({ children, className, ...props }: ComponentProps<'div'>) => {
  return (
    <div className={twMerge("w-full h-full flex flex-col items-center justify-center", className)}
      {...props}
    >
      <NaviButton route='/' text='Back to menu' />
      {children}
    </div>
  )
}

export default DemoWrapper;