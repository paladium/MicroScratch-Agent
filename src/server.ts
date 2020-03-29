import { AppService, Command, CommandType } from "./models";
import AppConfig from "./config";
import redis from 'redis'
import { ProgramExecutor, ProgramTreeType } from "./programExecutor";

export default class AppServer implements AppService {
    constructor(private appConfig: AppConfig, private programExecutor: ProgramExecutor) {
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
            if (command.type == CommandType.UploadProgram) {
                //Reload the currently stored program
                console.log("Reloading current program");
                this.programExecutor.load(command.data.nodes);
                publisher.publish("receive-results", "Program ready");
                this.executeNextStep(publisher);
            }
            else if (command.type == CommandType.InputValue) {
                console.log("Inputting value into the current program");
                this.programExecutor.input(command.data);
                this.executeNextStep(publisher);
            }
        });
        subscriber.subscribe(["upload-program", "receive-input"]);
        console.log("The app is ready to accept programs");
    }
    private executeNextStep(publisher: redis.RedisClient) {
        //Run the first step
        const action = this.programExecutor.next();
        if (action.type == ProgramTreeType.Input) {
            publisher.publish("receive-results", "Please enter the input");
            publisher.publish("request-input", action.data);
        }
        else if (action.type == ProgramTreeType.Output) {
            publisher.publish("receive-results", `The output is ${action.data}`);
        }
        else if(action.type == ProgramTreeType.Func)
        {
            publisher.publish("receive-results", "Calculating the result");
            //Get the output
            this.executeNextStep(publisher);
        }
    }
}