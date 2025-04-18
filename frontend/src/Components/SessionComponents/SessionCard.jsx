import {useQuery } from "@tanstack/react-query";

import { getSessionById } from "../../axios/apiCalls";
import { showErrorToast } from "../../helpers/toasters";
import { ToastContainer } from "react-toastify";
import Moment from "react-moment";
import { useNavigate } from "react-router-dom";

import Card from ".";
import LoadingScreen from "../../helpers/LoadingScreen";

const SessionCard = ({session, tokem,  image, extra }) => {


  const navigate = useNavigate();
//   const handleViewRoom = () => {
//     navigate("/");
//   };

    const { isLoading, error, data:sessionDetails} = useQuery({
        queryKey: ["room", session._id],
        queryFn: getSessionById(session._id, tokem),
        refetchOnMount:true
    })

    
  const handleSessionClick = (sessionId) => {
    navigate(`/teacher/lecture/${sessionId}`);
    // navigate("/test");
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${formattedDate} ${formattedTime}`;
  }

    // if(isLoading)return <LoadingScreen/>
    // if(error) return <div>{showErrorToast(error.message)}<ToastContainer/></div>

  return (
    <>
    <Card
      extra={`flex flex-col w-full h-full !p-4 3xl:p-![18px] bg-white ${extra}`}>

      <div className="h-full w-full">
        <div className="relative w-full">
          <img
            src={image}
            className="mb-3 h-full w-full rounded-xl 3xl:h-full 3xl:w-full"
            alt=""
          />
        </div>

        <div className="mb-3 flex items-center justify-between px-1 md:justify-between lg:flex-row lg:justify-between xl:flex-row xl:justify-between 2xl:flex-row 2xl:justify-between 3xl:flex-row 3xl:justify-between">
          <div className="mb-2">
          <div className="my-2 w-full h-full flex flex-row  justify-between space-x-24">
            <p className=" text-xs w-fit font-medium text-gray-600 bg-blue-100 py-1 px-3 rounded-lg">
              {session.classroom}{" "}
            </p>
            <p className="bg-blue-100 p-2 rounded-lg text-xs font-medium text-gray-600 dark:text-white py-1 ">
              {" "}
              {/**<Moment interval={0} formata='MMMM DD YYYY'>{session.sessionDetails.createdAt}</Moment> */}
              {formatDate(session.createdAt)}
              {" "}
            </p>
          </div> 
            <div className=" flex h-full w-full flex-row justify-between xl:justify-between">
              <p className="text-xl font-bold text-navy-700 dark:text-white">
                {" "}
                {session.title}{" "}
              </p>
            </div>
            <div className="flex flex-col justify-between">
            
             
            <p className="mt-1 text-xs text-md text-gray-600 ">
              Created by {session.creator.firstName}{" "}{session.creator.lastName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center md:flex-col md:items-center lg:flex-row lg:justify-center xl:flex-col 2xl:items-center 3xl:flex-row 3xl:items-center 3xl:justify-center">
          <button
            onClick={()=> {handleSessionClick(session._id)}}
            className="linear rounded-[20px] bg-brand-900 px-4 py-2 text-base font-medium text-white bg-[#3912E6] transition duration-200 hover:bg-brand-800 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:opacity-90"
          >
            View Details
          </button>
        </div>
      </div>
      
    </Card>
    </>
  );
};

export default SessionCard;
