const { Router } = require('express');
const router = Router();
const paypal = require('paypal-rest-sdk');


// paypal.configure({
//     mode: "sandbox", //sandbox or live
//     client_id: "AWkpufQo6xbFIakyYWVpmw19qe7bCDl2PnRCMrX0NZj9BA0iOZVVboq8u7uctngUuU6106WBVdJuy_Cb",
//     client_secret: "ENT3irQPF24_1g7o7TVHW-ejakl7cnTjXGV9mRi89f_GN4vwIoFm9ho5XsXMTGcY5bylekElbeXYZkGN"
// });

router.get('/main', (req, res) => {
    res.render('index');
    //res.redirect("/paypal");
});

// route main to access Paypal
router.get('/:clientid/:clientsecret/:mode', (req, res) => {
    const { clientid, clientsecret, mode } = req.params;

    if(req.params.clientid){
        paypal.configure({
            mode: mode, //sandbox or live
            client_id: clientid,
            client_secret: clientsecret
        });
    
        res.render('index');
        //res.redirect("/paypal");
    } else {
        res.redirect("/failed");
    }
});

// var itemsNew = [[

//     {
//         currency: "MXN",
//         name: "Zapatos de portero puma one grip",
//         price: 900,
//         quantity: "1",
//         sku: "2"
//     }
// ]];
// var subtotal = 900;
// var priceshipp = 0;
// var currency = "MXN";
// // var url = "http://192.168.0.16:3000";
// var url = "https://f1a76a5420fd.ngrok.io";
// var description = "Pago de articulos";
// var orderId = 30002;

var itemsNew = [];
var subtotal = 0;
var priceshipp = 0;
var currency = "";
var url = "";
var description = "";
var orderId = 0;
var orderKey = "";

// route to send data the server
router.post('/', (req, res) => {
    console.log(req.body);

    // volvemos a inicializar los valores
    itemsNew = [];
    subtotal = 0;
    priceshipp = 0;
    currency = "";
    url = "";
    description = "";
    orderId = 0;
    orderKey = "";

    if(req.body.products){

        itemsNew.push(req.body.products);
        subtotal = req.body.priceTotal;
        priceshipp  = req.body.priceShipping;
        currency = req.body.currency;
        url = req.body.url;
        description = req.body.description;
        orderId = req.body.orderId;
        orderKey = req.body.orderKey;
        res.status(200).json({
            message: 'Successfull'
        });

    }else{

        res.redirect("/failed");

    } 
});

router.get('/paypal', async (req, res) => {

    console.log(itemsNew);

    var create_payment_json = {
        intent: "sale",
        payer: {
            payment_method: "paypal",
        },
        redirect_urls: {
            return_url: url + "/success",
            cancel_url: url + "/cancel"
        },
        transactions: [
            {
                item_list: {
                    items: itemsNew[0]
                    //items: itemsNew
                },
                amount: {
                    currency: currency,
                    total: ( subtotal + priceshipp ).toString(),
                    details: {
                        subtotal: subtotal.toString(),
                        shipping: priceshipp.toString(),
                    },
                },
                description: description,
                custom: "{'order_id'="+ orderId.toString() + ",'order_number'=" + orderId.toString() + ",'order_key'="+ orderKey +"}",
                note_to_payee: "{'order_id'="+ orderId.toString() + ",'order_number'=" + orderId.toString() + ",'order_key'="+ orderKey +"}",
                invoice_number: "GS-" + orderId.toString()
            }
        ]
    };

    paypal.payment.create(create_payment_json, (error, payment) => {
        if (error) {
            console.log(error.response);
            // throw error;
            res.redirect("/failed");
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            res.redirect(payment.links[1].href);
        }
    });

});

var paymentRes = [];
router.get("/success", (req, res) => {
    console.log(req.body);
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;
    var execute_payment_json = {
        payer_id: PayerID,
        transactions: [
            {
                amount: {
                    currency: currency,
                    total: ( subtotal + priceshipp ).toString()
                },
            }
        ]
    };

    paymentRes = [];

    paypal.payment.execute(paymentId, execute_payment_json, function(
        error,
        payment
    ) {
        if (error) {
            console.log(error.response);
            // throw error;
            res.redirect("/failed");
        } else {
            if(payment.state == 'approved'){
                paymentRes.push(payment);
                // console.log("pago completado correctamente");
                console.log("Execute Payment Response");
                console.log(paymentRes);
                res.render("success", { payment: paymentRes });
            }else{
                res.send('pago no completado correctamente');
                res.render("unapproved");
            }
        }
    });
});

router.get('/getData',(req, res) => {
    console.log(paymentRes);
    res.json(paymentRes);
});

router.get("/cancel", (req, res) => {
    res.render("cancel");
});

router.get("/unapproved", (req, res) => {
    res.render("unapproved");
});

router.get("/failed", (req, res) => {
    res.render("failed");
});

module.exports = router;