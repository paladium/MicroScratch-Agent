import { AppService, Command, CommandType } from "./models";
import AppConfig from "./config";
import redis from 'redis'

export default class AppServer implements AppService
{
    constructor(private appConfig: AppConfig)
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