// my student class
class Student {
    constructor(id, name, surname, grade1, grade2, lectures, letterGrade) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.grade1 = grade1;
        this.grade2 = grade2;
        this.lectures = lectures;
        this.letterGrade = letterGrade;
        this.gpa = 0.0;
    }
    // Method that returns student information in HTML format
    getStudentInfoHTML() {
        return `
            <td>${this.id}</td>
            <td>${this.name}</td>
            <td>${this.surname}</td>
            <td>${this.grade1}</td>
            <td>${this.grade2}</td>
            <td>${this.lectures}</td>
            <td>${this.letterGrade}</td>
            <td>
            <button class = "update-button" onclick="updateStudent('${this.id}','${this.lectures}')">Update</button>
            <button class = "delete-button" onclick="deleteStudent('${this.id}')">Delete</button>
        </td>
        `;
    }
    // Convert student instance to JSON object
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            surname: this.surname,
            grade1: this.grade1,
            grade2: this.grade2,
            lectures: this.lectures,
            letterGrade: this.letterGrade
        };
    }

    //create student instance from JSON object
    static fromJSON(json) {
        return new Student(json.id, json.name, json.surname, json.grade1, json.grade2, json.lectures, json.letterGrade);
    }
}
//my lecture class
class Lecture {
    constructor(code, name, credit) {
        this.code = code;
        this.name = name;
        this.credit = credit;
    }

    // method that returns course information and students in HTML format
    getLectureInfoHTML() {
        return `
        <td>${this.code}</td>
        <td>${this.name}</td>
        <td>${this.credit}</td>
        <td>
            <button class = "update-button" onclick="updateLecture('${this.code}')">Update</button>
            <button class = "delete-button" onclick="deleteLecture('${this.code}')">Delete</button>
        </td>
    `;
    }

    // convert course instance to JSON objec
    toJSON() {
        return {
            code: this.code,
            name: this.name,
            credit: this.credit
        };
    }
    // creating a course instance from JSON object
    static fromJSON(json) {
        return new Lecture(json.code, json.name, json.credit);
    }
}

let students = [];  // my student list
let lectures = []; // my lecture list

document.addEventListener('DOMContentLoaded', function () {
    //Pull data from local storage first when page loads
    initializeFromLocalStorage();

    //automatic course and student adding function
    if (lectures.length === 0 && students.length === 0) {
        addLectureAuto();
        addStudentAuto();
    }
    else {
        // console.log(lectures.length);
        // console.log(students.length);
    }
    // first page is homepage
    changeContent('Homepage');
});

//Create custom designs for each content
function changeContent(content) {
    var contentArea = document.getElementById('contentArea');
    if (content === 'Homepage') {
        contentArea.innerHTML = `
        <div class="welcome-container">
        <h1 class="welcome-heading">Student Course System</h1>
        <p class="welcome-text">
            Hello! On this platform, you can manage the student course system, view student information,
            add courses, or track student success statuses.
        </p>
    </div>
    <div class="feature-highlights">
        <div class="feature">
            <i class="fa fa-book"></i>
            <h3>Student Information</h3>
            <p>Manage information such as student ID, name, surname, and enrolled courses.</p>
        </div>
        <div class="feature">
            <i class="fa fa-users"></i>
            <h3>Courses</h3>
            <p>Check details about the total number of courses, course codes, and credits.</p>
        </div>
        <div class="feature">
            <i class="fa fa-plus-circle"></i>
            <h3>Extras</h3>
            <p>Discover and use additional features on the platform.</p>
        </div>
    </div>
`;

        var studentInfoFeature = document.querySelector('.feature:nth-child(1)');
        var lecturesFeature = document.querySelector('.feature:nth-child(2)');
        var extrasFeature = document.querySelector('.feature:nth-child(3)');
        // Add click event listeners
        studentInfoFeature.addEventListener('click', function () {
            changeContent('Students'); // Replace 'StudentInfo' with the content identifier you want
        });

        lecturesFeature.addEventListener('click', function () {
            changeContent('Lectures'); // Replace 'Lectures' with the content identifier you want
        });

        extrasFeature.addEventListener('click', function () {
            changeContent('Extras'); // Replace 'Extras' with the content identifier you want
        });

        // I hide some forms
        addStudentFormContainer.style.display = 'none';
        addLectureFormContainer.style.display = 'none';
        failedStudentHome.style.display = "none";
        succededStudentHome.style.display = "none";
        studentGpaContainer.style.display = "none";
        studentTableContainer.style.display = 'none';
        resetExtras();
    } else if (content === 'Students') {
        populateLectureDropdown();

        contentArea.innerHTML = ``;
        // I hide some forms
        addStudentFormContainer.style.display = 'block';
        addLectureFormContainer.style.display = 'none';
        failedStudentHome.style.display = "none";
        succededStudentHome.style.display = "none";
        studentGpaContainer.style.display = "none";
        studentTableContainer.style.display = 'block';

        // Update the student list on the screen
        updateStudentList()
        resetExtras();
    }

    else if (content === 'Lectures') {
        // Course list and students taking the course
        contentArea.innerHTML =
            `
        <div id="lectureTableContainer" style="display: block;">
            <h1 style="color: #2b2626; font-size: 3em;">Lectures</h1>
            <table class="lectureTable" border="1">
            <thead>
                <tr>
                    <th>Lecture Code</th>
                    <th>Lecture Name</th>
                    <th>Lecture Credit</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="lectureList">
            </tbody>
            </table>
        </div>
    `;

        if (lectures.length === 0) {
            lectureTableContainer.style.display = 'none';
        }
        // I hide some forms
        addStudentFormContainer.style.display = 'none';
        addLectureFormContainer.style.display = 'block';
        failedStudentHome.style.display = "none";
        succededStudentHome.style.display = "none";
        studentGpaContainer.style.display = "none";
        studentTableContainer.style.display = 'none';
        updateLectureList()
        resetExtras();
    }
    else if (content === 'Extras') {
        populateLectureDropdownHome();
        populateLectureDropdownHomeSucceded();
        populateLectureDropdownHomeStudents();

        // call getFailedStudentsByCourse function when courseSelectHome changes
        document.getElementById('courseSelectHome').addEventListener('change', function () {
            getFailedStudentsByCourse();
        });
        document.getElementById('courseSelectHome2').addEventListener('change', function () {
            getSuccededStudentsByCourse();
        });
        document.getElementById('selectStudentHome').addEventListener('change', function () {
            getStudentsListForHome();
        });

        contentArea.innerHTML = `
         `;
        // I hide some forms
        addStudentFormContainer.style.display = 'none';
        addLectureFormContainer.style.display = 'none';
        failedStudentHome.style.display = "block";
        succededStudentHome.style.display = "block";
        studentGpaContainer.style.display = "block";
        studentTableContainer.style.display = 'none';
    }
}
// Function to find a student by ID
function findStudentById(studentId) {
    // Assume students is an array containing existing student objects
    return students.find(function (student) {
        return student.id === studentId;
    });
}

