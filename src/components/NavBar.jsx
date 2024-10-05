import React, { useEffect, useState } from 'react'
import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db, auth } from '../Firebase/Config';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import { Close } from '@mui/icons-material'
import { ToastContainer, toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom';

function NavBar() {

  const user = auth.currentUser;
  

  const [Teacher, setTeacher] = useState([]);

  const [classes, setClasses] = useState([])

  const [Teachers, setTeachers] = useState([])

  const [saveBtn, setSaveBtn] = useState('Save');

  const [saveBtn2, setSaveBtn2] = useState('Save');

  const [dp, setDp] = useState(null)

  const navigate = useNavigate();

  useEffect(() => {

    const fetchData = async () => {
      try {
        const classRef = collection(db, 'class');
        const q = query(classRef, orderBy('classNamee'));
        const querySnapshot = await getDocs(q);

        const newData = [];

        querySnapshot.forEach((doc) => {
          newData.push({ id: doc.id, ...doc.data() });
        });

        setClasses(newData);
      } catch (error) {
        console.error('Error fetching data from Firestore: ', error);
      }
    };

    

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

    fetchData();


    fetchStudents();

  },[])

  useEffect(()=>{
    const fetchTeacher = async () => {
      try {
        const classRef = collection(db, 'teacher');
        const q = query(
          classRef,
          where('name', '!=', user.displayName)
        );
        // const q = query(classRef, orderBy('name'));
        const querySnapshot = await getDocs(q);

        const newData = [];

        querySnapshot.forEach((doc) => {
          newData.push({ id: doc.id, ...doc.data() });
        });

        setTeachers(newData);
      } catch (error) {
        console.error('Error fetching data from Firestore: ', error);
      }
    };
    fetchTeacher()
  })

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const checkUserProfileExists = async () => {
      const user = auth.currentUser;
      if (!user) {
        return;
      }

      const uid = user.uid;
      const userProfilesRef = collection(db, 'profiles', uid, 'personal');
      const q = query(userProfilesRef, where('uid', '==', uid));

      try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setProfile(true);
        } else {
          setProfile(false);
        }
      } catch (error) {
        console.error('Error checking user profile: ', error);
      }
    };

    checkUserProfileExists()
  })

  const [FName, setFName] = useState('');

  useEffect(() => {
    if (user && user.photoURL) {
      setDp(user.photoURL);
    } else {
      setDp('https://cdn-icons-png.flaticon.com/512/3364/3364044.png');
    }
  })

  const getFirstName = () => {
    const ans = Teacher.map(((item) => {
      return (item.firstName);
    }))
    return ans;
  }

  const fetchData = async () => {
    try {
      const classRef = collection(db, 'class');
      const q = query(classRef, orderBy('classNamee'));
      const querySnapshot = await getDocs(q);

      const newData = [];

      querySnapshot.forEach((doc) => {
        newData.push({ id: doc.id, ...doc.data() });
      });

      setClasses(newData);
    } catch (error) {
      console.error('Error fetching data from Firestore: ', error);
    }
  };

  const [openAirPopup, setAirPopup] = useState(false);
  const [openTeacherPopup, setTeacherPopup] = useState(false);
  const [openAirPopup2, setAirPopup2] = useState(false);

  const [classInput, setClassInput] = useState('');
  const [Tchr, setTchr] = useState('');


  const [TeacherName, setTeacherName] = useState('');
  const [PlanInput, setPlanInput] = useState('');
  const [PlanDateInput, setPlanDateInput] = useState('');
  const [PlanTimeInput, setPlanTimeInput] = useState('');
  const [PlanVenueInput, setPlanVenueInput] = useState('');

  const addClassAndStudents = async (e) => {
    e.preventDefault()

    setSaveBtn('saving..')

    const class1Ref = collection(db, 'classes', classInput, 'students');
    const newStudentData = {
      namee: 'test',
      rolle: 10,
    };

    const ref = collection(db, 'class');

    await addDoc(ref, {
      classNamee: classInput,
      classTeacher: Tchr
    }).then(async () => {
      try {
        const docRef = await addDoc(class1Ref, newStudentData);
        console.log('New class added with ID: ', docRef.id);

        fetchData();
        setClassInput('')
        setAirPopup(false);
        setSaveBtn('save')
        toast.success('New class added : ' + classInput, {
          position: "top-center",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined
        })
      } catch (error) {
        setSaveBtn('save')
        console.error('Error adding student: ', error);
      }
    })

  };

  const openNewClass = () => {
    setAirPopup(true)
  }

  const openTeacher = () => {
    setTeacherPopup(true)
  }

  const addTeacher = async (e) => {
    e.preventDefault()
    setSaveBtn2('Saving..')
    const planRef = collection(db, 'teacher');
    try {

      const userName = user.displayName;
      const userUID = user.uid;
      await addDoc(planRef, {
        name: TeacherName,
        admin: userName,
        adminId: userUID,
      });

      Teachers.push({...Teachers,name:TeacherName})

      setTeacherPopup(false);
      setTeacherName('');

      toast.success('Teacher Added', {
        position: 'top-center',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });

      setSaveBtn2('Save')

    } catch (error) {

      setSaveBtn2('Save');
      toast.error('Error adding Teacher:', error.message, {
        position: 'top-center',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
      console.error('Error updating profile:', error.message);

    }
  }

  const addPlan = async (e) => {
    e.preventDefault()
    setSaveBtn2('Saving..')
    const planRef = collection(db, 'plans');
    try {

      const userName = user.displayName;
      const userUID = user.uid;
      await addDoc(planRef, {
        planTitle: PlanInput,
        planDate: PlanDateInput,
        planTime: PlanTimeInput,
        planVenuw: PlanVenueInput,
        admin: userName,
        adminId: userUID,
      });

      setAirPopup2(false);
      setPlanInput('')
      setPlanDateInput('')
      setPlanTimeInput('')
      setPlanVenueInput('')

      toast.success('New Plan Added!', {
        position: 'top-center',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });

      setSaveBtn2('Save')

    } catch (error) {

      setSaveBtn2('Save');
      toast.error('Error addin plan:', error.message, {
        position: 'top-center',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
      console.error('Error updating profile:', error.message);

    }
  }

  return (
    <>
      <ToastContainer />
      <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Attender</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page">Home</a>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Classes
                </a>
                <ul className="dropdown-menu" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {classes.length === 0 ? (
                    <li>
                      <a className="dropdown-item">No Data</a>
                    </li>
                  ) : (
                    classes.map((item, index) => (
                      <React.Fragment key={index}>
                        <li>
                          <Link to={`/en/auth/class/${item.classNamee}/${item.classTeacher}`} style={{ textDecoration: 'none' }}>
                            <a className="dropdown-item">{item.classNamee}</a>
                          </Link>
                        </li>
                      </React.Fragment>
                    ))
                  )}
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <a className="dropdown-item" style={{ cursor: 'pointer' }} onClick={openNewClass}>
                      Add Class
                    </a>
                  </li>
                </ul>
              </li>

              <div className="container ml-5"><button type="button" class="btn btn-warning" onClick={openNewClass}>Add Class</button></div>
            </ul>

            <ul className="navbar-nav  mb-2 mb-lg-0">
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Teachers
                </a>
                <ul className="dropdown-menu" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {Teachers.length === 0 ? (
                    <li>
                      <a className="dropdown-item">No Data</a>
                    </li>
                  ) : (
                    Teachers.map((item, index) => (
                      <React.Fragment key={index}>
                        <li>
                          <Link to={`en/auth/teachers/${item.name}`} style={{ textDecoration: 'none' }}>
                            <a className="dropdown-item">{item.name}</a>
                          </Link>
                        </li>
                      </React.Fragment>
                    ))
                  )}
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <a className="dropdown-item" style={{ cursor: 'pointer' }} onClick={()=>navigate('/en/auth/my-duty')}>
                      My Duty
                    </a>
                  </li>
                </ul>
              </li>
            </ul>

            <form className="d-flex" role="search">
              <div className="dropdown px-5">
                <a href="#" className="d-block link-body-emphasis text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                  <img src={dp} alt="mdo" width="32" height="32" className="rounded-circle" />
                </a>
                <ul className="dropdown-menu text-small">
                  <li><a className="dropdown-item" >Hi {user ? user.displayName : 'User'} ✨</a></li>
                  <li><a className="dropdown-item" onClick={() => setAirPopup2(true)} style={{ cursor: 'pointer' }} >Add Plan</a></li>
                  <li><a className="dropdown-item" onClick={() => navigate('/en/auth/club')} style={{ cursor: 'pointer' }} >Club</a></li>
                  <li><a className="dropdown-item" onClick={() => navigate('/en/auth/my-duty')} style={{ cursor: 'pointer' }} >My Duty</a></li>
                  {
                    profile ?
                      null
                      :
                      <li><a className="dropdown-item" onClick={() => navigate('/en/auth/user/profile')} style={{ cursor: 'pointer' }}>Profile</a></li>
                  }
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" style={{ cursor: 'pointer' }} onClick={() => { auth.signOut() }}>Sign out</a></li>
                </ul>
              </div>
            </form>

          </div>
        </div>
      </nav>

      <Dialog open={openAirPopup}>
        <DialogTitle>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-8">
                <div className="p-1">Add a class</div>
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
            <form onSubmit={addClassAndStudents} >
              <div className="mb-3">
                <label htmlFor="tchr" className="form-label">
                  Class Teacher whatsApp No
                </label>
                <input type="number" value={Tchr} onChange={(e) => setTchr(e.target.value)} className="form-control" id="tchr" required />
              </div>
              <div className="mb-3">
                <label htmlFor="className" className="form-label">
                  Class Name
                </label>
                <input type="text" value={classInput} onChange={(e) => setClassInput(e.target.value)} className="form-control" id="className" required />
              </div>
              <button type="submit" className="btn btn-primary">
                {saveBtn}
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openAirPopup2}>
        <DialogTitle>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-8">
                <div className="p-1">Add a Plan</div>
              </div>
              <div className="col-4 text-end">
                <div className="p-1">
                  <div className="icon-cross" onClick={() => setAirPopup2(false)}>
                    <Close />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogTitle>
        <DialogContent>
          <div className="container">
            <form onSubmit={addPlan} >
              <div className="mb-3">
                <label htmlFor="className" className="form-label">
                  Plan Title
                </label>
                <input type="text" value={PlanInput} onChange={(e) => setPlanInput(e.target.value)} className="form-control" id="className" required />
                <label htmlFor="datee" className="form-label">
                  Plan Date
                </label>
                <input type="date" value={PlanDateInput} onChange={(e) => setPlanDateInput(e.target.value)} className="form-control" id="datee" required />
                <label htmlFor="timee" className="form-label">
                  Plan Time
                </label>
                <input type="time" value={PlanTimeInput} onChange={(e) => setPlanTimeInput(e.target.value)} className="form-control" id="timee" required />
                <label htmlFor="at" className="form-label">
                  Plan Venue
                </label>
                <input type="text" value={PlanVenueInput} onChange={(e) => setPlanVenueInput(e.target.value)} className="form-control" id="at" required />
              </div>
              <button type="submit" className="btn btn-primary">
                {saveBtn2}
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openTeacherPopup}>
        <DialogTitle>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-8">
                <div className="p-1">Add Teacher</div>
              </div>
              <div className="col-4 text-end">
                <div className="p-1">
                  <div className="icon-cross" onClick={() => setTeacherPopup(false)}>
                    <Close />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogTitle>
        <DialogContent>
          <div className="container">
            <form onSubmit={addTeacher}>
              <div className="mb-3">
                <label htmlFor="className" className="form-label">
                  Teacher Name
                </label>
                <input type="text" value={TeacherName} onChange={(e) => setTeacherName(e.target.value)} className="form-control" id="className" required />
              </div>
              <button type="submit" className="btn btn-primary">
                {saveBtn2}
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

    </>
  )
}

export default NavBar
