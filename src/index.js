import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom'
import App from './App';
import Class from './Pages/Class';
import Login from './Pages/Login';
import ProfilePage from './Pages/Profile';
import Confirm from './Pages/Confirm';
import Chart from './Pages/Chart';
import UpdateProfile from './Pages/UpdateProfile';
import TeacherTimeTable from './Pages/TeacherTimeTable';
import MyTimeTable from './Pages/MyTimeTable'
import ClubMain from './Pages/ClubMain';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route element={<App />} path='/' />
        <Route element={<Class />} path='/en/auth/class/:classNamee/:classTeacher'/>
        <Route element={<Login/>} path='/en/accounts/login' />
        <Route element={<ProfilePage/>} path='/en/auth/user/profile'/>
        <Route element={<Confirm/>} path='/en/auth/class/confirm'/>
        <Route element={<Chart/>} path='/en/auth/class/:classNamee/char/:classTeacher'/>
        <Route element={<UpdateProfile/>} path='/en/auth/update/profile'/>
        <Route element={<TeacherTimeTable/>} path='en/auth/teachers/:teacher'/>
        <Route element={<ClubMain/>} path='/en/auth/club'/>
        <Route element={<MyTimeTable/>} path='/en/auth/my-duty' />
      </Routes>
    </Router>
  </React.StrictMode>
);
