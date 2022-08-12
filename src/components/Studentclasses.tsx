import React from 'react'
import { useAppDispatch, useAppSelector } from '../hooks';
import Class from '../models/Class'
import Student from '../models/Student'
import { logOut } from '../reducers/classroomSlice';

//Interface used to define type of Props being passed to component
interface StudentInfo {
    students: Student[][];
    classes: Class[];
}

const Studentclasses = ({ students, classes }: StudentInfo) => {
    //Hides loading div
    document.querySelector('.loading')!.classList.remove('visible')

    const dispatch = useAppDispatch();

    //Receives status of student fetch
    const studentStatus = useAppSelector((state) => state.classroom.studentClassStatus)

    //Function to dispatch the logOut action and reset data
    const loggingOut = () => {
        dispatch(logOut());
    };

    //Mapping over all students to receive names and receiving an index in order to pick which array to map over
    const getStudentNames = (i: number) => {
        return students[i].map(stud => {
            return (
                <p key={stud.id}>
                    {stud.fields.Name}
                </p>
            )
        })
    }

    //Conditionally rendering a div dependent on status of student fetch
    //Maps over classes and provides getStudentNames with index to get correct class info
    const mappedClasses = () => {
        if (studentStatus === "FAILED") {
            return <div>Person Not Found</div>
        }
        return classes.map((clss: Class, i: number) => {
            return (
                <div key={clss.id} className='class-container'>
                    <h1>
                        Name
                    </h1>
                    <span> {clss.fields.Name} </span>

                    <h1>Students</h1>

                    <div id='studentList'>
                        {getStudentNames(i)}
                    </div>


                </div>
            )
        });
    }

    return (
        <div>
            {mappedClasses()}

            <button
                onClick={loggingOut}
                style={{
                    position: 'fixed',
                    top: '10px',
                    right: '10px',
                    cursor: 'pointer',
                }}
            >
                Logout
            </button>
        </div>
    )
}

export default Studentclasses