// Listen for ID input changes when adding students
var newStudentID = document.getElementById('studentID');
newStudentID.addEventListener('input', function () {
    console.log(newStudentID.value);

    var enteredId = newStudentID.value;

    if (enteredId.length > 8) {
        console.log(enteredId.length);
        var student = students.find(student => student.id === enteredId);
        if (student) {
            // If you are a current student, fill out the form
            document.getElementById('studentName').value = student.name;
            document.getElementById('studentSurname').value = student.surname;
        }
    }
    else {
        // If ID field is less than 7 characters, clear other fields
        document.getElementById('studentName').value = '';
        document.getElementById('studentSurname').value = '';
    }
});

// part of adding student
document.getElementById('addStudentButton').addEventListener('click', function () {
    var studentIdInput = document.getElementById('studentID');
    var studentNameInput = document.getElementById('studentName');
    var studentSurnameInput = document.getElementById('studentSurname');
    var studentGrade1Input = document.getElementById("grade1");
    var studentGrade2Input = document.getElementById("grade2");
    var studentLecturesInput = document.getElementById('studentLectures');

    // Basic validation
    if (!studentIdInput.value || !studentNameInput.value || !studentSurnameInput.value || !studentGrade1Input.value
        || !studentGrade2Input.value || !studentLecturesInput.value) {
        alert('Please fill in all fields.');
        return;
    }
    // Validate numeric input for studentId
    if (isNaN(studentIdInput.value) || parseInt(studentIdInput.value) <= 0) {
        alert('Please enter a valid positive numeric value for Student ID.');
        return;
    }
    // Validate numeric input for grades (between 0 and 100)
    if (isNaN(studentGrade1Input.value) || parseInt(studentGrade1Input.value) < 0 || parseInt(studentGrade1Input.value) > 100) {
        alert('Please enter a valid numeric value between 0 and 100 for Midterm Grade.');
        return;
    }
    if (isNaN(studentGrade2Input.value) || parseInt(studentGrade2Input.value) < 0 || parseInt(studentGrade2Input.value) > 100) {
        alert('Please enter a valid numeric value between 0 and 100 for Final Grade.');
        return;
    }
    if (studentLecturesInput.value === "---") {
        alert('Please select a lecture from the dropdown menu.');
        return;
    }
    if (studentIdInput.value.length < 9) {
        alert('Invalid ID. The student ID must be 9 digits.');
        return;
    }
    // Check if the student with the given ID already exists
    var existingStudent = findStudentById(parseInt(newStudentID.value));
    if (existingStudent) {
        // If the student exists, auto-fill the form with existing data
        studentNameInput.value = existingStudent.name;
        studentSurnameInput.value = existingStudent.surname;
        alert('Student with ID ' + studentIdInput.value + ' already exists. Form filled with existing data.');
        return;
    }

    // Check if the student has already selected the course
    var selectedCourseId = studentLecturesInput.value;
    var control = true;
    students.forEach(function (std) {
        if (std.id === studentIdInput.value) {
            var student = students.find(student => student.id === studentIdInput.value);
            if (student.lectures === studentLecturesInput.value) {
                control = false;
                alert('Student with ID ' + studentIdInput.value + ' has already selected the course ' + selectedCourseId + '.');
                return;
            }
        }
    });

    if (control) {
        // Get information received from the user
        var studentId = studentIdInput.value;
        var studentName = studentNameInput.value;
        var studentSurname = studentSurnameInput.value;
        var studentGrade1 = studentGrade1Input.value;
        var studentGrade2 = studentGrade2Input.value;
        var studentLectures = studentLecturesInput.value;

        // Calculate student's grade
        var totalGrade = calculateTotalGrade(studentGrade1, studentGrade2);
        var letterGrade = calculateLetterGrade(totalGrade);
        console.log(letterGrade);

        // Create a new student object
        var newStudent = new Student(studentId, studentName, studentSurname, studentGrade1, studentGrade2, studentLectures, letterGrade);

        // Add student to list
        students.push(newStudent);

        // Add student to local storage
        addStudentToLocalStorage(newStudent);

        // clean form
        studentIdInput.value = '';
        studentNameInput.value = '';
        studentSurnameInput.value = '';
        studentGrade1Input.value = '';
        studentGrade2Input.value = '';
        studentLecturesInput.value = '';
        control = true;
    }
});

