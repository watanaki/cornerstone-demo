import NaviButton from './NaviButton'

const RootLayout = () => {
  return (
    <div className='flex flex-col gap-2 items-center justify-center w-full h-full'>
      <NaviButton route='stackDemo' text='Stack Demo' />
      <NaviButton route='volumeDemo' text='Volume Demo' />
      <NaviButton route='convertViewport' text='Convert Viewport Demo' />
      <NaviButton route='metadataChecker' text='🔍 DICOM Metadata Checker' />
    </div>
  )
}

export default RootLayout;