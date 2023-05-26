'use strict';

const { db } = require('./db');
const { Course } = require('./Course');

exports.getStudyPlan = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM userCourse JOIN course ON courseCode = code WHERE userId = ?';
    db.all(sql, [id], (err, rows) => {
      if (err) { 
        reject(err); 
      }
      else {
        const courses = rows === undefined ? [] : rows.map(r => new Course(
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

exports.savePlan = (userId, studyPlan) => {
    return new Promise((resolve, reject) => {
        const tuple = ' (?, ?)';
        const toInsert = [];
        let sql = 'INSERT INTO userCourse (userId, courseCode) VALUES';
        for(let i = 0; i < studyPlan.length; ++i){
            sql += tuple;
            if(i !== studyPlan.length - 1)
                sql += ',';
            toInsert.push(userId);
            toInsert.push(studyPlan[i]);
        }
        
        db.run(sql, toInsert, (err) => {
            if(err){
                reject(err);
                    return;
            }
            const sql2 = 'UPDATE course SET enrolledStudents = enrolledStudents + 1 WHERE code IN (SELECT courseCode FROM userCourse WHERE userId = ?)';
            db.run(sql2, [userId], (err) => {
                if(err){
                    reject(err);
                    return;
                }
                resolve(null);
            });
        });
    });
};

exports.deleteStudyPlan = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE course SET enrolledStudents = enrolledStudents - 1 WHERE code IN (SELECT courseCode FROM userCourse WHERE UserId = ?)';
        db.run(sql, [userId], (err) => {
            if(err){
                reject(err);
                return;
            }
            const sql = 'DELETE FROM userCourse WHERE userId = ?';
            db.run(sql, [userId], (err) => {
                if(err){
                    reject(err);
                    return;
                }
                resolve(null);
            });
        });
    });
};