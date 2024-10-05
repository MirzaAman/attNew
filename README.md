<!-- import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom'
import App from './App';
import Class from './Pages/Class';
import Login from './Pages/Login';
import ProfilePage from './Pages/Profile.';
import Confirm from './Pages/Confirm';
import Chart from './Pages/Chart';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route element={<App />} path='/' />
        <Route element={<Class />} path='/en/auth/class/:classNamee'/>
        <Route element={<Login/>} path='/en/accounts/login' />
        <Route element={<ProfilePage/>} path='/en/auth/user/profile'/>
        <Route element={<Confirm/>} path='/en/auth/class/confirm'/>
        <Route element={<Chart/>} path='/en/auth/class/:classNamee/char'/>
      </Routes>
    </Router>
  </React.StrictMode>
);



import React, { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

import NavBar from './components/NavBar'
import Footer from './components/Footer'
import Main from './components/Main'



function App() {

  const navigate = useNavigate();

  const [user, setUser] = useState(null)

  useEffect(() => {
    getAuth().onAuthStateChanged((user) => {
      if (user != null) {
        setUser(true)
      } else {
        navigate('/en/accounts/login')
      }
    })
  }, [])

  return (
    <>
      <NavBar />
      <Main />
      <Footer />
    </>
  )
}

export default App -->





 useEffect(() => {
    // Function to fetch dates from Firebase and set them in the state
    const fetchDates = async () => {
      try {
        const datesQuery = await getDocs(
          query(collection(db, 'classes', classNamee, 'chart'), orderBy('period', 'asc'))
        );

        // Use a Set to remove duplicate dates
        const uniqueDates = new Set(datesQuery.docs.map((doc) => doc.data().date));

        // Convert the Set back to an array
        const datesArray = Array.from(uniqueDates);

        setDates(datesArray);

        // Set the periods to numbers from 1 to 6
        const periodsArray = Array.from({ length: 6 }, (_, index) => (index + 1).toString());
        setPeriods(periodsArray);

        // Set the default date to the first date in the array
        setSelectedPeriod(periodsArray[0]);
        setSelectedDate(datesArray[0]);
      } catch (error) {
        console.error('Error fetching dates:', error);
      }
    };

    fetchDates();
  }, []);

  const [selectedHour, setSelectedHour] = useState('');

  useEffect(() => {
    // Function to fetch dates and periods from Firebase and set them in the state
    const fetchDatesAndPeriods = async () => {
      try {
        const chartQuery = await getDocs(
          query(collection(db, 'classes', classNamee, 'chart'), where('date', '==', selectedDate), orderBy('period', 'asc'))
        );

        // Fetch and set dates
        const datesArray = chartQuery.docs.map((doc) => doc.data().date);
        setDates(datesArray);
        // Set the default date to the first date in the array
        setSelectedDate(datesArray[0]);

        // Fetch and set periods
        const periodsArray = chartQuery.docs.map((doc) => doc.data().period);
        setPeriods(periodsArray);
        // Set the default period to the first period in the array
        setSelectedPeriod(periodsArray[0]);
        const selectedHour = chartQuery.docs[0].data().hour; // Assuming the hour is the same for all records on the selected date and period
        setSelectedHour(selectedHour);
      } catch (error) {
        console.error('Error fetching dates and periods:', error);
      }
    };

    fetchDatesAndPeriods();
  }, [selectedDate]);

  useEffect(() => {
    // Function to fetch attendance data based on the selected date and period
    const fetchAttendanceData = async () => {
      setIsLoading(true);
      try {
        const attendanceQuery = await getDocs(
          query(
            collection(db, 'classes', classNamee, 'chart'),
            where('date', '==', selectedDate),
            where('period', '==', selectedPeriod)
          )
        );
        const attendanceDataArray = attendanceQuery.docs.map((doc) => doc.data().list);
        setAttendanceData(attendanceDataArray.flat()); // flatten the array as it's a list of lists
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch attendance data when the selected date or period changes
    if (selectedDate && selectedPeriod) {
      fetchAttendanceData();
    }
  }, [selectedDate, selectedPeriod]);