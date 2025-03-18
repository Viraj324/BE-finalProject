import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

import { isLoggedInTeacher } from '../auth';

const TeacherRoute = () => {

    const teacher = sessionStorage.getItem('teacher');
    // console.log("Teacher from session storage: ", teacher)

    if(teacher !== null) {
        return <Outlet/>
    }
    else {

        return <Navigate to= {"/select"}/>;
    }
}

export default TeacherRoute;