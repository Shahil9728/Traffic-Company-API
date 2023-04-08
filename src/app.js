const express = require('express');
const app = express();
const axios = require('axios');
const path = require('path')
const hbs = require('hbs');
const port = process.env.PORT || 4000;
const bodyParser = require('body-parser');
const html = require('html');
const { error } = require('console');


const templatepath = path.join(__dirname, '../src/views')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.set('view engine', 'hbs');
app.set('views', templatepath);
app.use(express.static('public'));
app.use(express.static('assets'));

app.get('/', (req, res) => {
    res.render('index.hbs')
})

const tracker = "";
var login = false;

app.get('/traffic', async (req, res) => {
    const sub_id = '1a2b3c';
    const { accesstoken, ip, msisdn, pi, clickid } = req.query;

    if (accesstoken != null && ip != null && msisdn != null) {
        if (msisdn.length == 10) {
            try {
                const response = await axios.get(`https://pin.trafficcompany.com/api/v1/sendpin?access-token=${accesstoken}&ip=${ip}&msisdn=${msisdn}&pi=${pi}&click_id=${clickid}&sub_id=${sub_id}`)
                if (response.data.status == "ok") {
                    tracker = response.data.tracker;
                    return res.render('verifypin.hbs', { errorMessage: response.data.message });
                }
            } catch (error) {
                // res.render('verifypin.hbs', { errorMessage: "Pin Sent" ,color:"true"});
                return res.render('index.hbs', { errorMessage: error.response.data.message });
            }
        } else {
            return res.render("index.hbs", { errorMessage: "Mobile number is not Valid" })
        }
    }
    else {
        return res.render('index.hbs', { errorMessage: "Please fill all the required feild" });
    }

})

app.get('/verify', async (req, res) => {
    const { pin } = req.query;
    if(pin!=null)
    {
        if(pin.length==4 && tracker!=null)
        {
            try {
                const response = await axios.get(`https://pin.trafficcompany.com/api/v1/verify?tracker=${tracker}&pin=${pin}`)
                if (response.data.status == "ok") {
                    return res.render('account.hbs', { errorMessage: response.data.message,color:true });
                    login=true;
                }
            } catch (error) {
                // return res.render('account.hbs', { errorMessage: "You are logged In",color:true});
                return res.render('verifypin.hbs', { errorMessage: error.response.data.description });
            }
        }else
        {
            return res.render('verifypin.hbs',{errorMessage:"Invalid pin"});
        }
    }
    else
    {
        return res.redirect('/');
    }
})

app.get('/account', (req, res) => {
    if(login!=false)
    {
        return res.render('account.hbs');
    }else
    {
        return res.redirect('/');
    }
})

app.listen(port, (req, res) => {
    console.log("Server is running at 4000");
})