import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState, store } from "../store/store";
import { AxiosResponse } from "axios";
import Class from "../models/Class";
import { getClasses, getStudent } from "../apis/airtable";
import Student from "../models/Student";

//Defined a filler interface to implement optional args to utilize getState in createAsyncThunk without passing in argument
interface UserFillers { }

//Defined initial state interface
interface Classroom {
    classIds: string[];
    studentIds: string[][];
    classes: Class[];
    students: Student[][];
    isLoggedIn: boolean;
    studentClassStatus: Status;
    classesStatus: Status;
    studentsStatus: Status
}

//Defined an interface for the response type of a the classes Payload Action
interface StudentIDAndClassResponse {
    studentIds: string[][];
    classes: Class[];
}

//Defined type for statuses
type Status = "STALE" | "LOADING" | "SUCCEEDED" | "FAILED";

//Inferred the types of initialState as per Classroom interface
const initialState: Classroom = {
    classIds: [] as string[],
    studentIds: [] as string[][],
    classes: [] as Class[],
    students: [] as Student[][],
    isLoggedIn: false,
    studentClassStatus: "STALE",
    classesStatus: "STALE",
    studentsStatus: "STALE"
}

//Looping to get multiple API gets
const loopThroughArrayAPICalls = (classPeople: string[]) => {
    let requests = [];
    for (let i = 0; i < classPeople.length; i++) {
        requests.push(getClasses(classPeople[i]))
    }

    return requests;
};

//Combining Data with Promise.all
const fetchMultiData = async (requests: Promise<AxiosResponse<any, any>>[]) => {
    const res = await Promise.all(requests.map(async (item) => {
        return (await item).data
    }));

    return res;
}

//Action to fetch classes of student searched
export const fetchStudentClasses = createAsyncThunk('classroom/fetchStudentClasses', async (person: string) => {
    //Implemented conditional for case sensitivity
    const lowerCased = person.toLowerCase();

    const checkForSpace = function (string: string) {
        return string.indexOf(' ') === -1;
    };
    const check = function (string: string) {
        return string.indexOf(' ');
    }

    if (!checkForSpace(lowerCased)) {
        const indexOfSpace = check(lowerCased);
        const caseProofName = lowerCased.charAt(0).toUpperCase() + lowerCased.slice(1, indexOfSpace + 1) + lowerCased.charAt(indexOfSpace + 1).toUpperCase() + lowerCased.slice(indexOfSpace + 2);
        const response = await getStudent(caseProofName);
        const classes = await response.data.records[0].fields.Classes;
        return classes;
    } else {
        const caseProofName = lowerCased.charAt(0).toUpperCase() + lowerCased.slice(1);
        const response = await getStudent(caseProofName);
        const classes = await response.data.records[0].fields.Classes;
        return classes;
    }
});

//Action to fetch every class' info from classIds received by studentClasses action
export const fetchClasses = createAsyncThunk<any, object, { state: RootState }>('classroom/fetchClasses', async (fillers: UserFillers = {}, { getState }) => {
    const { classIds } = getState().classroom;
    const classes = await fetchMultiData(loopThroughArrayAPICalls(classIds))
    const studentIds = classes.map((clas: Class) => {
        return clas.fields.Students;
    })
    return { studentIds, classes };
})

//Action to fetch every students' info from studentIds received by classes action
export const fetchStudents = createAsyncThunk<any, object, { state: RootState }>('classroom/fetchStudents', async (fillers: UserFillers = {}, { getState }) => {
    const { studentIds } = getState().classroom;
    let allStudents: Student[][] = []

    for (let i = 0; i < studentIds.length; i++) {
        const students: Student[] = await fetchMultiData(loopThroughArrayAPICalls(studentIds[i]))
        allStudents.push(students)
    }

    return allStudents;
})

//Action called that dispatches all other actions to mask sequential process from user
export const logIn = createAsyncThunk('classroom/logIn', async (stud: string) => {
    await store.dispatch(fetchStudentClasses(stud));
    await store.dispatch(fetchClasses({}));
    await store.dispatch(fetchStudents({}));
    return true;
})



const classroomSlice = createSlice({
    name: 'classroom',
    initialState,
    reducers: {
        //LogOut action that resets entire state data
        logOut(state) {
            state.isLoggedIn = false;
            state.studentClassStatus = "STALE";
            state.studentsStatus = "STALE";
            state.classesStatus = "STALE";
            state.classIds = [];
            state.students = [];
            state.studentIds = [];
            state.classes = [];
        }
    },
    //Extra reducers utilized to update createAsyncThunk actions through process implemented alongside PayloadAction defined types 
    extraReducers(builder) {
        builder.addCase(fetchStudentClasses.pending, (state) => {
            state.studentClassStatus = "LOADING";
        });
        builder.addCase(fetchStudentClasses.fulfilled, (state, action: PayloadAction<string[]>) => {
            return { ...state, classIds: action.payload, studentClassStatus: "SUCCEEDED" };
        })
        builder.addCase(fetchStudentClasses.rejected, (state) => {
            state.studentClassStatus = "FAILED";
        })
        builder.addCase(fetchClasses.pending, (state) => {
            state.studentsStatus = "LOADING";
        });
        builder.addCase(fetchClasses.fulfilled, (state, { payload }: PayloadAction<StudentIDAndClassResponse>) => {
            return { ...state, studentIds: payload.studentIds, classes: payload.classes, studentsStatus: "SUCCEEDED" };
        });
        builder.addCase(fetchClasses.rejected, (state) => {
            state.studentsStatus = "FAILED";
        })
        builder.addCase(fetchStudents.pending, (state) => {
            state.classesStatus = "LOADING";
        });
        builder.addCase(fetchStudents.fulfilled, (state, action: PayloadAction<Student[][]>) => {
            return { ...state, students: action.payload, classesStatus: "SUCCEEDED" };
        });
        builder.addCase(fetchStudents.rejected, (state) => {
            state.classesStatus = "FAILED";
        });
        builder.addCase(logIn.fulfilled, (state, action: PayloadAction<boolean>) => {
            return { ...state, isLoggedIn: action.payload }
        })
        builder.addCase(logIn.rejected, (state) => {
            state.isLoggedIn = false;
        })
    },
});

export const { logOut } = classroomSlice.actions;

export default classroomSlice.reducer;
