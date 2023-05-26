import { Container, Row, Col, Button, Alert } from 'react-bootstrap';

import MyCourseTable from './MyCourseTable';
import { LoginForm } from './AuthComponents';

function DefaultView() {
  return(
    <>
      <Row>
        <Col>
          <h1>Unexisting page!</h1>
          <p>Check the url on your browser, it may be wrong!</p>
        </Col>
      </Row>
    </>
  );
}

function MainView(props) {
  return(
    <>
      <Row>
        <Container fluid className='my-2 d-flex flex-column align-items-center'>
          <h1>Our courses!</h1>
          <span>Consult the list of all our courses.</span>
          <span>You can login to see your own study plan.</span>
        </Container>
      </Row>
      <Row>
        <MyCourseTable courses={props.courses} />
      </Row>
    </>
  );
}

function LoginView(props) {
  return(
    <>
      {props.message.type !== 'not show' && <Row>
        <Alert variant={props.message.type}>{props.message.msg}</Alert>
      </Row>}
      <Row>
        <Container fluid className='my-2 d-flex flex-column align-items-center'>
          <h1>You can login from here!</h1>
          <h2>Insert your username and password to login.</h2>
        </Container>
      </Row>
      <Row>
        <LoginForm login={props.login} logout={props.logout} />
      </Row>
    </>
  );
}

function UserView(props) {
  return(
    <>
      {props.message.type !== 'not show' && <Row>
        <Alert variant={props.message.type}>{props.message.msg}</Alert>
      </Row>}
      <Row>
        <Container fluid className='my-2 d-flex flex-column align-items-center'>
          <h1>Welcome {props.name}!</h1>
          <h2>Manage your study plane.</h2>
          {props.studyPlanTime === '' ? <>
            <span className='mb-2'>Create your study plan!</span>
            <span><Button className='btn btn-secondary' onClick={() => props.createStudyPlan(props.id, 'full')}>Full-time</Button>&nbsp;
            <Button className='btn btn-secondary' onClick={() => props.createStudyPlan(props.id, 'part')}>Part-time</Button></span>
          </> :
          <>
            <span>Here's your {props.studyPlanTime}-time study plan. Remember to save all the changes!</span>
            {props.studyPlan.length === 0 && <span>Your study plan is empty, you can add courses to your study plan from the table below.</span>}
          </>
          }
          {props.studyPlan.length > 0 && <>
            <span>You currently have {props.totCredits} CFU. (min {props.studyPlanTime === 'full' ? 60 : 20}, max {props.studyPlanTime === 'full' ? 80 : 40})</span>
            <span className='text-danger'>Red-marked courses cannot be removed because they are preparatory courses for other courses in your study plan.</span>
          </>}
        </Container>
      </Row>
      <Row>
        {props.studyPlan.length > 0 && <MyCourseTable courses={props.studyPlan} studyPlan={props.studyPlan} setStudyPlan={props.setStudyPlan} showButton='Delete' />}
      </Row>
      <Row>
        {props.totCredits !== 0 && ((props.studyPlanTime === 'full' && (props.totCredits < 60 || props.totCredits > 80)) || (props.studyPlanTime === 'part' && (props.totCredits < 20 || props.totCredits > 40))) && <Container fluid className='my-2 d-flex flex-column align-items-center'>
          <span className='text-warning'>Please make sure your total credits respect the limits.</span>
        </Container>}
        <Container fluid className='my-2 d-flex justify-content-center'>
          {props.studyPlanTime !== '' && <>
            <Button className='btn btn-light mb-5 mx-2' onClick={() => props.getStudyPlan(props.id)}>Cancel changes</Button>
            <Button className='btn btn-light mb-5 mx-2' disabled={props.studyPlanTime === 'full' ? props.totCredits < 60 || props.totCredits > 80 : props.totCredits < 20 || props.totCredits > 40} onClick={() => props.saveStudyPlan(props.id, props.studyPlan)}>Save study plan</Button>
            <Button className='btn btn-light mb-5 mx-2' onClick={() => props.deleteStudyPlan(props.id)}>Delete study plan</Button>
          </>}
        </Container>
        <Container fluid className='my-2 d-flex flex-column align-items-center'>
          <h3>Our courses</h3>
          {props.studyPlanTime !== '' && <>
            <span className='text-warning'>Yellow-marked courses cannot be added to study plan because you have to add first their preparatory course.</span>
            <span className='text-danger'>Red-marked courses cannot be added to study plan because you have in your study plan an incompatible course (or the course itself).</span>
            <span className='text-success'>Green-marked courses cannot be added to study plan because they have reached maximum number of enrolled students.</span>
            <span className='text-primary'>Blue-marked courses are already present in your study plan.</span>
          </>}
        </Container>
      </Row>
      <Row>
        <MyCourseTable courses={props.courses} showButton={props.studyPlanTime !== '' ? 'Add' : ''} studyPlan={props.studyPlan} setStudyPlan={props.setStudyPlan} studyPlanTime={props.studyPlanTime} />
      </Row>
    </>
  );
}

export { DefaultView, MainView, LoginView, UserView };