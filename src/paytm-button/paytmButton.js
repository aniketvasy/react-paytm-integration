import React, { useEffect, useState } from "react"
// const PaytmChecksum = require('./paytmChecksum');
import PaytmChecksum from "./paytmChecksum";
// const https = require('https');
import https from 'https'
import Swal from "sweetalert2"

export function PaytmButton () {
  const [amount,setAmount] = useState(0)
  const [disableButton,setDisableButton] = useState(false)
  const [dataP,setDataP] = useState("")

    const [paymentData, setPaymentData] = useState({
        token: "", 
        order: "", 
        mid: "",
        amount: ""
    });
    const [loading, setLoading] = useState(false);

    // useEffect(() => {
    //     initialize();
    // }, []);
    function inputHandler(e){
      console.log("handler");
      setAmount(e.target.value)
      console.log("amount=>",amount)
    }
   


    const initialize = () => {
      return new Promise(function(resolve,reject){
        setDisableButton(true)
        let orderId = 'PYTM_ORDR_'+new Date().getTime();
        // let orderId = `PYTM_ORDR_1670914911410`;

        // Sandbox Credentials
        let mid = "AqSipo92499010904391"; // Merchant ID
        let mkey = "nCVjURN@UrBq9mnX"; // Merhcant Key
        var paytmParams = {};

        paytmParams.body = {
          "requestType"  : "Payment",
          "mid"      : `${mid}`,
          "websiteName"  : "DEFAULT",
          "orderId"    : `${orderId}`,
          "callbackUrl"  : `https://${window.location.hostname}`,
          "txnAmount"   : {
            "value"   : `${amount}`,
            "currency" : "INR",
          },
          "userInfo"   : {
            "custId"  : '1001',
          },
          // "enablePaymentMode":[{"mode" : "UPI", "channels" : ["UPIPUSH"]}]
          "disablePaymentMode":[{"mode" : "UPI", "channels" : ["UPIPUSH"]}]
         
        };

        PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), mkey).then(function(checksum){
            console.log("checksum",checksum);
          paytmParams.head = {
            "signature" : `${checksum}`
          };

          var post_data = JSON.stringify(paytmParams);


          console.log("paytmParams.body",paytmParams.body)

          var options = {
            /* for Staging */
            hostname: 'securegw-stage.paytm.in',

            /* for Production */
                // hostname: 'securegw.paytm.in',

            port: 443,
            path: `/theia/api/v1/initiateTransaction?mid=${mid}&orderId=${orderId}`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': `${post_data.length}`
            }
          };
          console.log("post_data.length",post_data.length)
          var response = "";
          var post_req = https.request(options, function(post_res) {
            console.log("post_res",post_res)
            post_res.on('data', function (chunk) {
              response += chunk;
              console.log("******res====>",response)
              
            });
                post_res.on('end', function(){


              // console.log('Response: ', response);
              // console.log('post data: ', post_data);

                    // res.json({data: JSON.parse(response), orderId: orderId, mid: mid, amount: amount});
                 
                    console.log("befor-data-set")
                    setPaymentData({
                        ...paymentData,
                        token: JSON.parse(response).body.txnToken,
                        order: orderId,
                        mid: mid,
                        amount: {amount}
                    })
                    console.log("after-data-set",paymentData)
                    
                   
            });
          });

          post_req.write(post_data);
          post_req.end();
          
        });
        resolve("done")
      }
      )
    }
// useEffect(()=>{
//   makePayment()
// },[paymentData.token])

useEffect(() => {
  console.log("=============================================")
  if(paymentData.token){
    console.log("-----------------------------api Callled--------------------------------------")
    makePayment()
  }

}, [paymentData.token])


    const makePayment = () => {
      console.log(paymentData.txnToken)
        setLoading(true);
        var config = {
            "root":"",
            "style": {
              "bodyBackgroundColor": "#fafafb",
              "bodyColor": "",
              "themeBackgroundColor": "#0FB8C9",
              "themeColor": "#ffffff",
              "headerBackgroundColor": "#284055",
              "headerColor": "#ffffff",
              "errorColor": "",
              "successColor": "",
              "card": {
                "padding": "",
                "backgroundColor": ""
              }
            },
            "data": {
              "orderId": paymentData.order,
              "token": paymentData.token,
              "tokenType": "TXN_TOKEN",
              "amount": paymentData.amount /* update amount */
            },
            "payMode": {
              "labels": {},
              "filter": {
                "order": ['UPI','CARD']
              },
              "order": [
                  // "CC",
                  // "DC",
                  // "NB",
                  "UPI",
                  // "PPBL",
                  // "PPI",
                  // "BALANCE"
              ]
            },
            "website": "WEBSTAGING",
            "flow": "DEFAULT",
            "merchant": {
              "mid": paymentData.mid,
              "redirect": false
            },
            "handler": {
              "transactionStatus":function transactionStatus(paymentStatus){
                console.log("paymentStatus => ",paymentStatus);
                setLoading(false);
                if(paymentStatus.STATUS =="TXN_SUCCESS"){
                  window.Paytm.CheckoutJS.close();
                  Swal.fire(
                    'Order Placed',
                    'successfully',
                    'success'
                  )
                }
                else{
                  window.Paytm.CheckoutJS.close();
                  Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong!',
                  })
                }
               
              },
              "notifyMerchant":function notifyMerchant(eventName,data){
                console.log("Closed");
                console.log("))))))))> Merchent ", data)
                setLoading(false);
              }
            }
        };
      
        if (window.Paytm && window.Paytm.CheckoutJS) {
        // initialze configuration using init method
        window.Paytm.CheckoutJS.init(config).then(function onSuccess() {
            console.log('Before JS Checkout invoke');
            // after successfully update configuration invoke checkoutjs
            window.Paytm.CheckoutJS.invoke();
            console.log("====>",window.Paytm.CheckoutJS)
            
        }).catch(function onError(error) {
            console.log("config====>",config)
            console.log("Error => ", error);
        });
        }
        setDisableButton(false)
    }
//     async function  call(){
  
//      initialize()
//      console.log(paymentData.token)
//      console.log(paymentData)
//     //  if(paymentData.token){
//     //   makePayment()
//     //  }
 
// }
// if(paymentData.token){
//   makePayment()
//  }

    return (
      <div className="mainDiv">
      <div className="EnterAmount">
        <h1>Enter Amount</h1>
        <input className="enter-amount-inpt" onChange={inputHandler}/>
      </div>
        <div className="payButton">
            {
                loading ? (
                    <img src="https://c.tenor.com/I6kN-6X7nhAAAAAj/loading-buffering.gif" />
                ) : (
                    <button onClick={initialize} disabled={disableButton&& amount>0}>Pay Now</button>
                )
            }
        </div>

        {}
        </div>
    )
    
}