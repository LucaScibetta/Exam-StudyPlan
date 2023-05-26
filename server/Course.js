'use strict';

function Course (code, name, credits, maxStudents, enrolledStudents = 0, preparatoryCourse = undefined, incompatibleWith = undefined) {
    this.code = code;
    this.name = name;
    this.credits = credits;
    this.maxStudents = maxStudents;
    this.enrolledStudents = enrolledStudents;
    if(preparatoryCourse !== undefined)
        this.preparatoryCourse = preparatoryCourse;
    if(incompatibleWith !== undefined)
        this.incompatibleWith = [...incompatibleWith];
}

exports.Course = Course;