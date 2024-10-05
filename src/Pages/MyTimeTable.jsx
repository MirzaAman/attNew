import React, { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import 'react-toastify/dist/ReactToastify.css';
import { collection, getDocs, addDoc, query, orderBy, where, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../Firebase/Config';
import { Dialog, DialogTitle, DialogContent, DialogActions, fabClasses } from '@mui/material';
import { Close, Try } from '@mui/icons-material'
import { ToastContainer, toast } from 'react-toastify'
import './style.css'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { Button } from '@mui/material';

function MyTimeTable() {

  const [dutyDay, setDutyDay] = useState(0);
  const [period1, setPeriod1] = useState('');
  const [period2, setPeriod2] = useState('');
  const [period3, setPeriod3] = useState('');
  const [period4, setPeriod4] = useState('');
  const [period5, setPeriod5] = useState('');
  const [period6, setPeriod6] = useState('');
  const [period7, setPeriod7] = useState('');

  const [Load, setLoad] = useState('Save');
  const [dlt, setDlt] = useState('yes');

  const [user, setUser] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const [AirPopup, setAirPopup] = useState(false);

  const [Teachers, setTeachers] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        if (user) {
          const class1Ref = collection(db, 'teachers', user.uid, 'duty');
          const q = query(class1Ref, orderBy('day'));
          const querySnapshot = await getDocs(q);

          const studentData = [];
          querySnapshot.forEach((doc) => {
            studentData.push({
              id: doc.id,
              ...doc.data(),
            });
          });

          setTeachers(studentData);
          setIsLoading(false);
          console.log(studentData);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, [user]);

  const [isOn, setIsOn] = React.useState(false);
  const [EditIsOn, setEditIsOn] = React.useState(false);

  const handleToggle = () => {
    setIsOn(!isOn);
    setEditIsOn(!EditIsOn);
  };

  const fetchStudents = async () => {
    try {
      if (user) {
        const class1Ref = collection(db, 'teachers', user.uid, 'duty');
        const q = query(class1Ref, orderBy('day'));
        const querySnapshot = await getDocs(q);

        const studentData = [];
        querySnapshot.forEach((doc) => {
          studentData.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setTeachers(studentData);
        setIsLoading(false);
        console.log(studentData);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }

  const addTest = async () => {
    const class1Ref = collection(db, 'teachers', user.displayName, 'duty');
    const newStudentData = {
      day: parseInt(dutyDay),
      p1: period1,
      p2: period2,
      p3: period3,
      p4: period4,
      p5: period5,
      p6: period6,
      p7: period7,
    };

    if (dutyDay !== 0 && period1 !== '' && period2 !== '' && period3 !== '' && period4 !== '' && period5 !== '' && period6 !== '' && period7 !== '') {
      try {
        const docRef = await addDoc(class1Ref, newStudentData);
      } catch (error) {
      }

    }

  }

  const addDuty = async () => {
    await addTest().then(async () => {
      setLoad('saving..');
      const class1Ref = collection(db, 'teachers', user.uid, 'duty');
      const newStudentData = {
        day: parseInt(dutyDay),
        p1: period1,
        p2: period2,
        p3: period3,
        p4: period4,
        p5: period5,
        p6: period6,
        p7: period7,
      };

      if (dutyDay !== 0 && period1 !== '' && period2 !== '' && period3 !== '' && period4 !== '' && period5 !== '' && period6 !== '' && period7 !== '') {
        try {
          const docRef = await addDoc(class1Ref, newStudentData);
          console.log('New student added with ID: ', docRef.id);

          setTeachers([...Teachers, { id: docRef.id, ...newStudentData }]);

          fetchStudents();


          setDutyDay('');
          setPeriod1('');
          setPeriod2('');
          setPeriod3('');
          setPeriod4('');
          setPeriod5('');
          setPeriod6('');
          setPeriod7('');

          toast.success('New Duty Added', {
            position: 'top-center',
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
          });

          setAirPopup(false);
          setLoad('save')
        } catch (error) {
          setLoad('save')
          console.error('Error adding student: ', error);
        }
      } else {
        setLoad('save')
        toast.error('Enter the Details!', {
          position: 'top-center',
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
        });
      }
    })

  }

  const [editMode, setEditMode] = useState(false);
  const [editDay, setEditDay] = useState(0);
  const [editedStudentData, setEditedStudentData] = useState({
    id: '',
    day: editDay,
    p1: '',
    p2: '',
    p3: '',
    p4: '',
    p5: '',
    p6: '',
    p7: '',
  });

  const handleEditClick = (duty) => {
    setEditMode(true);
    setEditDay(duty.day)
    setEditedStudentData({
      id: duty.id,
      day: parseInt(duty.day),
      p1: duty.p1,
      p2: duty.p2,
      p3: duty.p3,
      p4: duty.p4,
      p5: duty.p5,
      p6: duty.p6,
      p7: duty.p7,
    });
  };

  const handleSaveEdit = async () => {
    setLoad('SAVING..');
    try {
      const class1Ref = collection(db, 'teachers', user.uid, 'duty');
      const studentDocRef = doc(class1Ref, editedStudentData.id);

      await updateDoc(studentDocRef, {
        day: parseInt(editDay),
        p1: editedStudentData.p1,
        p2: editedStudentData.p2,
        p3: editedStudentData.p3,
        p4: editedStudentData.p4,
        p5: editedStudentData.p5,
        p6: editedStudentData.p6,
        p7: editedStudentData.p7,
      });

      // Refresh the student data after updating
      fetchStudents();

      // Reset edit mode and edited data
      setEditMode(false);

      setLoad('SAVE CHANGES');
      setEditedStudentData({
        id: '',
        day: editDay,
        p1: '',
        p2: '',
        p3: '',
        p4: '',
        p5: '',
        p6: '',
        p7: '',
      });
    } catch (error) {
      setLoad('SAVE CHANGES');
      toast.success(`${error}`, {
        position: 'top-center',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
      console.error('Error updating student: ', error);
    }
  };

  const [deletePopup, setDeletePopup] = useState(false);
  const [tempId, setTempId] = useState('');

  const handleDeleteClick = (id) => {
    setTempId(id);
    setDeletePopup(true);
  }

  const [btn, setBtn] = useState(true);

  const deleteData = async () => {
    setBtn(false);
    setDlt('Removing..');
    try {
      const class1Ref = collection(db, 'teachers', user.uid, 'duty');
      const studentDocRef = doc(class1Ref, tempId);

      await deleteDoc(studentDocRef);

      // Refresh the student data after deleting
      fetchStudents();

      setBtn(true);
      setDeletePopup(false);
      setDlt('yes');

      toast.success('Duty deleted successfully', {
        position: 'top-center',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      setDeletePopup(false);
      setBtn(true);
      setDlt('yes');
      console.error('Error deleting duty: ', error);
      toast.error('Error deleting duty', {
        position: 'top-center',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <>
      <ToastContainer />
      {
        isLoading ?
          <div className="csx">
            <div className="my-4">
            </div>

            <div className="containerbv"><center><h5>Loading...</h5></center></div>
          </div>
          :
          <div className="container">
            <div className="my-5"><Link to={`/`}><i class="fa-solid fa-arrow-left" style={{ fontSize: 25, cursor: 'pointer' }} ></i></Link></div>
            <div class="pricing-header p-3 pb-md-4 mx-auto text-start">
              <h1 class="display-4 fw-normal text-body-emphasis">Duty Table</h1>
            </div>
            <div className="container text-end my-3">
              <button type="button" onClick={() => setAirPopup(true)} class="btn btn-primary">New Duty</button>
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
              <table className="table border table-dark table-striped">
                <thead>
                  <tr>
                    <th scope="col">Day</th>
                    <th scope="col">1</th>
                    <th scope="col">2</th>
                    <th scope="col">3</th>
                    <th scope="col">4</th>
                    <th scope="col">5</th>
                    <th scope="col">6</th>
                    <th scope="col">7</th>
                    {
                      EditIsOn ?
                        <>
                          <th scope="col">Edit</th>
                          <th scope="col">Remove</th>
                        </>
                        : null
                    }
                  </tr>
                </thead>
                <tbody>
                  {
                    Teachers.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{item.day === 1 ? 'Monday' :
                            item.day === 2 ? 'Tuesday' :
                              item.day === 3 ? 'Wednesday' :
                                item.day === 4 ? 'Thursday' :
                                  item.day === 5 ? 'Friday' : ''}</td>
                          <td> {item.p1.toUpperCase()} </td>
                          <td> {item.p2.toUpperCase()} </td>
                          <td> {item.p3.toUpperCase()} </td>
                          <td> {item.p4.toUpperCase()} </td>
                          <td> {item.p5.toUpperCase()} </td>
                          <td> {item.p6.toUpperCase()} </td>
                          <td> {item.p7.toUpperCase()} </td>
                          {
                            EditIsOn ?
                              <>
                                <td><i class="fa-solid fa-pen-to-square" onClick={() => handleEditClick(item)} style={{ color: '#f0da18', cursor: 'pointer' }}></i></td>
                                <td><i class="fa-solid fa-trash" onClick={() => handleDeleteClick(item.id)} style={{ color: '#fc0303', cursor: 'pointer' }}></i></td>
                              </>
                              : null
                          }
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
          </div>
      }
      <Dialog open={AirPopup} onClose={() => setAirPopup(false)}>
        <DialogTitle>Add Duty</DialogTitle>
        <DialogContent>
          <form>
            <div className="mb-3">
              <React.Fragment>
                <label htmlFor="status-select" className="form-label">
                  Day
                </label>
                <select
                  className="form-select"
                  id="status-select"
                  value={dutyDay}
                  onChange={(e) => setDutyDay(e.target.value)}
                >
                  <option value={0}>--Select--</option>
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                </select>
                <label htmlFor="Roll" className="form-label">
                  Period 1
                </label>
                <input
                  value={period1}
                  onChange={(e) => setPeriod1(e.target.value)}
                  type="text"
                  className="form-control"
                  id="Roll"
                  required
                  placeholder="eg: 10A"
                />
                <label htmlFor="Roll" className="form-label">
                  Period 2
                </label>
                <input
                  value={period2}
                  onChange={(e) => setPeriod2(e.target.value)}
                  type="text"
                  className="form-control"
                  id="Roll"
                  required
                  placeholder="eg: 10B"
                />
                <label htmlFor="Roll" className="form-label">
                  Period 3
                </label>
                <input
                  value={period3}
                  onChange={(e) => setPeriod3(e.target.value)}
                  type="text"
                  className="form-control"
                  id="Roll"
                  required
                  placeholder="eg: 10C"
                />
                <label htmlFor="Roll" className="form-label">
                  Period 4
                </label>
                <input
                  value={period4}
                  onChange={(e) => setPeriod4(e.target.value)}
                  type="text"
                  className="form-control"
                  id="Roll"
                  required
                  placeholder="eg: 10D"
                />
                <label htmlFor="Roll" className="form-label">
                  Period 5
                </label>
                <input
                  value={period5}
                  onChange={(e) => setPeriod5(e.target.value)}
                  type="text"
                  className="form-control"
                  id="Roll"
                  required
                  placeholder="eg: 10E"
                />
                <label htmlFor="Roll" className="form-label">
                  Period 6
                </label>
                <input
                  value={period6}
                  onChange={(e) => setPeriod6(e.target.value)}
                  type="text"
                  className="form-control"
                  id="Roll"
                  required
                  placeholder="eg: 10F"
                />
                <label htmlFor="Roll" className="form-label">
                  Period 7
                </label>
                <input
                  value={period7}
                  onChange={(e) => setPeriod7(e.target.value)}
                  type="text"
                  className="form-control"
                  id="Roll"
                  required
                  placeholder="eg: 10G"
                />
              </React.Fragment>
            </div>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAirPopup(false)} color="secondary">
            Close
          </Button>
          <Button onClick={addDuty} color="primary">
            {Load}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editMode} onClose={() => setEditMode(false)}>
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          <form>
            <div className="mb-3">
              <label htmlFor="status-select" className="form-label">
                Day
              </label>
              <select
                className="form-select"
                id="status-select"
                value={editDay}
                onChange={(e) => setEditDay(e.target.value)}
              >
                <option value=''>--Select--</option>
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
              </select>
              <label htmlFor="Roll" className="form-label">
                Period 1
              </label>
              <input
                type="text"
                value={editedStudentData.p1}
                onChange={(e) => setEditedStudentData({ ...editedStudentData, p1: e.target.value })}
                className="form-control"
                id="Roll"
                required
                placeholder="eg: 10A"
              />
              <label htmlFor="Roll" className="form-label">
                Period 2
              </label>
              <input
                type="text"
                value={editedStudentData.p2}
                onChange={(e) => setEditedStudentData({ ...editedStudentData, p2: e.target.value })}
                className="form-control"
                id="Roll"
                required
                placeholder="eg: 10B"
              />
              <label htmlFor="Roll" className="form-label">
                Period 3
              </label>
              <input
                type="text"
                value={editedStudentData.p3}
                onChange={(e) => setEditedStudentData({ ...editedStudentData, p3: e.target.value })}
                className="form-control"
                id="Roll"
                required
                placeholder="eg: 10C"
              />
              <label htmlFor="Roll" className="form-label">
                Period 4
              </label>
              <input
                type="text"
                value={editedStudentData.p4}
                onChange={(e) => setEditedStudentData({ ...editedStudentData, p4: e.target.value })}
                className="form-control"
                id="Roll"
                required
                placeholder="eg: 10D"
              />
              <label htmlFor="Roll" className="form-label">
                Period 5
              </label>
              <input
                type="text"
                value={editedStudentData.p5}
                onChange={(e) => setEditedStudentData({ ...editedStudentData, p5: e.target.value })}
                className="form-control"
                id="Roll"
                required
                placeholder="eg: 10E"
              />
              <label htmlFor="Roll" className="form-label">
                Period 6
              </label>
              <input
                type="text"
                value={editedStudentData.p6}
                onChange={(e) => setEditedStudentData({ ...editedStudentData, p6: e.target.value })}
                className="form-control"
                id="Roll"
                required
                placeholder="eg: 10F"
              />
              <label htmlFor="Roll" className="form-label">
                Period 7
              </label>
              <input
                type="text"
                value={editedStudentData.p7}
                onChange={(e) => setEditedStudentData({ ...editedStudentData, p7: e.target.value })}
                className="form-control"
                id="Roll"
                required
                placeholder="eg: 10G"
              />
              {/* Other input fields for roll, phone, etc. */}
            </div>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMode(false)} color="secondary">
            Close
          </Button>
          <Button onClick={handleSaveEdit} color="primary">
            {Load}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deletePopup} onClose={() => setDeletePopup(false)}>
        <DialogTitle>Are you sure you want to delete this duty?</DialogTitle>
        <DialogContent>
          <p>You can't undo after deleting</p>
        </DialogContent>
        <DialogActions>
          {
            btn ? <Button onClick={() => setDeletePopup(false)} color="secondary">
              Close
            </Button> : null
          }
          <Button onClick={deleteData} color="primary">
            {dlt}
          </Button>
        </DialogActions>
      </Dialog>
      <Footer />
    </>
  )
}

export default MyTimeTable
