import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { getAllRoomsForStudent } from "../../../axios/apiCalls";

import lecture1 from "../../../assets/classImages/lecture1.jpg";
import lecture2 from "../../../assets/classImages/lecture2.jpg";
import lecture3 from "../../../assets/classImages/lecture3.jpg";
import lecture4 from "../../../assets/classImages/lecture4.jpg";
import lecture5 from "../../../assets/classImages/lecture5.jpg";
import lecture6 from "../../../assets/classImages/lecture6.jpg";
import lecture7 from "../../../assets/classImages/lecture7.jpg";
import lecture8 from "../../../assets/classImages/lecture8.jpg";
import lecture9 from "../../../assets/classImages/lecture9.jpg";
import lecture10 from "../../../assets/classImages/lecture10.jpg";
import lecture11 from "../../../assets/classImages/lecture11.jpg";
import lecture12 from "../../../assets/classImages/lecture12.jpg";
import LectureCard from "../components/LectureCard";
import Banner1 from "../../../Components/SessionComponents/Banner";

const Home = () => {
  var studentData = sessionStorage.getItem("student");
  const { student, tokem } = JSON.parse(studentData);

  console.log(student.clg);
  console.log(student.classroom);
  console.log(tokem);
  console.log("home");

  const lectures = [
    {
      creator: "sdgdsg",
      title: "Session 1",
      _id: "65846",
      createdAt: "20/11/2023",
    },
    {
      creator: "sdsdgds",
      title: "Session 1",
      _id: "65846",
      createdAt: "20/11/2023",
    },
    {
      creator: "sdgsdg",
      title: "Session 1",
      _id: "65846",
      createdAt: "20/11/2023",
    },
    {
      creator: "sdgsdg",
      title: "Session 1",
      _id: "65846",
      createdAt: "20/11/2023",
    },
    {
      creator: "sdgsdg",
      title: "Session 1",
      _id: "65846",
      createdAt: "20/11/2023",
    },
    {
      creator: "sdgsdg",
      title: "Session 1",
      _id: "65846",
      createdAt: "20/11/2023",
    },
  ];

  const classImages = [
    lecture1,
    lecture2,
    lecture3,
    lecture4,
    lecture5,
    lecture6,
    lecture7,
    lecture8,
    lecture9,
    lecture10,
    lecture11,
    lecture12,
  ];

  const baseURL = process.env.REACT_APP_STUDYAI_API;
  const getAllSession = `${baseURL}/student/rooms`;
  // const getAllSession = `${baseURL}/student/rooms`;

  console.log("student token", tokem);

  const [allRooms, setAllRooms] = useState([]);

  const getStudentSessions = useCallback(async () => {

    const newData = {
      classroom: `${student.classroom}`,
      clg: `${student.clg}`,
    };

    try {
      console.log("inside trycatch student classroom", student.classroom);
      const response = await axios.post(getAllSession, newData, {
        headers: {
          Authorization: `${tokem}`,
        },
      });
      if (!response) {
        console.log("empty");
        return;
      }
      console.log("after sending axios", response.data.data);
      const { data } = response.data;
      const parsedData = JSON.parse(data);
      console.log("data of session", parsedData)
      setAllRooms(parsedData)
      console.log("allRooms", allRooms)
    } catch (error) {
      console.log("Error while fetching classrooms", error);
    }
  }, []);

  useEffect(() => {
    getStudentSessions();
  }, [getStudentSessions]);

  // const {
  //   isLoading,
  //   error,
  //   data: allRooms,
  // } = useQuery({
  //   queryKey: ["student-rooms"],
  //   queryFn: getAllRoomsForStudent(tokem, newData),
  // });

  console.log("allrooms", allRooms);

  const navigate = useNavigate();

  const handleSessionClick = (sessionId) => {
    navigate(`/student/room/${sessionId}`);
  };

  return (
    <div className="bg-purplebg min-h-screen">
      <Navbar />
      <div className="w-full px-[3rem] pt-[3rem]">
        <Banner1 bannerName={"Lectures"} />
      </div>
      <div className="px-[3rem]">
        {allRooms.length > 0 ? (
          <div className="grid grid-cols-1 msm:grid-cols-2
mmd:grid-cols-2 mlg:grid-cols-3 mxl:grid-cols-4 m2xl:grid-cols-4 gap-6
mt-8 h-full py-5">
            {allRooms.map((lecture, index) => (
              <LectureCard
                lecture={lecture}
                // tokem={tokem}
                tokem={"ab"}
                image={classImages[index % lectures.length]}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-200 rounded-md p-4 mt-8">
            <p className="text-gray-800 text-lg font-bold">
              No sessions available. Please create a new session.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;