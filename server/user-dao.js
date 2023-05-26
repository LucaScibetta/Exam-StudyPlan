'use strict';

const { db } = require('./db');
const crypto = require('crypto');
const { resolve } = require('path');

exports.getUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM user WHERE username = ?';
    db.get(sql, [username], (err, row) => {
      if (err) { 
        reject(err); 
      }
      else if (row === undefined) { 
        resolve(false); 
      }
      else {
        const user = {id: row.id, username: row.username, name: row.name, studyPlan: row.studyPlan};
  
        crypto.scrypt(password, row.salt, 64, function(err, hashedPassword) {
          if (err) reject(err);
          if(!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword))
            resolve(false);
          else
            resolve(user);
        });
      }
    });
  });
};

exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM user WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) { 
        reject(err); 
      }
      else if (row === undefined) { 
        resolve({error: 'User not found!'}); 
      }
      else {
        const user = {id: row.id, username: row.username, name: row.name};
        resolve(user);
      }
    });
  });
};

exports.getStudyPlanTime = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT studyPlan FROM user WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if(err){
        reject(err);
        return;
      }
      resolve(row.studyPlan);
    })
  })
}

exports.updateStudyPlanTime = (id, time) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE user SET studyPlan = ? WHERE id = ?';
    db.run(sql, [time === 'null' ? null : time, id], (err) => {
      if(err){
        reject(err);
        return;
      }
      resolve(null);
    });
  });
};