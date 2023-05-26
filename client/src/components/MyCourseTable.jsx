import 'bootstrap-icons/font/bootstrap-icons.css';
import "bootstrap/js/src/collapse.js";
import React, { useState } from 'react';
import { Table, Button } from 'react-bootstrap';

function MyCourseTable(props) {
  return(<>
      <Table striped responsive className='w-75 mx-auto mb-5' variant='dark'>
        <thead>
          <tr className='text-center'>
            <th>Code</th>
            <th>Name</th>
            <th>Credits</th>
            <th>Enrolled students</th>
            <th>Max students</th>
            <th>More info?</th>
            {props.showButton !== undefined && props.showButton !== '' && <th>{props.showButton}</th>}
          </tr>
        </thead>
        <tbody>
          {
            props.courses.map((c) => 
              <CourseRow course={c} key={c.code} showButton={props.showButton} studyPlan={props.studyPlan} setStudyPlan={props.setStudyPlan} studyPlanTime={props.studyPlanTime} />)
          }
        </tbody>
      </Table>
    </>
  );
}

function CourseRow(props) {
  const [showDescription, setShowDescription] = useState(false);
  const incompatibility = props.studyPlan && props.studyPlan.some(c => c.incompatibleCourses && c.incompatibleCourses.includes(props.course.code));
  const preparatory = props.course.preparatoryCourse && props.studyPlan && props.studyPlan.every(c => c.code !== props.course.preparatoryCourse);
  const maxStudents = props.course.enrolledStudents === props.course.maxStudents;
  const already = props.studyPlan && props.studyPlan.some(c => c.code === props.course.code);
  const disabledAdd = props.studyPlan && props.studyPlanTime !== '' && props.studyPlan !== [] && (incompatibility || preparatory || maxStudents || already);
  const disabledDelete = props.studyPlan && props.studyPlan.some(c => c.preparatoryCourse === props.course.code);
  const disabled = props.showButton === 'Delete' ? disabledDelete : props.showButton === 'Add' ? disabledAdd : false;
  let violatedConstraintClass = null;

  if(props.showButton === 'Add' && already)
    violatedConstraintClass = 'table-primary';
  else if(props.showButton === 'Add' && preparatory)
    violatedConstraintClass = 'table-warning';
  else if(props.showButton === 'Add' && incompatibility)
    violatedConstraintClass = 'table-danger';
  else if(props.showButton === 'Add' && maxStudents)
    violatedConstraintClass = 'table-success';

  if(props.showButton === 'Delete' && disabledDelete)
    violatedConstraintClass = 'table-danger';

  return(
    <>
      <tr className={disabled ? violatedConstraintClass + ' text-center' : 'text-center'}>
        <CourseData key={props.course.code + 'data'} course={props.course} showDescription={showDescription} setShowDescription={setShowDescription} showButton={props.showButton} studyPlan={props.studyPlan} setStudyPlan={props.setStudyPlan} disabled={disabled} />
      </tr>
      <tr>
        <CourseDescription key={props.course.code + 'info'} course={props.course} showDescription={showDescription} />
      </tr>
    </>
  );
}

function CourseData(props) {
  return(
    <>
      <td>{props.course.code}</td>
      <td>{props.course.name}</td>
      <td>{props.course.credits}</td>
      <td>{props.course.enrolledStudents}</td>
      <td>{props.course.maxStudents ? props.course.maxStudents : 'N/A'}</td>
      <td>{props.showDescription ?
      <Button className='btn btn-light' onClick={() => props.setShowDescription(false)}><i className="bi bi-caret-up-square-fill"></i></Button> :
      <Button className='btn btn-light' onClick={() => props.setShowDescription(true)}><i className="bi bi-caret-down-square-fill"></i></Button>}</td>
      {props.showButton === 'Add' && <td><Button className='btn btn-secondary' disabled={props.disabled} onClick={() => props.setStudyPlan([...props.studyPlan, props.course])}><i className="bi bi-plus-square"></i></Button></td>}
      {props.showButton === 'Delete' && <td><Button className='btn btn-secondary' disabled={props.disabled} onClick={() => props.setStudyPlan(props.studyPlan.filter(c => c.code !== props.course.code))}><i className="bi bi-dash-square"></i></Button></td>}
    </>
  );
}

function CourseDescription(props) {
  return(
    <>
      {props.showDescription && <>
        <td colSpan={6}>
          <p className='text-left'>
            Preparatory course:&nbsp;{props.course.preparatoryCourse ? props.course.preparatoryCourse :
            'this course does not require any preparatory course.'}
            <br/>
            Incompatible cocurses:&nbsp;
            {props.course.incompatibleCourses ? props.course.incompatibleCourses.map((i) => {
              return (<React.Fragment key={props.course.code + i}><br/><span>&emsp;- {i}</span></React.Fragment>);
            })  : 'this course has no incompatible courses.'}
          </p>
        </td>
      </>}
    </>
  );
}

export default MyCourseTable;