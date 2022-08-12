import React, { useRef } from 'react'
import { useAppDispatch } from '../hooks'
import { logIn } from '../reducers/classroomSlice';
import { useAppSelector } from '../hooks';
import Studentclasses from './Studentclasses';
import '../styles/App.css'

const App = () => {
    const dispatch = useAppDispatch();

    //Ref in charge of receiving user input
    const studentRef = useRef<HTMLInputElement>(null);

    //Submit function in charge of presenting loading div and dispatching logIn action in order to fetch all Data
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        document.querySelector('.loading')!.classList.add('visible');
        document.querySelector('#classForm')!.classList.add('hide');
        const name = studentRef.current!.value;
        await dispatch(logIn(name));
    }

    //Utilized useAppSelector to receive state data so as to pass to StudentClasses component and grab isSignedIn state
    const students = useAppSelector((state) => state.classroom.students);
    const classes = useAppSelector((state) => state.classroom.classes);
    const isSignedIn = useAppSelector((state) => state.classroom.isLoggedIn);

    //Ternary operator to present JSX depending on isSignedIn boolean
    return (
        <div id='app'>
            {!isSignedIn
                ?
                <form onSubmit={handleSubmit} id='classForm'>
                    <label> Student Name: </label>
                    <input type="text" placeholder='Enter Name' ref={studentRef} required />
                    <button type='submit'>Login</button>
                </form>
                :
                <Studentclasses students={students} classes={classes} />
            }
            <div className='loading'>Loading...</div>
        </div>
    )
}

export default App