// part off adding course
document.getElementById('addLectureButton').addEventListener('click', function () {
    var lectureCodeInput = document.getElementById('lectureCode');
    var lectureNameInput = document.getElementById('lectureName');
    var lectureCreditInput = document.getElementById('lectureCredit');
    var lectureList = document.getElementById('lectureList');

    // Basic validation
    if (!lectureCodeInput.value || !lectureNameInput.value || !lectureCreditInput.value) {
        alert('Please fill in all fields.');
        return;
    }
    // Validate numeric input for lectureCredit
    if (isNaN(lectureCreditInput.value) || parseInt(lectureCreditInput.value) <= 0) {
        alert('Please enter a valid positive numeric value for Lecture Credit.');
        return;
    }
    if (parseInt(lectureCreditInput.value) > 8) {
        alert('Lecture credit cannot exceed 8.');
        return;
    }

    // Get information received from the user
    var lectureCode = lectureCodeInput.value;
    var lectureName = lectureNameInput.value;
    var lectureCredit = lectureCreditInput.value;

    // Create a new course object
    var newLecture = new Lecture(lectureCode, lectureName, lectureCredit);

    // add lesson to list
    lectures.push(newLecture);
    //Add the course to local repository
    addLectureToLocalStorage(newLecture);

    // clean form 
    lectureCodeInput.value = '';
    lectureNameInput.value = '';
    lectureCreditInput.value = '';
    if (lectures.length !== 0) {
        lectureTableContainer.style.display = 'block';
    }
});


// Adding a new student to local
function addStudentToLocalStorage(student) {
    let existingStudents = JSON.parse(localStorage.getItem('students')) || [];
    existingStudents.push(student);
    // Save the updated array back to local storage
    localStorage.setItem('students', JSON.stringify(existingStudents));
    updateStudentList();
}

// Adding a new lecture to local
function addLectureToLocalStorage(lecture) {
    let existingLectures = JSON.parse(localStorage.getItem('lectures')) || [];
    existingLectures.push(lecture);
    localStorage.setItem('lectures', JSON.stringify(existingLectures));
    updateLectureList();
}

// Function that runs at startup (will be called when the page loads)
//It takes the list of students and courses and fills it in directly.
function initializeFromLocalStorage() {
    let storedStudents = JSON.parse(localStorage.getItem('students')) || [];
    let storedLectures = JSON.parse(localStorage.getItem('lectures')) || [];

    students = storedStudents.map(studentJson => Student.fromJSON(studentJson));
    lectures = storedLectures.map(lectureJson => Lecture.fromJSON(lectureJson));
}

// update student list
function updateStudentList() {
    var studentList = document.getElementById('studentList');
    studentList.innerHTML = "";
    students.forEach(function (student) {
        var studentInfoHTML = student.getStudentInfoHTML();
        var listItem = document.createElement('tr');
        listItem.innerHTML = studentInfoHTML;
        studentList.appendChild(listItem);
    });
}

// function that updates student table
function updateStudentList2() {
    var studentList = document.getElementById('studentList');
    studentList.innerHTML = "";

    let studentsFromLocalStorage = JSON.parse(localStorage.getItem("students")) || [];

    //Add a row to the table for each student
    studentsFromLocalStorage.forEach(function (studentJson) {
        var student = Student.fromJSON(studentJson);
        var studentInfoHTML = student.getStudentInfoHTML();
        var listItem = document.createElement('tr');
        listItem.innerHTML = studentInfoHTML;
        studentList.appendChild(listItem);
    });
}

