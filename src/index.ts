import AppConfig from './config'
import * as YAML from 'yaml'
import { readFileSync } from 'fs';
import AppServer from './server';
class App {
    private appConfig: AppConfig;
    private appServer: AppServer;
    constructor() {
        this.appConfig = YAML.parse(readFileSync(".env.yml").toString());
        this.appServer = new AppServer(this.appConfig);
    }

    start() {
        this.appServer.start();
    }
}

new App().start();