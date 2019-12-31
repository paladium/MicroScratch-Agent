import AppConfig from './config'
import * as YAML from 'yaml'
import { readFileSync } from 'fs';
import AppServer from './server';
import { ProgramExecutor } from './programExecutor';
class App {
    private appConfig: AppConfig;
    private appServer: AppServer;
    private programExecutor: ProgramExecutor;
    constructor() {
        this.appConfig = YAML.parse(readFileSync(".env.yml").toString());
        this.programExecutor = new ProgramExecutor();
        this.appServer = new AppServer(this.appConfig, this.programExecutor);
    }

    start() {
        this.appServer.start();
    }
}

new App().start();