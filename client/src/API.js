import Course from './Course';

const SERVER_URL = 'http://localhost:3001';

const getAllCourses = async () => {
  const response = await fetch(SERVER_URL + '/api/courses');
  const coursesJson = await response.json();
  if(response.ok) {
    return coursesJson.map(c => new Course(
        c.code,
        c.name,
        c.credits,
        c.maxStudents,
        c.enrolledStudents,
        c.preparatoryCourse,
        c.incompatibleWith
    ));
  }
  else
    throw coursesJson;
};

const changeStudyPlanTime = async (studyPlanTime) => {
  const response = await fetch(SERVER_URL + `/api/users/time`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({time: studyPlanTime})
  });
  
  if(!response.ok){
    const errMessage = await response.json();
    throw errMessage;
  }
  else
    return response.status;
};

const getStudyPlanTime = async () => {
  const response = await fetch(SERVER_URL + `/api/users/time`, {
    credentials: 'include'
  });
  const timeJson = await response.json();
  if(response.ok) {
    return timeJson;
  }
  else
    throw timeJson;
};

const getStudyPlan = async () => {
  const response = await fetch(SERVER_URL + `/api/studyplans`, {
    credentials: 'include'
  });
  const coursesJson = await response.json();
  if(response.ok) {
    return coursesJson.map(c => new Course(
        c.code,
        c.name,
        c.credits,
        c.maxStudents,
        c.enrolledStudents,
        c.preparatoryCourse,
        c.incompatibleWith
    ));
  }
  else
    throw coursesJson;
};

const saveStudyPlan = async (studyPlan) => {
  const response = await fetch(SERVER_URL + `/api/studyplans`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({studyPlan: studyPlan.map(c => c.code)})
  });

  if(!response.ok){
    const errMessage = await response.json();
    throw errMessage;
  }
  else
    return response.status;
}

const deleteStudyPlan = async () => {
  const response = await fetch(SERVER_URL + `/api/studyplans`, {
    method: 'DELETE',
    credentials: 'include'
  });

  if(!response.ok){
    const errMessage = await response.json();
    throw errMessage;
  }
  else
    return response.status;
}

const logIn = async (credentials) => {
  const response = await fetch(SERVER_URL + '/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  if(response.ok) {
    const user = await response.json();
    return user;
  }
  else {
    const errDetails = await response.text();
    throw errDetails;
  }
};

const getUserInfo = async () => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    credentials: 'include',
  });
  const user = await response.json();
  if (response.ok) {
    return user;
  } else {
    throw user;  // error from the server
  }
};

const logOut = async() => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
  if (response.ok)
    return null;
}

const API = { getAllCourses, changeStudyPlanTime, getStudyPlanTime, getStudyPlan, saveStudyPlan, deleteStudyPlan, logIn, logOut, getUserInfo };
export default API;