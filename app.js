const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const moongoose = require('mongoose');
const authRoutes = require('./routes/Auth');
const mainRoutes = require('./routes/main');
const flash = require('connect-flash');
const session = require('express-session');
const cron = require('node-cron');
const mainController = require('./controller/Main');
const mongodbStore = require('connect-mongodb-session')(session);
const MONGODB_URI ='mongodb+srv://prasher6789:Mayank%401509@cluster0.dxwz3zy.mongodb.net/easyration';
const app = express();
const store = new mongodbStore({
    uri: MONGODB_URI,
    collection:'sessions',
})
app.set('view engine','ejs'); 

app.set('views','views');

app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname,'/public')));
app.use(session({secret:'easyration',resave:false,saveUninitialized:false,store:store}));
app.use(flash());
// app.use(flash()); 
app.use('/',authRoutes);
app.use('/app',mainRoutes);
cron.schedule('0 0 * * *',mainController.updateSlot);
cron.schedule('0 0 1 * *',mainController.updateUserMonth);
moongoose.connect(MONGODB_URI)
.then(
    result=>{
        app.listen(4001);
    }
)
.catch(err=>console.log(err));
