export default interface Student {
    createdTime: string;
    fields: {
        Name: string;
        Classes: string[]
    };
    id: string
}