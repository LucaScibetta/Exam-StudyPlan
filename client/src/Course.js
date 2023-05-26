function Course (code, name, credits, maxStudents, enrolledStudents = 0, preparatoryCourse = undefined, incompatibleCourses = undefined) {
    this.code = code;
    this.name = name;
    this.credits = credits;
    this.maxStudents = maxStudents;
    this.enrolledStudents = enrolledStudents;
    if(preparatoryCourse !== undefined)
        this.preparatoryCourse = preparatoryCourse;
    if(incompatibleCourses !== undefined)
        this.incompatibleCourses = [...incompatibleCourses];
}

export default Course;