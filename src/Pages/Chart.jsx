

import React, { useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../Firebase/Config';
import { Link, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Dialog, DialogTitle, DialogContent, MenuItem, Select, InputLabel, FormControl, Button, DialogActions } from '@mui/material';
import { Close, Try } from '@mui/icons-material'
import Footer from '../components/Footer';

function Chart() {
  const [isLoading, setIsLoading] = useState(false);
  const [dates, setDates] = useState([]); // State to store available dates
  const [selectedDate, setSelectedDate] = useState(''); // State to manage the selected date
  const [attendanceData, setAttendanceData] = useState([]); // State to store fetched attendance data
  const { classNamee, classTeacher } = useParams();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEditData, setSelectedEditData] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const handleEditClick = (editedData) => {
    setSelectedEditData(editedData);
    // setSelectedStatus(editedData.absent ? 'Absent' : 'Present');
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  const [Load, setLoad] = useState('save changes');

  const handleSaveClick = () => {
    if (selectedStatus === 'absent') {
      const a = true;
      const i = true;
      handleStatusChange(i, a);
    } else {
      const i = false;
      const a = true;
      handleStatusChange(i, a);
    }
  };

  const handleStatusChange = async (i, a) => {
    setLoad('saving..');
    try {
      const docRef = doc(db, 'classes', classNamee, 'chart', selectedEditData.id);

      const updatedList = data.map(item => {
        if (item.id === selectedEditData.id) {
          return {
            ...item,
            list: item.list.map(entry => {
              if (entry.roll === selectedEditData.roll) {
                return {
                  ...entry,
                  absent: i === a,
                };
              }
              return entry;
            }),
          };
        }
        return item;
      });

      await updateDoc(docRef, { list: updatedList[0].list });

      setAttendanceData(updatedList);
      fetchDefaultData();
      setEditDialogOpen(false);
      setLoad('save changes');
    } catch (error) {
      setLoad('save changes');
      console.error('Error updating data in Firestore: ', error);
    }
  }

  const [periods, setPeriods] = useState(Array.from({ length: 6 }, (_, i) => (i + 1).toString())); // Periods 1 to 6
  const [selectedPeriod, setSelectedPeriod] = useState('1'); // Default selected period is 1

  const [data, setData] = useState([]);
  const [table, setTable] = useState([]);

  const fetchDataByDateAndPeriod = async (date, period) => {
    try {
      setIsLoading(true);

      const querySnapshot = await getDocs(
        query(
          collection(db, 'classes', classNamee, 'chart'),
          where('date', '==', date),
          where('period', '==', period)
        )
      );

      const newData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const TableData = querySnapshot.docs.flatMap(doc => doc.data().list);
      setTable(TableData);

      setData(newData);
    } catch (error) {
      console.error('Error fetching data from Firestore: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch unique dates from Firestore
  const fetchDates = async () => {
    const datesQuerySnapshot = await getDocs(collection(db, 'classes', classNamee, 'chart'));
    const uniqueDates = [...new Set(datesQuerySnapshot.docs.map(doc => doc.data().date))];
    setDates(uniqueDates);
  };

  const fetchDefaultData = async () => {
    await fetchDates();

    // Set the default date to the currently selected date or the first date in the list
    const defaultDate = selectedDate || dates[0];
    setSelectedDate(defaultDate);

    // Fetch data for default date and selected period
    await fetchDataByDateAndPeriod(defaultDate, selectedPeriod);
  };

  useEffect(() => {
    const fetchDefaultData = async () => {
      await fetchDates();

      // Set the default date to the currently selected date or the first date in the list
      const defaultDate = selectedDate || dates[0];
      setSelectedDate(defaultDate);

      // Fetch data for default date and selected period
      await fetchDataByDateAndPeriod(defaultDate, selectedPeriod);
    };

    fetchDefaultData();
  }, [selectedDate, selectedPeriod]);

  const [isOn, setIsOn] = React.useState(false);
  const [EditIsOn, setEditIsOn] = React.useState(false);

  const handleToggle = () => {
    setIsOn(!isOn);
    setEditIsOn(!EditIsOn);
  };

  return (
    <>
      <ToastContainer />
      <div className="container">
        <div className="my-5">
          <Link to={`/en/auth/class/${classNamee}/${classTeacher}`}>
            <i className="fa-solid fa-arrow-left" style={{ fontSize: 25, cursor: 'pointer' }}></i>
          </Link>
        </div>
        <h1 className="my-5">{classNamee}</h1>

        {/* Bootstrap Dropdown for selecting dates */}
        <div className="container text-start" style={{ flexDirection: 'row' }}>
          <div className="btn-group">
            <button
              type="button"
              className="btn btn-secondary dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Date: {selectedDate || 'Select Date'}
            </button>
            <ul className="dropdown-menu">
              {
                dates.length === 0 ?
                  <li><a className="dropdown-item" >No Data</a></li>
                  :
                  dates.map((date) => (
                    <li key={date} onClick={() => setSelectedDate(date)}>
                      <a className="dropdown-item">{date}</a>
                    </li>
                  ))
              }
            </ul>
          </div>
        </div>

        {/* Bootstrap Dropdown for selecting periods */}
        <div className="container text-start my-3">
          <div className="btn-group">
            <button
              type="button"
              className="btn btn-secondary dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Period: {selectedPeriod || 'Select Period'}
            </button>
            <ul className="dropdown-menu">
              {periods.map((period) => (
                <li key={period} onClick={() => setSelectedPeriod(period)}>
                  <a className="dropdown-item">{period}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="my-4" />

        {
          data.length === 0 ?
            <div className='text-center my-3'><h1>No Attendance</h1></div>
            :

            data.map((item, index) => (
              <div key={index}>
                <div style={{ width: "100%", display: 'flex', alignItems: 'stretch', justifyContent: 'space-between' }}>
                  <p> Admin : {item.admin} || Time : {item.hour} </p>
                  <p style={{ cursor: 'pointer' }} className="text-end">
                  </p>
                </div>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="toggleSwitch" checked={isOn} onChange={handleToggle} />
                  <label class="form-check-label" for="toggleSwitch">
                    <span class="switch-text">
                      {isOn ? 'Edit mode: ON' : 'Edit mode: OFF'}
                    </span>
                    <span class="switch-handle"></span>
                  </label>
                </div>
                <div className="border-top">
                  {isLoading ? (
                    <div>Loading...</div>
                  )
                    :
                    <table className="table border table-dark table-striped">
                      <thead>
                        <tr>
                          <th onClick={() => console.log(table.length)}>Roll</th>
                          <th onClick={() => console.log(table)} >Name</th>
                          <th>Mark</th>
                          {
                            EditIsOn ?
                              <th>Edit</th>
                              :
                              null
                          }
                        </tr>
                      </thead>
                      <tbody>
                        {table.map((dataa, index) => (
                          <tr key={dataa.roll}>
                            <td onClick={() => console.log(item.list)} >{dataa.roll}</td>
                            <td>{dataa.name}</td>
                            <td>
                              {dataa.absent ? (
                                <i className="fa-solid fa-xmark" onClick={() => console.log(dataa.name)} style={{ color: '#ff2600' }}></i>
                              ) : (
                                <i className="fa-solid fa-check" style={{ color: '#77bb41' }}></i>
                              )}
                            </td>
                            {
                              EditIsOn ?
                                <td><i onClick={() => handleEditClick({
                                  id: item.id,
                                  roll: dataa.roll,
                                  absent: dataa.absent,
                                })} class="fa-solid fa-pen-to-square" style={{ color: '#ff2600', cursor: 'pointer' }}></i></td>
                                : null
                            }
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  }
                </div>
              </div>
            ))}

        {selectedEditData && (
          <Dialog open={editDialogOpen} onClose={() => handleEditDialogClose}>
            <DialogTitle>Edit Attendance</DialogTitle>
            <DialogContent>
              <form>
                <div className="mb-3">
                  <label htmlFor="status-select" className="form-label">
                    Status
                  </label>
                  <select
                    className="form-select"
                    id="status-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                  {/* Other input fields for roll, phone, etc. */}
                </div>
              </form>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditDialogClose} color="secondary">
                Close
              </Button>
              <Button onClick={handleSaveClick} color="primary">
                {Load}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </div>
      <Footer/>0
    </>
  );
}

export default Chart;