// function that updates lecture table
function updateLectureList2() {
    var lectureList = document.getElementById('lectureList');
    lectureList.innerHTML = "";
    let lecturesFromLocalStorage = JSON.parse(localStorage.getItem("lectures")) || [];
    lecturesFromLocalStorage.forEach(function (lectureJson) {
        var lecture = Lecture.fromJSON(lectureJson);
        var lectureInfoHTML = lecture.getLectureInfoHTML();
        var listItem = document.createElement('tr');
        listItem.innerHTML = lectureInfoHTML;
        lectureList.appendChild(listItem);
    });
}



// update lecture list on screen
function updateLectureList() {
    var lectureList = document.getElementById('lectureList');
    lectureList.innerHTML = "";
    lectures.forEach(function (lecture) {
        var lectureInfoHTML = lecture.getLectureInfoHTML();
        var listItem = document.createElement('tr');
        listItem.innerHTML = lectureInfoHTML;
        lectureList.appendChild(listItem);
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
}

// Function that adds courses to the drop-down menu
function populateLectureDropdown() {
    var lectureDropdown = document.getElementById('studentLectures');
    lectureDropdown.innerHTML = '';
    //I wrote it for an empty option placeholder
    var option = document.createElement('option');
    option.value = "---";
    option.text = "---";
    lectureDropdown.appendChild(option);

    lectures.forEach(function (lecture) {
        var option = document.createElement('option');
        option.value = lecture.code; // Set course code as value
        option.text = lecture.name; // Set course name as text
        lectureDropdown.appendChild(option);
    });
}

// Function that deletes the course
function deleteLecture(code) {
    // Delete the course from local storage
    deleteLectureFromLocalStorage(code);
    // Check and delete students taking the course
    deleteStudentsWithLecture(code);
    // Delete course from table
    removeLectureFromTable();
    updateLectureList();
    if (lectures.length === 0) {
        lectureTableContainer.style.display = 'none';
    }
}

// delete student
function deleteStudent(id) {
    students = students.filter(student => student.id !== id);
    localStorage.setItem('students', JSON.stringify(students));
    updateStudentList();
}

// Function that deletes the course from local storage
function deleteLectureFromLocalStorage(code) {
    lectures = lectures.filter(lecture => lecture.code !== code);
    localStorage.setItem('lectures', JSON.stringify(lectures));
}

// Function that checks and deletes students who have taken the course
function deleteStudentsWithLecture(code) {
    students.forEach(student => {
        if (student.lectures === code) {
            student.grade1 = "";
            student.grade2 = "";
            student.letterGrade = "";
            student.lectures = "";
        }
    });
    updateStudentsInLocalStorage();
}
// Function that updates student array to local storage
function updateStudentsInLocalStorage() {
    localStorage.setItem('students', JSON.stringify(students));
}
//Function that updates the course array to local storage
function updateLecturesInLocalStorage() {
    localStorage.setItem('lectures', JSON.stringify(lectures));
}


// Function that deletes the course from the table
function removeLectureFromTable(code) {
    var lectureList = document.getElementById('lectureList');
    var rowToRemove = Array.from(lectureList.children).find(row => row.firstChild.textContent === code);
    if (rowToRemove) {
        lectureList.removeChild(rowToRemove);
    }
}

// Function that calculates total grades
function calculateTotalGrade(midterm, final) {
    var totalGrade = (0.4 * parseFloat(midterm)) + (0.6 * parseFloat(final));
    return totalGrade;
}

// Function that calculates letter grade (for scale 10)
function calculateLetterGrade(totalGrade) {
    if (totalGrade >= 90) {
        return 'A';
    } else if (totalGrade >= 80) {
        return 'B';
    } else if (totalGrade >= 70) {
        return 'C';
    } else if (totalGrade >= 60) {
        return 'D';
    } else {
        return 'F';
    }
}

// Function that calculates letter grade (for scale 7)
function calculateLetterGrade7(totalGrade) {
    if (totalGrade >= 93) {
        return 'A';
    } else if (totalGrade >= 85) {
        return 'B';
    } else if (totalGrade >= 77) {
        return 'C';
    } else if (totalGrade >= 70) {
        return 'D';
    } else {
        return 'F';
    }
}

// Function that adds student grades to the table
function addLetterToTable(student, letterGrade) {
    var studentList = document.getElementById('studentList');
    var studentInfoHTML = student.getStudentInfoHTML() +
        `<td>${letterGrade}</td>`;
    var listItem = document.createElement('tr');
    listItem.innerHTML = studentInfoHTML;
    studentList.appendChild(listItem);
}

// Student search function
function searchStudents() {
    var searchInput = document.getElementById('searchStudent').value.toLowerCase();
    var filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchInput) ||
        student.surname.toLowerCase().includes(searchInput)
    );
    updateStudentListForSearch(filteredStudents);
}

