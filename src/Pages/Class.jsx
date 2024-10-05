import React, { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import 'react-toastify/dist/ReactToastify.css';
import { collection, getDocs, addDoc, query, orderBy, where, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../Firebase/Config';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Close, Try } from '@mui/icons-material'
import { ToastContainer, toast } from 'react-toastify'
import './style.css'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { Button } from '@mui/material';
function Class() {

    const navigate = useNavigate();

    const [isOn, setIsOn] = React.useState(false);
    const [EditIsOn, setEditIsOn] = React.useState(false);

    const handleToggle = () => {
        setIsOn(!isOn);
        setEditIsOn(!EditIsOn);
    };

    const { classNamee, classTeacher } = useParams();

    const [isLoading, setIsLoading] = useState(true);
    const [students, setStudents] = useState([]);

    const [user, setUser] = useState(null);

    useEffect(() => {
        getAuth().onAuthStateChanged((user) => {
            if (user != null) {
                setUser(true)
            } else {
                navigate('/en/accounts/login')
                setUser(false)
            }
        })
    })

    useEffect(() => {
        const checkUserProfileExists = async () => {
            const user = auth.currentUser;
            if (!user) {
                // User is not logged in, handle this case accordingly
                return;
            }

            const uid = user.uid;
            const userProfilesRef = collection(db, 'profiles', uid, 'personal');
            const q = query(userProfilesRef, where('uid', '==', uid));

            try {
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    // The user profile exists in Firestore. Continue with the home page.
                    // You can access user data using querySnapshot.docs[0].data()
                    return true;
                } else {
                    // The user profile doesn't exist in Firestore. Navigate to the profile screen.
                    navigate('/en/auth/user/profile');
                }
            } catch (error) {
                console.error('Error checking user profile: ', error);
            }
        };

        checkUserProfileExists()
    }, [])


    useEffect(() => {
        const fetchStudents = async () => {
            const class1Ref = collection(db, 'classes', classNamee, 'students');

            const q = query(class1Ref, orderBy('roll'));

            const querySnapshot = await getDocs(q);

            const studentData = [];
            querySnapshot.forEach((doc) => {
                studentData.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });

            setStudents(studentData);
            setIsLoading(false)
            console.log(studentData);
        }

        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        const class1Ref = collection(db, 'classes', classNamee, 'students');

        const q = query(class1Ref, orderBy('roll'));

        const querySnapshot = await getDocs(q);

        const studentData = [];
        querySnapshot.forEach((doc) => {
            studentData.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        setStudents(studentData);
        setIsLoading(false)
        console.log(studentData);
    }


    const [selectedPeriod, setSelectedPeriod] = useState('');

    const handlePeriodSelect = (event) => {
        setSelectedPeriod(event.target.textContent);
    };


    const [AirPopup, setAirPopup] = useState(null);

    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentGender, setNewStudentGender] = useState('');
    const [newStudentRollNo, setNewStudentRollNo] = useState('');
    const [newStudentPhone, setNewStudentPhone] = useState('');

    const [saveBtn, setSaveBtn] = useState('Save');

    const pushStudent = async () => {
        const studentsRef = collection(db, 'students');
        const stdData = {
            name: newStudentName,
            phone: newStudentPhone,
            gender: selectedGender,
        }

        try {
            await addDoc(studentsRef, stdData);
        } catch (error) {
            console.log('Error on pushing student');
        }
    }

    async function addNewStudent(e) {
        e.preventDefault();
        setSaveBtn('saving..')
        await pushStudent().then(async () => {
            const class1Ref = collection(db, 'classes', classNamee, 'students');
            const newStudentData = {
                name: newStudentName,
                roll: parseInt(newStudentRollNo, 10),
                phone: parseInt(newStudentPhone, 10),
            };

            try {
                const docRef = await addDoc(class1Ref, newStudentData);
                console.log('New student added with ID: ', docRef.id);

                setStudents([...students, { id: docRef.id, ...newStudentData }]);


                setNewStudentName('');
                fetchStudents()
                setNewStudentRollNo('');
                setNewStudentPhone('')
                setAirPopup(false);
                setSaveBtn('save')
            } catch (error) {
                setSaveBtn('save')
                console.error('Error adding student: ', error);
            }
        })
    }

    const handleCheckboxChange = (index) => {
        const updatedStudents = [...students];
        updatedStudents[index].absent = !updatedStudents[index].absent;
        setStudents(updatedStudents);
    };

    const handleSaveClick = () => {
        if (selectedPeriod) {
            // Filter absent and non-absent students
            const absentees = students.filter((student) => student.absent);
            const nonAbsentees = students.filter((student) => !student.absent);

            // Store data in localStorage
            localStorage.setItem('absentees', JSON.stringify(absentees));
            localStorage.setItem('nonAbsentees', JSON.stringify(nonAbsentees));
            localStorage.setItem('period', selectedPeriod);
            localStorage.setItem('class', classNamee);
            localStorage.setItem('classTchr', classTeacher);

            setTimeout(() => {
                navigate('/en/auth/class/confirm')
            }, 300)

        } else {
            toast.error('Please select any period', {
                position: "top-center",
                autoClose: 4000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined
            })
        }
    }

    const handleSaveClick1 = () => {
        localStorage.removeItem('absentees');
        localStorage.removeItem('nonAbsentees');
    };

    const [selectedGender, setSelectedGender] = useState(''); // Initialize with an empty string

    const handleGenderChange = (event) => {
        setSelectedGender(event.target.value);
    };


    const [editMode, setEditMode] = useState(false);
    const [editedStudentData, setEditedStudentData] = useState({
        id: '',
        name: '',
        roll: '',
        phone: '',
        absent: null,
    });

    const handleEditClick = (student) => {
        setEditMode(true);
        setEditedStudentData({
            id: student.id,
            name: student.name,
            roll: student.roll,
            phone: student.phone,
        });
    };

    const [load, setLoad] = useState('SAVE CHANGES');

    const handleSaveEdit = async () => {
        setLoad('SAVING..');
        try {
            const class1Ref = collection(db, 'classes', classNamee, 'students');
            const studentDocRef = doc(class1Ref, editedStudentData.id);

            await updateDoc(studentDocRef, {
                name: editedStudentData.name,
                roll: parseInt(editedStudentData.roll, 10),
                phone: parseInt(editedStudentData.phone, 10),
            });

            // Refresh the student data after updating
            fetchStudents();

            // Reset edit mode and edited data
            setEditMode(false);

            setLoad('SAVE CHANGES');
            setEditedStudentData({
                id: '',
                name: '',
                roll: '',
                phone: '',
                absent: null,
            });
        } catch (error) {
            setLoad('SAVE CHANGES');
            console.error('Error updating student: ', error);
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
                        <h1 className="my-4">{classNamee}</h1>
                        <div class="pricing-header p-3 pb-md-4 mx-auto text-start">
                            <h1 class="display-4 fw-normal text-body-emphasis">Students List</h1>
                            <p class="fs-5 text-body-secondary">Quickly mark the absenties by marking the the checkbox in right to the roll number.</p>
                        </div>
                        <div className="container text-end my-3">
                            <button type="button" onClick={() => setAirPopup(true)} class="btn btn-primary">Add Student</button>
                        </div>
                        <div className="container text-end">
                            <Link to={`/en/auth/class/${classNamee}/char/${classTeacher}`}><button type="button" class="btn btn-dark">Attendace Chart</button></Link>
                        </div>
                        <div className="container text-end">
                            <div class="dropdown my-3">
                                <button
                                    className="btn btn-secondary dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    Period: {selectedPeriod || 'Not Selected'}
                                </button>

                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" onClick={handlePeriodSelect}>1</a></li>
                                    <li><a class="dropdown-item" onClick={handlePeriodSelect}>2</a></li>
                                    <li><a class="dropdown-item" onClick={handlePeriodSelect}>3</a></li>
                                    <li><a class="dropdown-item" onClick={handlePeriodSelect}>4</a></li>
                                    <li><a class="dropdown-item" onClick={handlePeriodSelect}>5</a></li>
                                    <li><a class="dropdown-item" onClick={handlePeriodSelect}>6</a></li>
                                </ul>
                            </div>
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
                            {
                                students.length === 0 ?
                                    <div className='text-center my-3'><h1>No Data</h1></div>
                                    :
                                    <>
                                        <table className="table border table-dark table-striped">
                                            <thead>
                                                <tr>
                                                    <th scope="col">RollNo</th>
                                                    <th scope="col">Name</th>
                                                    <th scope="col">Mark</th>
                                                    {
                                                        EditIsOn ? <th>Edit</th> : null
                                                    }
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {students.map((item, index) => (
                                                    <tr key={item.roll} >
                                                        <td scope="row">{item.roll}</td>
                                                        <td>{item.name}</td>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                checked={item.absent}
                                                                onChange={() => handleCheckboxChange(index)}
                                                            />
                                                        </td>
                                                        {
                                                            EditIsOn ? <td><i class="fa-solid fa-pen-to-square" onClick={() => handleEditClick(item)} style={{ color: '#f0da18', cursor: 'pointer' }}></i></td> : null
                                                        }
                                                        {/* <td><i class="fa-solid fa-pen" ></i></td> */}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="container text-end">
                                            <button
                                                onClick={handleSaveClick}
                                                type="button"
                                                className="btn btn-warning"
                                            >
                                                Continue
                                            </button>
                                        </div>
                                    </>
                            }

                        </div>
                    </div>
            }
            <Dialog open={AirPopup}>
                <DialogTitle>
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-8">
                                <div className="p-1">New Student</div>
                            </div>
                            <div className="col-4 text-end">
                                <div className="p-1">
                                    <div className="icon-cross" onClick={() => setAirPopup(false)}>
                                        <Close />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogTitle>
                <DialogContent>
                    <div className="container">
                        <form onSubmit={addNewStudent} >
                            <div className="mb-3">
                                <label htmlFor="Name" className="form-label">
                                    Student Name
                                </label>
                                <input type="text" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} className="form-control" id="Name" required placeholder='eg: Mirza Aman' />
                                <div className="my-2">
                                    <label>Gender:</label>
                                    <div className="form-check" >
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            id="maleRadio"
                                            value="male"
                                            checked={selectedGender === 'male'}
                                            onChange={handleGenderChange}
                                        />
                                        <label className="form-check-label" htmlFor="maleRadio">Male</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            id="femaleRadio"
                                            value="female"
                                            checked={selectedGender === 'female'}
                                            onChange={handleGenderChange}
                                        />
                                        <label className="form-check-label" htmlFor="femaleRadio">Female</label>
                                    </div>
                                </div>
                                <label htmlFor="Roll" className="form-label">
                                    Roll number
                                </label>
                                <input type="number" value={newStudentRollNo} onChange={(e) => setNewStudentRollNo(e.target.value)} className="form-control" id="Roll" required placeholder='eg: 12' />
                                <label htmlFor="Roll" className="form-label">
                                    Phone number
                                </label>
                                <input type="number" value={newStudentPhone} onChange={(e) => setNewStudentPhone(e.target.value)} className="form-control" id="Roll" required placeholder='eg: 8129004343' />
                            </div>
                            <button type="submit" className="btn btn-primary">
                                {saveBtn}
                            </button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={editMode} onClose={() => setEditMode(false)}>
                <DialogTitle>Edit Student</DialogTitle>
                <DialogContent>
                    <form>
                        <div className="mb-3">
                            <label htmlFor="Name" className="form-label">
                                Student Name
                            </label>
                            <input
                                type="text"
                                value={editedStudentData.name}
                                onChange={(e) => setEditedStudentData({ ...editedStudentData, name: e.target.value })}
                                className="form-control"
                                id="Name"
                                required
                                placeholder="eg: Mirza Aman"
                            />
                            <label htmlFor="Roll" className="form-label">
                                Roll Number
                            </label>
                            <input
                                type="text"
                                value={editedStudentData.roll}
                                onChange={(e) => setEditedStudentData({ ...editedStudentData, roll: e.target.value })}
                                className="form-control"
                                id="Roll"
                                required
                                placeholder="eg: 12"
                            />
                            <label htmlFor="Roll" className="form-label">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                value={editedStudentData.phone}
                                onChange={(e) => setEditedStudentData({ ...editedStudentData, phone: e.target.value })}
                                className="form-control"
                                id="Roll"
                                required
                                placeholder="eg: 8129004343"
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
                        {load}
                    </Button>
                </DialogActions>
            </Dialog>
            <Footer />
        </>
    )
}

export default Class
