import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import { Close, Try } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, query, orderBy, where } from 'firebase/firestore';
import { auth, db } from '../Firebase/Config';
import { getAuth } from 'firebase/auth';

function Confirm() {

    const navigate = useNavigate();

    const user = auth?.currentUser;

    const [students, setStudents] = useState([]);

    const [AirPopup, setAirPopup] = useState(null);


    const [saveBtn, setSaveBtn] = useState('Save');

    const [totalAbs, setTotalAbs] = useState('')

    const [totalNAbs, setTotalNAbs] = useState('')

    const [Teacher, setTeacher] = useState([]);

    useEffect(() => {
        const storedAbsentees = JSON.parse(localStorage.getItem('absentees')) || [];
        const storedNonAbsentees = JSON.parse(localStorage.getItem('nonAbsentees')) || [];

        const combinedStudents = [...storedAbsentees, ...storedNonAbsentees];

        setStudents(combinedStudents);

        setTotalAbs(storedAbsentees.length)

        setTotalNAbs(storedNonAbsentees.length)

        const fetchStudents = async () => {

            const userUID = user?.uid;
            const class1Ref = collection(db, 'profiles', user ? userUID : 'blank', 'personal');

            const querySnapshot = await getDocs(class1Ref);

            const studentData = [];
            querySnapshot.forEach((doc) => {
                studentData.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });

            setTeacher(studentData);
        }

        fetchStudents();
    }, []);

    const [userr, setUser] = useState(null);

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

    const classs = localStorage.getItem('class');
    const period = localStorage.getItem('period');

    const handleSubmitClick = () => {
        const absentStudentPhoneNumbers = students
            .filter((student) => student.absent)
            .map((student) => student.phone);

        const period = localStorage.getItem('period');
        setAirPopup(true)
        // if (absentStudentPhoneNumbers.length > 0) {
        //     setAirPopup(true)
        // } else {
        //     alert('No absent students.');
        // }
    };

    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const updateCurrentTime = () => {
            const currentDate = new Date();
            const hours = currentDate.getHours();
            const minutes = currentDate.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';

            // Convert to 12-hour format
            let formattedHours = hours % 12;
            formattedHours = formattedHours || 12; // Handle midnight (0 hours)

            // Add leading zeros to minutes if necessary
            const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

            // Combine the formatted parts into the "hh:mm AM/PM" format
            const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;

            setCurrentTime(formattedTime);
        };

        // Update the time initially and then every minute
        updateCurrentTime();
        const intervalId = setInterval(updateCurrentTime, 60000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const pushChart = async () => {

        // Get the current date
        const currentDate = new Date();

        // Extract day, month, and year
        const day = currentDate.getDate();
        const month = currentDate.getMonth() + 1; // Months are 0-indexed, so add 1
        const year = currentDate.getFullYear();

        // Create strings for day, month, and year with leading zeros if needed
        const formattedDay = day < 10 ? `0${day}` : day.toString();
        const formattedMonth = month < 10 ? `0${month}` : month.toString();
        const formattedYear = year.toString();

        // Combine the formatted parts into the "dd/mm/yyyy" format
        const formattedDate = `${formattedDay}-${formattedMonth}-${formattedYear}`;

        const chartRef = collection(db, 'classes', classs, 'chart');

        const chartData = {
            date: formattedDate,
            period: period,
            hour: currentTime,
            list: students,
            admin: user ? user.displayName : 'Anonymouse',
            adminId: user ? user.uid : 'no-uid',
        };

        try {
            await addDoc(chartRef, chartData)
        } catch (error) {
            toast.success('Error in uploading data', {
                position: "top-left",
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined
            })
        }
    }

    const checkUserProfileExists = async () => {
        const user = auth.currentUser;
        if (!user) {
            // User is not logged in, handle this case accordingly
            navigate('/en/accounts/login');
            return;
        }

        const uid = user.uid;
        const userProfilesRef = collection(db, 'profiles', uid, 'personal');
        const q = query(userProfilesRef, where('uid', '==', uid));

        try {
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                
            } else {
                // The user profile doesn't exist in Firestore. Navigate to the profile screen.
                navigate('/en/auth/user/profile');
            }
        } catch (error) {
            console.error('Error checking user profile: ', error);
        }
    };

    const classTeacher = localStorage.getItem('classTchr');


    const sendWt = async () => {
        const Tphone = Teacher.map((item) => { return (item.phone); })
        const classTeacher = localStorage.getItem('classTchr');
        const mainMsg = students.filter((student) => student.absent).map((student) => { return `\nRoll: ${student.roll}, Name: ${student.name}, PHN: ${student.phone}` })

        const encodedMessage = encodeURIComponent(`No.of absentees: ${totalAbs}\n Period No: ${period} \n${mainMsg}`);
        const whatsappUrl = `https://wa.me/${classTeacher}?text=${encodedMessage}`;
        window.open(whatsappUrl);
    }

    const openWt = async (e) => {
        e.preventDefault();
        setSaveBtn('Saving..')
        await sendWt().then(() => {
            pushChart().then(async () => {
                localStorage.removeItem('absentees')
                localStorage.removeItem('class')
                localStorage.removeItem('nonAbsentees')
                localStorage.removeItem('period')
                localStorage.removeItem('classTchr')
                toast.success('Attendance marked', {
                    position: "top-center",
                    autoClose: 4000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined
                })
                setTimeout(() => {
                    setSaveBtn('saved')
                    navigate('/')
                }, 4000)
            })
        })
    }

    return (
        <>
            <ToastContainer />
            <div className="container">
                <div className="my-5">
                    <h1 className="my-4">{classs}</h1>
                    <div class="pricing-header p-3 pb-md-4 mx-auto text-start">
                        <p class="fs-5 text-body-secondary">Confirm the below students are absent for today's '{period}' period.</p>
                        <p class="fs-5 text-body-secondary">List of absent students will send to class Teacher's Whatsapp number.</p>
                        <p class="fs-5 text-body-secondary">Whatsapp no of {classs} class teacher is {classTeacher}</p>
                    </div>

                    <div className=" border-top-0">
                        <table className="table border table-dark table-striped">
                            <thead>
                                <tr>
                                    <th scope="col">RollNo</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((item) => (
                                    <tr key={item.id}>
                                        <td scope="row">{item.roll}</td>
                                        <td>{item.name}</td>
                                        <td>{item.absent ? 'Absent' : 'Present'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="container text-end">
                            <button
                                type="button"
                                className="btn btn-warning"
                                onClick={handleSubmitClick}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Dialog open={AirPopup}>
                <DialogTitle>
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-8">
                                <div className="p-1">Alert</div>
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
                        <form onSubmit={openWt} >
                            <div className="mb-3">
                                <ul>
                                    <div className="container">
                                        {/* <p>
                                            Phone Numbers:
                                        </p> */}

                                        {/* <div className="column">
                                            {students
                                                .filter((student) => student.absent)
                                                .map((student) => (
                                                    <h6>
                                                        {student.phone}
                                                    </h6>
                                                ))}
                                        </div> */}

                                        <li>
                                            Total Absentees : {totalAbs}
                                        </li>

                                        <li>
                                            Total Presents : {totalNAbs}
                                        </li>

                                        <li>
                                            Period Number: {period}
                                        </li>
                                        <li>
                                            Class: {classs}
                                        </li>
                                    </div>
                                </ul>
                            </div>
                            <button type="submit" className="btn btn-danger">
                                {saveBtn}
                            </button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default Confirm
