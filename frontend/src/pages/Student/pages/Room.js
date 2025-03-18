import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const Room = () => {
  const sessionid = useParams();

  // console.log(sessionid.roomId);

  const apiKey = process.env.REACT_APP_STUDYAI_API;
  const key = `${apiKey}/room/${sessionid.roomId}/topics`;

  const [roomdetail, setRoomdetail] = useState([]);
  const [teacher, setTeacher] = useState("");
  const [quizID, setQuizID] = useState("");

  const [title, setTitle] = useState()
  
  

  var getid = true;

  useEffect(() => {
    axios
      .get(key, {})
      .then((res) => {
        const data = res.data;

        console.log(data.data[0])
        setTitle(data.data[0].title)
        setRoomdetail(data.data[0].topics);
        setTeacher(data.data[0].creator);
        
        setQuizID(data.data[0].quiz);
      })
      .catch((err) => {
        alert(err);
        console.log(err);
      });
  }, [key]);


  const navigate = useNavigate();

  const handleQuiz = () => {
    // alert("button kaam kar rahi hai");
    axios
      .get(key, {})
      .then((res) => {
        const data = res.data;
        setQuizID(data.data[0].quiz);
      })
      .catch((err) => {
        alert(err);
        console.log(err);
      });

    console.log(quizID);
    navigate(`/student/quiz/${quizID}`);
  };




  return (
    <div>
      <div className="bg-purplebg min-h-screen">
        <Navbar />
        <div className="px-[2rem] p-4 flex flex-col space-y-5">
          <div className="w-full p-2 flex flex-row justify-between bg-white rounded-lg drop-shadow-md space-y-4">
            
            <div>
              <h1 className="text-4xl font-bold">{title}</h1>
              <p className="text-gray-700 mt-2">
                  Conducted by <span className="font-bold">{teacher.firstName}</span>
              </p>
            </div>
            <button className="rounded-lg bg-black text-white px-2" onClick={handleQuiz}>Take Quiz</button>

          </div>
          <div className="mb-5 mt-5 flex flex-col justify-between  md:flex-row md:items-start">
          <h4 className="ml-1 text-3xl font-bold text-navy-700 dark:text-white">
            Key Takeaways
          </h4>
        </div>

          <div>
            {roomdetail.map((topic, index) => ( <div  key={index} className="flex flex-col space-y-5 drop-shadow-sm">
              <p className="text-gray-700 text-md bg-white p-3 drop-shadow-sm my-2 rounded-lg">{topic}</p>
            </div>))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
