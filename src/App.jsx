import { useState, useEffect } from "react";
import Header from "./components/Header";
import AddBirthday from "./components/AddBirthday";
import Birthdays from "./components/Birthdays";
import EditBirthday from "./components/EditBirthday";
import { useSpring, animated } from "@react-spring/web";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

const App = () => {
  const [showAddBirthday, setShowAddBirthday] = useState(false);
  const [showBirthdays, setShowBirthdays] = useState(false);
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentBirthday, setCurrentBirthday] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const firebaseConfig = {
    apiKey: "AIzaSyDw1ILk9EvpayniSM1cmY7csj9BllD-eH8",
    authDomain: "fir-crash-course-9c2b1.firebaseapp.com",
    projectId: "fir-crash-course-9c2b1",
    storageBucket: "fir-crash-course-9c2b1.appspot.com",
    messagingSenderId: "448985280738",
    appId: "1:448985280738:web:e82bbda3b2ebd4e92a6ebb",
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Initialize Cloud Firestore and get a reference to the service
  const db = getFirestore(app);
  const birthdayCollection = collection(db, "birthdays");

  async function getBirthdaysFromDB() {
    await onSnapshot(birthdayCollection, (data) => {
      const birthdayData = data.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBirthdays(birthdayData);
      return birthdayData;
    });
  }

  useEffect(() => {
    setLoading(true);
    getBirthdaysFromDB();
    setLoading(false);
  }, [db]);

  // Add Birthday
  const addBirthday = async (birthday) => {
    const date = birthday.date;
    const name = birthday.name;

    await addDoc(birthdayCollection, {
      name,
      date,
      reminder: false,
    });

    setShowAddBirthday(!showAddBirthday);

    alert("Birthday Added");
  };

  // Select Birthday to Edit
  const editBirthday = async (id) => {
    setShowAddBirthday(false);
    setIsEditing(true);
    const birthdayToEdit = doc(db, "birthdays", id);
    getDoc(birthdayToEdit).then((doc) => {
      setCurrentBirthday({ ...doc.data(), id });
    });
  };

  // Edit Birthday
  const onUpdate = async (id, updatedBirthday) => {
    try {
      const birthdayToUpdate = doc(db, "birthdays", id);
      await updateDoc(birthdayToUpdate, updatedBirthday);
      alert("Birthday Updated");
    } catch (err) {
      alert("Error updating birthday", err);
    }
    setIsEditing(false);
  };

  // Delete Birthday
  const deleteBirthday = async (id) => {
    const birthdayToDelete = doc(db, "birthdays", id);
    await deleteDoc(birthdayToDelete);
    setShowDeleteModal(false);
  };

  // Fade In Animation
  const fadeIn = useSpring({
    from: { opacity: 0, marginTop: -500 },
    to: { opacity: 1, marginTop: 50 },
    config: { delay: 1000, duration: 1000 },
  });

  return (
    <animated.div className="container" style={fadeIn}>
      <Header
        onAdd={() => setShowAddBirthday(!showAddBirthday)}
        showAdd={showAddBirthday}
      />
      {isEditing && (
        <EditBirthday
          onUpdate={onUpdate}
          currentBirthday={currentBirthday}
          isEditing={() => setIsEditing(!isEditing)}
        />
      )}
      {!birthdays ? (
        <div style={{ textAlign: "center" }}>Loading...</div>
      ) : (
        <>
          {showAddBirthday && (
            <AddBirthday birthdays={birthdays} onAdd={addBirthday} />
          )}
          {birthdays.length > 0 ? (
            <Birthdays
              birthdays={birthdays}
              onAdd={() => setShowBirthdays(!showBirthdays)}
              showBirthdays={showBirthdays}
              loading={loading}
              onDelete={deleteBirthday}
              onEditClick={editBirthday}
              showDeleteModal={showDeleteModal}
              showDelete={() => setShowDeleteModal(!showDeleteModal)}
            />
          ) : (
            "No Birthday Saved"
          )}
        </>
      )}
    </animated.div>
  );
};

export default App;