function searchStudentsByLecture() {
    var searchLectureInput = document.getElementById('searchLecture').value.toLowerCase();

    var filteredStudents = students.filter(student =>

        (student.lectures.toLowerCase().includes(searchLectureInput))
    );
    console.log(filteredStudents);
    updateStudentListForSearch(filteredStudents);
}

// Update the student list on the screen (based on search results)
function updateStudentListForSearch(studentArray) {
    var studentList = document.getElementById('studentList');
    studentList.innerHTML = "";
    (studentArray || students).forEach(function (student) {
        var studentInfoHTML = student.getStudentInfoHTML();
        var listItem = document.createElement('tr');
        listItem.innerHTML = studentInfoHTML;
        studentList.appendChild(listItem);
    });
}
//function that set the scale
function printLetterGrade() {
    let studentList = [];
    studentList = JSON.parse(localStorage.getItem("students"));
    var gradeScale = document.getElementById("gradeScale");
    console.log(gradeScale.value);
    if (gradeScale.value.trim() === "7") {
        studentList.forEach(student => {
            var totalGrade = calculateTotalGrade(student.grade1, student.grade2);
            var letter = calculateLetterGrade7(totalGrade);
            console.log(letter);
            student.letterGrade = letter;
            localStorage.setItem("students", JSON.stringify(studentList));
        })
    }
    else {
        studentList.forEach(student => {
            var totalGrade = calculateTotalGrade(student.grade1, student.grade2);
            var letter = calculateLetterGrade(totalGrade);
            console.log(letter);
            student.letterGrade = letter;
            localStorage.setItem("students", JSON.stringify(studentList));

        })
    }
    updateStudentList2();
}

// For failure in the extra section of the function that adds the courses to the drop-down menu
function populateLectureDropdownHome() {
    var courseSelect = document.getElementById('courseSelectHome');
    courseSelect.innerHTML = '';
    var option = document.createElement('option');
    option.value = "---";
    option.text = "---";
    courseSelect.appendChild(option);

    lectures.forEach(function (lecture) {
        var option = document.createElement('option');
        option.value = lecture.code;
        option.text = lecture.name;
        courseSelect.appendChild(option);
    });
}

// Function that returns unsuccessful students
function getFailedStudentsByCourse() {
    var selectedCourseCode = document.getElementById('courseSelectHome').value;
    console.log(selectedCourseCode);
    var studentsFromLocalStorage = JSON.parse(localStorage.getItem('students')) || [];
    var failedStudents = studentsFromLocalStorage.filter(student => {
        return student.lectures.includes(selectedCourseCode) && student.letterGrade === 'F';
    });
    displayFailedStudents(failedStudents);
}

// Function showing unsuccessful students
function displayFailedStudents(failedStudents) {
    var failedStudentsList = document.getElementById('failedStudentsList');
    failedStudentsList.innerHTML = '';
    failedStudents.forEach(student => {
        var listItem = document.createElement('div');
        listItem.innerHTML = `<p>${student.name} ${student.surname} - ${student.letterGrade}</p>`;
        failedStudentsList.appendChild(listItem);
    });
}

// For success in the extra section of the function that adds the courses to the drop-down menu
function populateLectureDropdownHomeSucceded() {
    var courseSelect = document.getElementById('courseSelectHome2');
    courseSelect.innerHTML = '';
    var option = document.createElement('option');
    option.value = "---";
    option.text = "---";
    courseSelect.appendChild(option);
    lectures.forEach(function (lecture) {
        var option = document.createElement('option');
        option.value = lecture.code;
        option.text = lecture.name;
        courseSelect.appendChild(option);
    });
}

function resetExtras() {
    var failedStudentsList = document.getElementById('failedStudentsList');
    failedStudentsList.innerHTML = '';
    var succededStudentsList = document.getElementById('succededStudentsList');
    succededStudentsList.innerHTML = '';
    var studentListGpa = document.getElementById('studentListHome');
    studentListGpa.innerHTML = '';
}

//For student gpa in the extra section of the function that adds courses to the drop-down menu
function populateLectureDropdownHomeStudents() {
    var courseSelect = document.getElementById('selectStudentHome');
    courseSelect.innerHTML = '';
    var option = document.createElement('option');
    option.value = "---";
    option.text = "---";
    courseSelect.appendChild(option);
    //Add all courses to dropdown menu with loop
    //Create a cluster to avoid adding students with the same id again
    var idSet = new Set();
    students.forEach(function (student) {
        if (!idSet.has(student.id)) {
            var option = document.createElement('option');
            option.value = student.id;
            option.text = student.name;
            courseSelect.appendChild(option);
            //Add the student's ID to the cluster and prevent it from being added agai
            idSet.add(student.id);
        }
    });
}

