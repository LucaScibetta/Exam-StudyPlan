import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Container, Row, Spinner } from 'react-bootstrap';

import MyNavbar from './components/MyNavbar';
import { DefaultView, MainView, LoginView, UserView } from './components/View';

import API from './API';

function App() {
  const [courses, setCourses] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [name, setName] = useState('');
  const [id, setId] = useState(0);
  const [studyPlanTime, setStudyPlanTime] = useState('');
  const [studyPlan, setStudyPlan] = useState([]);
  const [message, setMessage] = useState({msg: '', type: 'not show'});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const getCourses = async() => {
      const courses = await API.getAllCourses();
      setCourses(courses);
    };
    getCourses();
    setLoading(false);
  }, [loggedIn, studyPlanTime, studyPlan]);

  const createStudyPlan = async (studyPlanTime) => {
    setLoading(true);
    try{
      await API.changeStudyPlanTime(studyPlanTime)
      const time = await API.getStudyPlanTime();
      setStudyPlanTime(time ? time : '');
    }
    catch(err){
      setMessage({msg: err.error, type: 'danger'});
    }
    setLoading(false);
  };

  const saveStudyPlan = async (studyPlan) => {
    setLoading(true);
    try{
      await API.saveStudyPlan(studyPlan);
      getStudyPlan();
    }
    catch(err){
      setMessage({msg: err, type: 'danger'});
    }
    setLoading(false);
  };

  const deleteStudyPlan = async () => {
    setLoading(true);
    try{
      await API.deleteStudyPlan();
      setStudyPlanTime('');
      setStudyPlan([]);
    }
    catch(err){
      setMessage({msg: err.error, type: 'danger'});
    }
    setLoading(false);
  };

  const getStudyPlanTime = async () => {
    setLoading(true);
    try{
      const time = await API.getStudyPlanTime();
      setStudyPlanTime(time ? time : '');
    }
    catch(err){
      setMessage({msg: err.error, type: 'danger'});
    }
    setLoading(false);
  };

  const getStudyPlan = async () => {
    setLoading(true);
    try{
      const plan = await API.getStudyPlan();
      setStudyPlan(plan);
    }
    catch(err){
      setMessage({msg: err.error, type: 'danger'});
    }
    setLoading(false);
  };

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true);
      setName(user.name);
      setId(user.id);
      getStudyPlanTime(user.id);
      setMessage({type: 'not show'});
    }catch(err) {
      setMessage({msg: err, type: 'danger'});
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try{
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setName(user.name);
        setId(user.id);
        setStudyPlanTime(user.studyPlan ? user.studyPlan : '');
      }
      catch(err){
        setMessage({msg: '', type: 'not show'})
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if(studyPlanTime !== '')
      getStudyPlan();
  }, [studyPlanTime]);

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    setName('');
    setId(0);
    setStudyPlanTime('');
    setStudyPlan([]);
    setMessage({type: 'not show'});
  };

  return (
    <BrowserRouter>
      <Container fluid className='bg-dark text-light'>
        <Row>
          <MyNavbar loggedIn={loggedIn} logout={handleLogout} />
        </Row>
        {loading ? <Spinner animation='border' variant='light' className='m-5' /> :
          <Routes>
            <Route path='/' element={loggedIn ? <Navigate replace to='/profile' /> : <MainView courses={courses} />} />
            <Route path='/login' element={loggedIn ? <Navigate replace to='/profile' /> : <LoginView login={handleLogin} message={message} />} />
            <Route path='/profile' element={loggedIn ? <UserView name={name} id={id} message={message} totCredits={studyPlan.reduce((tot, c) => tot + c.credits, 0)} studyPlanTime={studyPlanTime} studyPlan={studyPlan} setStudyPlan={setStudyPlan} courses={courses} createStudyPlan={createStudyPlan} deleteStudyPlan={deleteStudyPlan} getStudyPlan={getStudyPlan} saveStudyPlan={saveStudyPlan} /> :
            <Navigate replace to='/' />} />
            <Route path='#' element={<DefaultView />} />
          </Routes>
        }
      </Container>
    </BrowserRouter>
  );
}

export default App;