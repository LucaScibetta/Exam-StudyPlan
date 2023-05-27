'use strict';

// Imports
const express = require('express');
const morgan = require('morgan');
const courseDao = require('./course-dao');
const studyplanDao = require('./studyplan-dao');
const userDao = require('./user-dao');
const {check, validationResult} = require('express-validator');
const cors = require('cors');

// Passport imports
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');

// Init express
const app = new express();
const port = 3001;

// Middlewares
app.use(morgan('dev'));
app.use(express.json());

app.use(session({
  secret: "The one piece is friendship",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

// CORS
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials : true,
};
app.use(cors(corsOptions));

const isLoggedIn = (req,res,next) =>{
    if(req.isAuthenticated()){
        return next();
    }

    return res.status(400).json({error : "Not authorized!"});
}

//Passport: local strategy
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await userDao.getUser(username, password);
  if(!user)
    return cb(null, false, 'Incorrect username and/or password.');
    
  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) {
  return cb(null, user);
});

/*** APIs ***/

// GET /api/courses
app.get('/api/courses', (req, res) => {
  courseDao.listCourses()
  .then(courses => res.status(200).json(courses))
  .catch(() => res.status(500).json({"error": "Database error."}));
});

// PUT /api/users/time
app.put('/api/users/time', [
    check('time').isAlpha().isIn(['full', 'part', 'null'])
], isLoggedIn, (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())
        return res.status(422).json({error: "Invalid value for study plan time."});
    userDao.getUserById(req.user.id)
    .then(u => {
        if(u.error !== undefined)
            return res.status(404).json(u);
        studyplanDao.getStudyPlan(req.user.id)
        .then(studyPlan => {
            if(studyPlan.length > 0)
                return res.status(409).json({"error": "Study plan time should be chosen before adding courses to it."});
            userDao.updateStudyPlanTime(req.user.id, req.body.time)
            .then(() => res.status(200).json({"message": "Study plan time updated."}))
            .catch(() => res.status(503).json({"error": "Database error."}));
        })
        .catch(() => res.status(503).json({"error": "Database error."}));
        
    })
    .catch(() => res.status(503).json({"error": "Database error."}));
});

// GET /api/users/time
app.get('/api/users/time', isLoggedIn, (req, res) => {
    userDao.getStudyPlanTime(req.user.id)
    .then(t => res.status(200).json(t))
    .catch(() => res.status(500).json({"error": "Database error."}));
});

// GET /api/studyplans
app.get('/api/studyplans', isLoggedIn, (req, res) => {
    studyplanDao.getStudyPlan(req.user.id)
    .then(s => res.status(200).json(s))
    .catch(() => res.status(500).json({"error": "Database error."}));
});

// POST /api/studyplans
app.post('/api/studyplans', [
    check('studyPlan').custom(studyplan => {
        if(!Array.isArray(studyplan))
            throw new Error('Invalid study plan.');
        if(studyplan.some(c => c.length !== 7))
            throw new Error('Invalid course in study plan.');
        if(studyplan.some((c, i, s) => s.indexOf(c) !== i))
            throw new Error('Study plan cannot have the same course twice.');
        return true;
    })
], isLoggedIn, (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({errors: errors.array()});
    }
    userDao.getStudyPlanTime(req.user.id)
    .then(studyPlanTime => {
        if(studyPlanTime === null){
            return res.status(404).json({"error": "Study plan not found."})
        }
        courseDao.listCourses()
        .then(courses => {
            let totCredits = 0;
            let unexisting = false;
            let incompatibility = false;
            let preparatory = false;
            const maxStudentsReached = [];
            let maxStudents = false;
            
            req.body.studyPlan.forEach(myCourse => {
                let incompatibleWith;
                let preparatoryCourse;
                if(courses.every(c => {
                    if(c.code !== myCourse)
                        return true;
                    totCredits += c.credits;
                    incompatibleWith = c.incompatibleWith ? [...c.incompatibleWith] : undefined;
                    preparatoryCourse = c.preparatoryCourse;
                    if(c.enrolledStudents === c.maxStudents)
                        maxStudentsReached.push(c.code);
                    return false;
                }))
                    unexisting = true;
                    
                if(incompatibleWith !== undefined && req.body.studyPlan.some(c => incompatibleWith.includes(c)))
                    incompatibility = true;
                
                if(preparatoryCourse !== undefined && req.body.studyPlan.every(c => c !== preparatoryCourse))
                    preparatory = true;
            });

            if(unexisting)
                return res.status(422).json({"error": "Unexisting course in study plan."});

            if(incompatibility)
                return res.status(409).json({"error": "Incompatibility constraint violated."});

            if(preparatory)
                return res.status(409).json({"error": "Preparatory course constraint violated."});

            if(maxStudentsReached !== []){
                studyplanDao.getStudyPlan(req.user.id)
                .then(courses => {
                    maxStudentsReached.forEach(code => {
                        if(courses.every(course => course.code !== code))
                            maxStudents = true;
                    })
                })
            }

            if(maxStudents)
                return res.status(409).json({"error": "A course has already reached maximum enrolled students."});
            
            if((studyPlanTime === 'full' && (totCredits < 60 || totCredits > 80)) ||
               (studyPlanTime === 'part' && (totCredits < 20 || totCredits > 40)))
                return res.status(409).json({"error": "Number of credits violate constraints."});
            
            studyplanDao.deleteStudyPlan(req.user.id)
            .then(() => {
                studyplanDao.savePlan(req.user.id, req.body.studyPlan)
                .then(() => res.status(201).json({"message": "Study plan correctly saved."}))
                .catch(() => res.status(503).json({"error": "Database error."}));
            })
            .catch(() => res.status(503).json({"error": "Database error."}));
        })
        .catch(() => res.status(503).json({"error": "Database error."}));
    })
    .catch(() => res.status(503).json({"error": "Database error."}))
});

// DELETE /api/studyplans
app.delete('/api/studyplans', isLoggedIn, (req, res) => {
    studyplanDao.deleteStudyPlan(req.user.id)
    .then(() => {
        userDao.updateStudyPlanTime(req.user.id, 'null')
        .then(() => res.status(204).json({"message": "Study plan correctly deleted."}))
        .catch(() => res.status(503).json({"error": "Database error."}));
    })
    .catch(() => res.status(503).json({"error": "Database error."}));
});

// POST /api/sessions
app.post('/api/sessions', function(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
      if (err)
        return next(err);
      if (!user) {
        return res.status(401).send(info);
      }
      
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        return res.status(201).json(req.user);
      });
    })(req, res, next);
  });

// DELETE /api/session/current
app.delete('/api/sessions/current', (req, res) => {
    req.logout(() => {
      res.status(200).end();
    });
  });

// GET /api/sessions/current
app.get('/api/sessions/current', (req, res) => {
    if(req.isAuthenticated())
        return res.status(200).json(req.user);
    else
        return res.status(401).json({error: 'Not authenticated'});
  });

// activate the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });