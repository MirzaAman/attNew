import React, { useEffect, useState } from 'react';
import { auth, db, storage } from '../Firebase/Config';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';

const ProfilePage = () => {

    const navigate = useNavigate();

    const user = auth.currentUser;

    const [selectedImage, setSelectedImage] = useState(null);
    const [editor, setEditor] = useState(null);
    const [name, setName] = useState('');
    const [Sname, setSName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const [saveBtn, setSaveBtn] = useState('save')

    const [ImgUrl, setImgUrl] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setSelectedImage(file);
    };

    useEffect(() => {
    const checkUserProfileExists = async () => {
      const user = auth.currentUser;
      if (!user) {
        // User is not logged in, handle this case accordingly
        // navigate('/en/accounts/login');
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
          navigate('/');
        } else {
          // The user profile doesn't exist in Firestore. Navigate to the profile screen.
        //   return true;
        navigate('/en/auth/user/profile');
        }
      } catch (error) {
        console.error('Error checking user profile: ', error);
      }
    };

    checkUserProfileExists()
  }, [])

    const uploadImages = async () => {
        if (!selectedImage) return;

        const imageRef = ref(storage, `images/${selectedImage.name}`);

        try {
            await uploadBytes(imageRef, selectedImage);

            const url = await getDownloadURL(imageRef);
            return url;
            setImgUrl(url);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    }

    const addTeacher = async () => {
        const planRef = collection(db, 'teacher');
        try {
    
          const userName = user.displayName;
          const userUID = user.uid;
          await addDoc(planRef, {
            name: `${name} ${Sname}`,
            adminId: userUID,
          });
        } catch (error) {
          console.error('Error updating profile:', error.message);
    
        }
      }

    const handleSave = async (e) => {
        e.preventDefault();
    
        setSaveBtn('saving..');
    
        try {
            await addTeacher().then(async (res)=>{
                const imageUrl = await uploadImages();
    
            const user = auth.currentUser;
    
            if (user) {
                await updateProfile(user, {
                    displayName: `${name} ${Sname}`,
                    photoURL: imageUrl,
                });
    
                if (phoneNumber) {
                    // const profilesRef = collection(db, 'profiles');
                    const userUID = user.uid;
                    const profilesRef = collection(db, 'profiles', userUID, 'personal');
    
                    await addDoc(profilesRef, {
                        firstName: name,
                        secondName: Sname,
                        phone: phoneNumber,
                        dp: imageUrl,
                        uid:userUID,
                    });
                }
    
                toast.success('Profile updated successfully!', {
                    position: 'top-center',
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                });
    
                setSaveBtn('save');
                navigate('/');
            } else {
                setSaveBtn('save');
                toast.error('User not found', {
                    position: 'top-center',
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                });
            }
            })
        } catch (error) {
            setSaveBtn('save');
            toast.error('Error updating profile:', error.message, {
                position: 'top-center',
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            });
            console.error('Error updating profile:', error.message);
        }
    };
    

    return (
        <>
            <ToastContainer />
            <div className="container-fluid d-flex justify-content-center align-items-center vh-100">
                <div className="container">
                    <form onSubmit={handleSave} >
                        <div className="row">
                            <div className="col-md-4">
                                <div className="mb-3">
                                    <label htmlFor="profileImage" className="form-label">
                                        Profile Image
                                    </label>
                                    <input
                                        type="file"
                                        id="profileImage"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="form-control"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="row mt-4">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        className="form-control"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        placeholder='eg: Mirza'
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        className="form-control"
                                        value={Sname}
                                        onChange={(e) => setSName(e.target.value)}
                                        required
                                        placeholder='eg: Aman'
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="phoneNumber" className="form-label">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        id="phoneNumber"
                                        className="form-control"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                        placeholder='ex: 8129004343'
                                    />
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-primary">
                            {saveBtn}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ProfilePage;
