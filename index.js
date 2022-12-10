const express = require('express');
const cors = require('cors')
const https = require('https');
const http = require('http');
const fs = require('fs');
const keys = require('./services/keys')
const mongoose = require('mongoose')
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser")
const passport = require('passport');
// starting out express server and allow cors
const app = express();
app.use(bodyParser.json())
app.use(cors({
   origin: true,
   credentials: true,
}));
const port = 4000;
const stripe = require('stripe')(keys.stripe.secret);
app.use(cookieSession({
   maxAge: 24 * 60 * 60 * 1000,
   keys: [keys.encryptionKey],
}))
// Initialize passport
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect(keys.mongoConnectString, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
   console.log("connected to mongodb")
})
app.post("/api/pay", async (req, res) => {
   var price = req.body.price;
   price = parseInt(price) * 100;
   const paymentIntent = await stripe.paymentIntents.create({
      amount: price,
      currency: 'usd',
      // Verify your integration in this guide by including this parameter
      metadata: { integration_check: 'accept_a_payment' },
   });
   res.json({ "client_secret": paymentIntent['client_secret'], "server_time": Date.now() });
}
);
//
const passportSetup = require('./services/passport-setup');
// auth routes 
const initRoutes = require("./routes/init-routes");
const templatesRoutes = require("./routes/templates-routes");
const categoriesRoutes = require("./routes/categories-routes");
const authRoutes = require("./routes/auth-routes");
const imagesRoutes = require("./routes/images-routes")
const pagesRoutes = require("./routes/pages-routes")
const socialRoutes = require("./routes/social-routes")
const contactRoutes = require("./routes/contact-routes")
const subscriptionRoutes = require("./routes/subscription-routes");
app.use('/api/auth', authRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api', initRoutes);
app.use('/api', categoriesRoutes);
app.use('/api', templatesRoutes);
app.get('/api/images/shape/:shapeName', (req, res) => {
   res.sendFile(__dirname + '/images/shapes/' + req.params.shapeName);
});
app.post('/api/upload/image', (req, res, next) => {
})
app.get('/test', (req, res, next) => {
   res.send("test done")
})
const httpsServer = http.createServer(app);
// const httpsServer = http.createServer( {}, app);
httpsServer.listen(port, () => {
   // Check if file exist 
   console.log("App running on port "+port);
})
