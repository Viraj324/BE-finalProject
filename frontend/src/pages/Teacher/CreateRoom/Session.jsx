import React, { useState, useEffect, useCallback } from "react";

import Sidebar from "../../../Components/Sidebar";
import { FaUserCircle } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSessionById, getSessionSummary } from "../../../axios/apiCalls";
import Moment from "react-moment";
import Banner1 from "../../../Components/SessionComponents/Banner";
import LoadingScreen from "../../../helpers/LoadingScreen";


const Session = () => {
  const { id: sessionId } = useParams();
  const sessionData = sessionStorage.getItem("teacher");
  const { tokem } = JSON.parse(sessionData);
  const [sessionDetails, setSessionDetails] = useState([])

  

  const queryClient = useQueryClient();
  const sessDetails = queryClient.getQueriesData(["room", sessionId]);
  useEffect(()=>{
    setSessionDetails(sessDetails)
  },[])
  

  // const sessionDetails = {
  //   sessionDetails: [
  //     {
  //       id: "session1",
  //       title: "MERN Stack Overview",
  //       creator: {
  //         firstName: "John",
  //         lastName: "Doe",
  //       },
  //       members: [
  //         {
  //           emailID: "student1@example.com",
  //           firstName: "Alice",
  //         },
  //         {
  //           emailID: "student2@example.com",
  //           firstName: "Bob",
  //         },
  //         {
  //           emailID: "student3@example.com",
  //           firstName: "Charlie",
  //         },
  //       ],
  //       createdAt: "2024-10-01T09:00:00Z",
  //     },
  //   ],
  //   summaryData: [
  //     {
  //       creator: {
  //         firstName: "John",
  //       },
  //       quiz: "quiz1",
  //       topics: [
  //         "MongoDB is a NoSQL database that stores data in a flexible, JSON-like format. It allows for easy scalability and offers a schema-less design, making it ideal for applications that need to handle large volumes of unstructured data. In the MERN stack, MongoDB is used to store and manage application data efficiently.",
  
  //         "Express.js is a minimal and flexible Node.js web application framework that simplifies building server-side applications. It provides robust tools for handling HTTP requests, defining API routes, and managing middleware, which are essential for creating RESTful services that interact with the MongoDB database.",
  
  //         "React is a powerful JavaScript library for building user interfaces, particularly single-page applications where a fast and dynamic user experience is essential. React uses a virtual DOM to improve performance and enables developers to build reusable UI components, making front-end development efficient and maintainable in the MERN stack.",
  
  //         "Node.js is a server-side runtime environment that allows JavaScript to be used for back-end development. Built on Chrome's V8 JavaScript engine, Node.js enables non-blocking, event-driven programming, making it highly efficient for handling concurrent requests in web applications. It serves as the backbone of the MERN stack, connecting the front-end and back-end seamlessly.",
  
  //         "Together, the MERN stack provides a complete framework for full-stack development, offering an efficient workflow where MongoDB handles data storage, Express manages server-side operations, React powers the client-side UI, and Node.js enables scalable back-end functionality. This combination is widely used for modern web applications due to its flexibility and performance benefits."
  //       ],
  //     },
  //   ],
  // };
  

  const {data} = getSessionById(sessionId, tokem)
  console.table("sessiondetails", sessionDetails)
  // const summaryData = sessionDetails.summaryData;
  // const isSummaryLoading = false;

  const {
    isLoading: isSummaryLoading,
    error,
    data: summaryData,
  } = useQuery({
    queryKey: ["summary", sessionId],
    queryFn: getSessionSummary(sessionId),
  });

  if (!sessionDetails) return <h1>Loading...</h1>;

  if (isSummaryLoading) return <LoadingScreen/>
  if (error) return <h1 className="text-center">{error.message}</h1>;
  // console.log("sessiondetails in session", sessionDetails[0][1]);

  return (
    <div className="bg-purplebg min-h-screen ">
      {console.log("summarydata", summaryData)}
      <div className="grid grid-cols-11">
        <div
          className="block msm:hidden col-start-1 col-end-3 bg-white
text-[#9696a6] min-h-screen fixed w-[18%]"
        >
          <Sidebar />
        </div>
        <section className="col-start-3 col-end-12 min-h-screen px-8">
          
        <div className="px-5 py-2">
            { !isSummaryLoading &&
              <div className="flex flex-col justify-start items-start gap-5 ">
              {/* <Banner1 bannerName={sessionDetails[0][1]?.title}/> */}
              <div className="flex flex-row justify-between w-full mt-4">
                <p className="text-3xl font-serif">
                  Conducted by: {summaryData[0]?.creator?.firstName}
                </p>{" "}
                <button className="bg-blue-600 text-white p-3 hover:bg-blue-700 rounded-xl">
                <Link
                  to={`/teacher/quiz/${summaryData[0].quiz}`}
                  className="visited:text-white text-lg"
                >
                  see quiz
                </Link>
                </button>
              </div>
              <div className="border-b-2 pb-2 space-y-4">
                <p className="text-xl  font-semibold font-serif">
                  Topics covered:
                </p>
                {summaryData[0].topics.map((topic, index) => (
                  <p
                    key={index}
                    className="mt-2  px-5 py-5
rounded-md border-gray-700 bg-white drop-shadow-md"
                  >
                    {topic}
                  </p>
                ))}
              </div>

              <div>
                <div>
                  <p className="text-gray-500 text-xl font-serif">
                    Attented Students
                  </p>
                </div>
                <div className="flex flex-row space-x-5">
                  {/* {sessionDetails[0][1].members.map((member, index) => ( */}
                    {/* <div key={index} className="flex flex-col border-black">
                      <p>No: {index+1}</p>
                     <p> Email: {member.emailID}</p>
                     <p> Email: {member.firstName}</p>
                    </div>
                  ))} */}
                </div>
              </div>
            </div>
            }
          </div>
        </section>
      </div>
    </div>
  );
};

export default Session;