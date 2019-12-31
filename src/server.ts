import { AppService, Command, CommandType } from "./models";
import AppConfig from "./config";
import redis from 'redis'
import { ProgramExecutor } from "./programExecutor";

export default class AppServer implements AppService
{
    constructor(private appConfig: AppConfig, private programExecutor: ProgramExecutor)
    {
    }
    start(): void {
        const subscriber = redis.createClient({
            url: this.appConfig.redis.url
        });
        const publisher = redis.createClient({
            url: this.appConfig.redis.url
        });
        subscriber.on("message", (channel, messsage) => {
            console.log("Received from redis", channel, messsage);
            const command = JSON.parse(messsage) as Command;
            if(command.type == CommandType.UploadProgram)
            {
                //Reload the currently stored program
                console.log("Reloading current program");
                this.programExecutor.load(command.data.nodes);
                publisher.publish("receive-results", "Program ready");
            }
            else if(command.type == CommandType.InputValue)
            {
                console.log("Inputting value into the current program");
            }
        });
        subscriber.subscribe(["upload-program", "input-value"]);
        console.log("The app is ready to accept programs");
    }
}