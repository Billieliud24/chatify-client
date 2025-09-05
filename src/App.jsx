import { Routes ,Route} from 'react-router-dom'
import Register from './Pages/Register/Register';
import Login from './Pages/Login/Login';
import Chat from './Pages/Chat/Chat';
import ProtectedRoute from './Components/ProtectedRoute';

function App() {
  

  return (
    <>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<Chat />} />
          
        </Route>
      </Routes>
    </>
  );
}

export default App
