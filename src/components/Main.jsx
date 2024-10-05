import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../Firebase/Config';
import './btn.css'

function Main() {

    const [documentCount, setDocumentCount] = useState(null);

    const [StudentsCount, setStudentsCount] = useState(null);

    const [showMore, setShowMore] = useState(false);

    const [Plans, setPlans] = useState([]);

    const [maleCount, setMaleCount] = useState(0);
    const [femaleCount, setFemaleCount] = useState(0);


    useEffect(() => {
        // Function to fetch the count of documents in the Firestore collection
        const fetchDocumentCount = async () => {
            try {
                const collectionRef = collection(db, 'class'); // Replace with your Firestore collection name
                const querySnapshot = await getDocs(collectionRef);
                const count = querySnapshot.size;
                setDocumentCount(count);
            } catch (error) {
                console.error('Error fetching document count:', error);
            }
        };

        const fetchStudentCount = async () => {
            try {
                const collectionRef = collection(db, 'students'); // Replace with your Firestore collection name
                const querySnapshot = await getDocs(collectionRef);
                const count = querySnapshot.size;
                setStudentsCount(count);
            } catch (error) {
                console.error('Error fetching document count:', error);
            }
        };

        const fetchData = async () => {
            const studentsCollection = collection(db, 'students');
            const maleQuery = query(studentsCollection, where('gender', '==', 'male'));
            const femaleQuery = query(studentsCollection, where('gender', '==', 'female'));

            const maleSnapshot = await getDocs(maleQuery);
            const femaleSnapshot = await getDocs(femaleQuery);

            setMaleCount(maleSnapshot.size);
            setFemaleCount(femaleSnapshot.size);
        };

        fetchData();

        fetchStudentCount();

        fetchDocumentCount();
    });



    useEffect(() => {
        const fetchData = async () => {
            try {
                const PlanRef = collection(db, 'plans');
                const q = query(PlanRef, orderBy('planDate', 'desc'));
                const querySnapshot = await getDocs(q);

                const newData = [];

                querySnapshot.forEach((doc) => {
                    newData.push({ id: doc.id, ...doc.data() });
                });

                setPlans(newData);
            } catch (error) {
                console.error('Error fetching data from Firestore: ', error);
            }
        };

        fetchData();
    })

    const handleShowMoreClick = () => {
        setShowMore(!showMore);
      };
    

    const displayedPlans = showMore ? Plans : Plans.slice(0, 3);

    return (
        <>
            <div className="container">
                <div className="my-5">.</div>
                <h1 class="my-4 text-center">Teachers Portal</h1>
                <main>
                    <div className="row row-cols-1 row-cols-md-3 mb-3 text-center">
                        <div className="col">
                            <div className="card mb-4 rounded-3 shadow-sm border-warning">
                                <div className="card-header py-3 text-bg-warning">
                                    <h4 className="my-0 fw-normal">Class</h4>
                                </div>
                                <div className="card-body">
                                    <h1 className="card-title pricing-card-title">{documentCount ? documentCount : '0'}<small className="text-body-secondary fw-light"> Classes</small></h1>
                                    <ul className="list-unstyled mt-3 mb-4">
                                        <li>5 Days</li>
                                        <li>6 Periods</li>
                                        <li>10 Teachers</li>
                                    </ul>
                                    {/* <button type="button" className="w-100 btn btn-lg btn-outline-primary">Sign up for free</button> */}
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card mb-4 rounded-3 shadow-sm border-danger">
                                <div className="card-header py-3 text-bg-danger">
                                    <h4 className="my-0 fw-normal">Student</h4>
                                </div>
                                <div className="card-body">
                                    <h1 className="card-title pricing-card-title">{StudentsCount ? StudentsCount : '0'}<small className="text-body-secondary fw-light"> Students</small></h1>
                                    <ul className="list-unstyled mt-3 mb-4">
                                        <li>{maleCount} Male</li>
                                        <li>{femaleCount} Female</li>
                                        <li>.</li>
                                    </ul>
                                    {/* <button type="button" className="w-100 btn btn-lg btn-primary">Get started</button> */}
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card mb-4 rounded-3 shadow-sm border-primary">
                                <div className="card-header py-3 text-bg-primary">
                                    <h4 className="my-0 fw-normal">Club</h4>
                                </div>
                                <div className="card-body">
                                    <h1 className="card-title pricing-card-title">0<small className="text-body-secondary fw-light"> Clubs</small></h1>
                                    <ul className="list-unstyled mt-3 mb-4">
                                        <li>0 Events</li>
                                        <li>0 State level</li>
                                        <li>0 National level</li>
                                    </ul>
                                    {/* <button type="button" className="w-100 btn btn-lg btn-primary">Get started</button> */}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <h2 className="display-6 text-center mb-4">Upcoming Plans</h2> */}

                    {/* <div className="table-responsive">
                        {
                            Plans.length !== 0 ?
                                <div className="">
                                    <table className="table text-center">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '34%' }}></th>
                                            <th style={{ width: '22%' }}>Date</th>
                                            <th style={{ width: '22%' }}>Time</th>
                                            <th style={{ width: '22%' }}>At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            displayedPlans.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <th scope="row" className="text-start"> {item.planTitle} </th>
                                                        <td> {item.planDate} </td>
                                                        <td> {item.planTime} </td>
                                                        <td> {item.planVenuw} </td>
                                                    </tr>
                                                );
                                            })
                                        }
                                    </tbody>
                                </table>
                                {Plans.length > 3 && (
                                    <p
                                      className="more-btn"
                                      onClick={handleShowMoreClick}
                                      style={{cursor:'pointer'}}
                                    >
                                      {showMore ? 'Show Less..' : 'More..'}
                                    </p>
                                  )}
                                </div>
                                :
                                <h3 className='text-center'>No Data</h3>
                        }
                    </div> */}
                </main>
            </div>
        </>
    )
}

export default Main
