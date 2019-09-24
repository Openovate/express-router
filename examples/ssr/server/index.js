import http from 'http';
import { express, webpack } from './shims'
import router from './router';

const app = express();

//open up public directory
app.use(express.static('public'));

//bind router to express
app.use(router);

//bind webpack to express
webpack(app);

//start http server
const server = http.createServer(app);
server.listen(3000);