function getStudentsListForHome() {
    var studentID = document.getElementById('selectStudentHome').value;
    var succededStudentsList = document.getElementById('studentListHome');
    var student = students.find(student => student.id === studentID);
    studentID === "---" ? succededStudentsList.innerHTML = '' : displayStudentsGpa(student.id);
}

// Function showing students' GPAs
function displayStudentsGpa(studentID) {
    var studentListGpa = document.getElementById('studentListHome');
    var student = students.find(student => student.id === studentID);
    var gpa = 0.0;
    var credit = 0;
    var total = 0;

    students.forEach(function (s) {
        if (s.id === studentID) {
            var lecture = lectures.find(lecture => lecture.code === s.lectures);
            credit = parseInt(lecture.credit) + credit;
            console.log(credit);
            total += convertLetterToGpa(s.letterGrade) * lecture.credit;
        }
    })

    gpa = total / credit;
    studentListGpa.innerHTML = '';

    var listItem = document.createElement('div');
    listItem.innerHTML = `<p>${student.name} ${student.surname} - ${gpa.toFixed(2)}</p>`;
    studentListGpa.appendChild(listItem);
}



function getSuccededStudentsByCourse() {
    // Get the code of the selected course
    var selectedCourseCode = document.getElementById('courseSelectHome2').value;
    console.log(selectedCourseCode);

    var studentsFromLocalStorage = JSON.parse(localStorage.getItem('students')) || [];

    // Filter students taking the selected course
    var succededStudents = studentsFromLocalStorage.filter(student => {
        return student.lectures.includes(selectedCourseCode) && student.letterGrade !== 'F';
    });
    console.log(succededStudents.name);
    displaySuccededStudents(succededStudents);
}

function displaySuccededStudents(succededStudents) {
    var succededStudentsList = document.getElementById('succededStudentsList');
    succededStudentsList.innerHTML = '';
    succededStudents.forEach(student => {
        var listItem = document.createElement('div');
        listItem.innerHTML = `<p>${student.name} ${student.surname} - ${student.letterGrade}</p>`;
        succededStudentsList.appendChild(listItem);
    });
}

// Function that will run when the Update button is pressed
function updateStudent(studentId, lectures) {
    // Find student by student ID
    var studentToUpdate = students.find(student => student.id === studentId && student.lectures === lectures);
    if (!studentToUpdate) {
        alert('Öğrenci bulunamadı.');
        return;
    }
    // Create update form
    var updateForm = `
        <div class="updateStudentContainer">
           <div>
            <form>
                <h2>Update Student</h2>
                <label for="updateName">Name:</label>
                <input type="text" id="updateName" value="${studentToUpdate.name}" required>
                <label for="updateSurname">Surname:</label>
                <input type="text" id="updateSurname" value="${studentToUpdate.surname}" required>
                <label for="updateGrade1">Midterm:</label>
                <input type="number" id="updateGrade1" value="${studentToUpdate.grade1}" required>
                <label for="updateGrade2">Final:</label>
                <input type="number" id="updateGrade2" value="${studentToUpdate.grade2}" required>
                <button id="confirmButton" onclick="confirmUpdate('${studentId}','${lectures}')">Onayla</button>
                </form>
           </div> 
        </div>
    `;
    // Show form on page
    document.getElementById('contentArea').innerHTML = updateForm;
}

// Function to confirm the update process
function confirmUpdate(studentId, lectures) {
    var studentToUpdate = students.find(student => student.id === studentId && student.lectures === lectures);
    if (!studentToUpdate) {
        alert('Öğrenci bulunamadı.');
        return;
    }
    var updatedName = document.getElementById('updateName').value;
    var updatedSurname = document.getElementById('updateSurname').value;
    var updatedGrade1 = document.getElementById('updateGrade1').value;
    var updatedGrade2 = document.getElementById('updateGrade2').value;

    var totalGrade = calculateTotalGrade(updatedGrade1, updatedGrade2);
    var letterGrade = calculateLetterGrade(totalGrade);

    if (!isValidName(updatedName) || !isValidName(updatedSurname)) {
        alert('Geçerli bir ad veya soyad giriniz.');
        return;
    }

    if (!isValidGrade(updatedGrade1) || !isValidGrade(updatedGrade2)) {
        alert('Notlar için geçerli bir değer giriniz.');
        return;
    }

    studentToUpdate.name = updatedName;
    studentToUpdate.surname = updatedSurname;
    studentToUpdate.grade1 = updatedGrade1;
    studentToUpdate.grade2 = updatedGrade2;
    studentToUpdate.letterGrade = letterGrade;

    updateStudentsInLocalStorage();
    changeContent("Students");
    updateStudentList2();
    console.log("denme");
}

// Auxiliary function
function isValidName(name) {
    return /^[a-zA-ZğüşıöçĞÜŞİÖÇ]+$/.test(name);
}
// Auxiliary function
function isValidGrade(grade) {
    return !isNaN(grade) && grade >= 0 && grade <= 100;
}

