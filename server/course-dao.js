'use strict';

const { db } = require('./db');
const { Course } = require('./Course');

exports.listCourses = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM course ORDER BY name';
    db.all(sql, [], (err, rows) => {
      if (err) { 
        reject(err); 
      }
      else {
        const courses = rows.map(r => new Course(
          r.code,
          r.name,
          r.credits,
          r.maxStudents? r.maxStudents : undefined,
          r.enrolledStudents,
          r.preparatoryCourse ? r.preparatoryCourse : undefined,
          r.incompatibleWith ? r.incompatibleWith.split(' ') : undefined
        ));
        resolve(courses);
      }
    });
  });
};