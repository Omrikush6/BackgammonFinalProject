import Login  from './components/Login/Login';
import { BrowserRouter , Route, Routes} from 'react-router-dom';
import Lobby from './components/Lobby/Lobby'
import Game from './components/Game/Game'
import Footer from './components/Footer/Footer'
import './App.css';

function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route exact path ='/' element={<Login/>}/>
        <Route exact path = '/Lobby' element={<Lobby/>} /> 
        <Route exact path = 'Game' element={<Game/>}/>
      </Routes>
      <Footer/>
    </BrowserRouter>
    
    </>
  )
}

export default App