//Function that converts letter grade to GPA
function convertLetterToGpa(letter) {
    if (letter === 'A') {
        return 4;
    }
    else if (letter === 'B') {
        return 3;
    }
    else if (letter === 'C') {
        return 2;
    }
    else if (letter === 'D') {
        return 1;
    }
    else if (letter === 'F') {
        return 0;
    }
}


// Function that will run when the Update button is pressed
function updateLecture(lectureCode) {
    // Find student by lecture code
    var lectureToUpdate = lectures.find(lecture => lecture.code === lectureCode);
    if (!lectureToUpdate) {
        alert('Ders bulunamadı.');
        return;
    }
    // Create update form
    var updateForm = `
        <div class="updateLectureContainer">
            <div>
                <form>
                    <h2>Update Student</h2>
                    <label for="updateLectureName">Lecture Name:</label>
                    <input type="text" id="updateLectureName" value="${lectureToUpdate.name}" required>
                    <label for="updateLectureCredit">Lecture Credit:</label>
                    <input type="text" id="updateLectureCredit" value="${lectureToUpdate.credit}" required>
                    <button id="confirmButton" onclick="confirmUpdateForLecture('${lectureCode}')">Onayla</button>
                </form>
            </div>
        </div>
    `;
    document.getElementById('contentArea').innerHTML = updateForm;
}

// Function to confirm the update process
function confirmUpdateForLecture(lectureCode) {
    var lectureToUpdate = lectures.find(lecture => lecture.code === lectureCode);
    if (!lectureToUpdate) {
        alert('Ders bulunamadı.');
        return;
    }
    var updatedLectureName = document.getElementById('updateLectureName').value;
    var updatedLectureCredit = document.getElementById('updateLectureCredit').value;
    // Basic validation
    if (!updatedLectureName || !updatedLectureCredit) {
        alert('Please fill in all fields.');
        return;
    }
    // Validate numeric input for lectureCredit
    if (isNaN(updatedLectureCredit) || parseInt(updatedLectureCredit) <= 0) {
        alert('Please enter a valid positive numeric value for Lecture Credit.');
        return;
    }
    if (parseInt(updatedLectureCredit) > 8) {
        alert('Lecture credit cannot exceed 8.');
        return;
    }

    lectureToUpdate.name = updatedLectureName;
    lectureToUpdate.credit = updatedLectureCredit;

    updateLecturesInLocalStorage();

    changeContent("Lectures");
    updateLectureList2();
}

