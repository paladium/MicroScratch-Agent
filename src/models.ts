export interface AppService {
    start(): void;
}
export enum CommandType
{
    UploadProgram = "uploadProgram",
    InputValue = "inputValue"
}
export interface Command
{
    type: CommandType;
    data: any;
}