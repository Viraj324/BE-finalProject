import React from "react";

const ShowScore = ({score, total}) => {

  console.log("Score: ", score);
  console.log("Total: ", total);
  
  return (
    <div className="font-poppins flex items-center justify-center w-full h-screen">
        <div className="flex items-center justify-center flex-col w-1/2 h-1/2 ">
          <p className="text-lg">Congrates! 🥳</p>
          <p className="text-2xl font-semi-bold">You scored: </p>
          <p className="text-4xl font-bold flex items-center">{score}<span className="text-xl text-gray-500">/{total}</span></p>
        </div>
      </div>
  );
};

export default ShowScore;