//automatic student adding function
function addStudentAuto() {
    var studentsAuto = [
        {
            id: "200709010",
            name: "Ahmet",
            surname: "Yılmaz",
            grade1: 40,
            grade2: 45,
            lectures: "CENG1007",
            letterGrade: "F"
        },
        {
            id: "200709011",
            name: "Ayşe",
            surname: "Kaya",
            grade1: 75,
            grade2: 88,
            lectures: "MATH2001",
            letterGrade: "B"
        },
        {
            id: "200709012",
            name: "Mustafa",
            surname: "Demir",
            grade1: 92,
            grade2: 87,
            lectures: "PHYS1003",
            letterGrade: "B"
        },
        {
            id: "200709013",
            name: "Emily",
            surname: "Williams",
            grade1: 80,
            grade2: 95,
            lectures: "CHEM1002",
            letterGrade: "B"
        },
        {
            id: "200709014",
            name: "David",
            surname: "Brown",
            grade1: 50,
            grade2: 20,
            lectures: "ENGL1010",
            letterGrade: "F"
        },
        {
            id: "200709015",
            name: "Sophia",
            surname: "Miller",
            grade1: 95,
            grade2: 92,
            lectures: "HIST1201",
            letterGrade: "A"
        },
        {
            id: "200709016",
            name: "Daniel",
            surname: "Wilson",
            grade1: 88,
            grade2: 85,
            lectures: "PSYC1101",
            letterGrade: "B"
        },
        {
            id: "200709017",
            name: "Olivia",
            surname: "Moore",
            grade1: 60,
            grade2: 65,
            lectures: "ARTS1303",
            letterGrade: "D"
        },
        {
            id: "200709018",
            name: "Christopher",
            surname: "Taylor",
            grade1: 92,
            grade2: 90,
            lectures: "BIOL2101",
            letterGrade: "A"
        },
        {
            id: "200709019",
            name: "Emma",
            surname: "Anderson",
            grade1: 85,
            grade2: 88,
            lectures: "ECON2202",
            letterGrade: "B"
        },
        {
            id: "200709020",
            name: "Mehmet",
            surname: "Koç",
            grade1: 85,
            grade2: 70,
            lectures: "MUSC1404",
            letterGrade: "C"
        },
        {
            id: "200709021",
            name: "Zeynep",
            surname: "Arslan",
            grade1: 85,
            grade2: 88,
            lectures: "SOCY2305",
            letterGrade: "B"
        },
        {
            id: "200709022",
            name: "Emre",
            surname: "Şahin",
            grade1: 10,
            grade2: 50,
            lectures: "SOCY2305",
            letterGrade: "F"
        },
        {
            id: "200709023",
            name: "Ece",
            surname: "Koç",
            grade1: 80,
            grade2: 92,
            lectures: "MUSC1404",
            letterGrade: "B"
        },
        {
            id: "200709024",
            name: "Oğuz",
            surname: "Yıldırım",
            grade1: 88,
            grade2: 85,
            lectures: "ECON2202",
            letterGrade: "B"
        },
        {
            id: "200709025",
            name: "Büşra",
            surname: "Güler",
            grade1: 50,
            grade2: 32,
            lectures: "BIOL2101",
            letterGrade: "F"
        },
        {
            id: "200709025",
            name: "Can",
            surname: "Tuncel",
            grade1: 95,
            grade2: 88,
            lectures: "ARTS1303",
            letterGrade: "A"
        },
        {
            id: "200709026",
            name: "Zehra",
            surname: "Yılmaz",
            grade1: 90,
            grade2: 100,
            lectures: "PSYC1101",
            letterGrade: "A"
        },
        {
            id: "200709027",
            name: "Kerem",
            surname: "Kurtuluş",
            grade1: 61,
            grade2: 22,
            lectures: "CENG1007",
            letterGrade: "F"
        },
        {
            id: "200709028",
            name: "İrem",
            surname: "Aydos",
            grade1: 58,
            grade2: 25,
            lectures: "HIST1201",
            letterGrade: "F"
        },
        {
            id: "200709029",
            name: "Serkan",
            surname: "Kurt",
            grade1: 96,
            grade2: 94,
            lectures: "ENGL1010",
            letterGrade: "A"
        },
        {
            id: "200709030",
            name: "Eylül",
            surname: "Şahbaz",
            grade1: 92,
            grade2: 50,
            lectures: "CHEM1002",
            letterGrade: "D"
        },
        {
            id: "200709031",
            name: "Mert",
            surname: "Acar",
            grade1: 50,
            grade2: 70,
            lectures: "PHYS1003",
            letterGrade: "D"
        },
        {
            id: "200709032",
            name: "Nazlı",
            surname: "Özdemir",
            grade1: 94,
            grade2: 99,
            lectures: "MATH2001",
            letterGrade: "A"
        },
    ];

    if (students.length === 0) {
        // part off adding course
        // Döngü ile her bir ders için Course nesnesi oluşturup diziye ekleme
        for (var i = 0; i < studentsAuto.length; i++) {
            var student = studentsAuto[i];
            var newStudent = new Student(student.id, student.name, student.surname, student.grade1, student.grade2, student.lectures, student.letterGrade);
            // Add student to list
            students.push(newStudent);
            // Add student to local storage
            addStudentToLocalStorage(newStudent);
        }
    }
    else {
        return;
    }
}
//automatic course adding function
function addLectureAuto() {
    var coursesAuto = [
        {
            code: "CENG1007",
            credit: "6",
            name: "Intro to Computer Science"
        },
        {
            code: "MATH2001",
            credit: "5",
            name: "Calculus I"
        },
        {
            code: "PHYS1003",
            credit: "4",
            name: "Physics for Scientists and Engineers"
        },
        {
            code: "CHEM1002",
            credit: "3",
            name: "Chemistry Fundamentals"
        },
        {
            code: "ENGL1010",
            credit: "4",
            name: "English Composition"
        },
        {
            code: "HIST1201",
            credit: "3",
            name: "World History"
        },
        {
            code: "PSYC1101",
            credit: "3",
            name: "Introduction to Psychology"
        },
        {
            code: "ARTS1303",
            credit: "2",
            name: "Introduction to Fine Arts"
        },
        {
            code: "BIOL2101",
            credit: "4",
            name: "Biology: Principles and Exploration"
        },
        {
            code: "ECON2202",
            credit: "5",
            name: "Microeconomics"
        },
        {
            code: "MUSC1404",
            credit: "2",
            name: "Music Appreciation"
        },
        {
            code: "SOCY2305",
            credit: "3",
            name: "Introduction to Sociology"
        }
        // Toplamda 12 ders eklenecek
    ];

    if (lectures.length === 0) {
        // part off adding course
        console.log("qqq");
        // Döngü ile her bir ders için Course nesnesi oluşturup diziye ekleme
        for (var i = 0; i < coursesAuto.length; i++) {
            var course = coursesAuto[i];
            console.log(course);
            var newLecture = new Lecture(course.code, course.name, course.credit);
            lectures.push(newLecture);
            //Add the course to local repository
            addLectureToLocalStorage(newLecture);
        }
    }
    else {
        return;
    }
}


