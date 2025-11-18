import { RouterProvider } from 'react-router'
import './styles/index.css'
import router from './router';


function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
