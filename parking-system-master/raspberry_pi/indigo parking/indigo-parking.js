//indigo parking data transfer
var webSocketUrl = "wss://api.artik.cloud/v1.1/websocket?ack=true";
var device_id = "68ee661bab06409db6e963b2dd4f5e4d"; // Indigo parking DEVICE ID
var device_token = "0cbc5d03d2e94fca8bf33fe71cf8e8b3"; //Indigo parking DEVICE TOKEN
// import websocket module
var WebSocket = require('ws');
var isWebSocketReady = false;
var data="";
var ws = null;
// import serialport module
//var serialport = require("serialport");
//var SerialPort = serialport.SerialPort;
//var sp = new SerialPort("/dev/ttyACM0", { //for serial communication with arduino 
//   baudrate: 9600,  
// we are using UNO so baudrate is 9600, you might need to change according to your model
//   parser: serialport.parsers.readline("\n")
//});

const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort("/dev/ttyACM0",{
	baudRate: 9600,
	parser: new Readline("\n")
});
//const parser = new Readline("\n");

var parking_state=0;// variable to check for parking state_gate
// this is for demo purpose only


/**
 * Gets the current time in millis
 */
function getTimeMillis(){
    return parseInt(Date.now().toString());
}

/**
 * Create a /websocket connection and setup GPIO pin
 */
function start() {
    //Create the WebSocket connection
    isWebSocketReady = false;
    ws = new WebSocket(webSocketUrl);
    ws.on('open', function() {
        console.log("WebSocket connection is open ....");
    // after creating connection you have to register with your Authorization information
        register();
    });
    ws.on('message', function(data) {
		//console.log("Received :"+data);
      //this loop is called whenever the client sends some message
         handleRcvMsg(data); //data is received to the function handleRcvMsg()
    });
    ws.on('close', function() {
        console.log("WebSocket connection is closed ....");

    });      
}

/**
 * Sends a register message to /websocket endpoint
 */
//Client will only work when device gets registered from here
function register(){
    console.log("Registering device on the WebSocket connection");
    try{
        var registerMessage = '{"type":"register", "sdid":"'+device_id+'", "Authorization":"bearer '+device_token+'", "cid":"'+getTimeMillis()+'"}';
        console.log('Sending register message ' + registerMessage + '\n');
        ws.send(registerMessage, {mask: true});
        isWebSocketReady = true;
    }
    catch (e) {
        console.error('Failed to register messages. Error in registering message: ' + e.toString());
    }    
}


//data after receiving is sent here for processing
function handleRcvMsg(msg){
	//console.log(msg);
    var msgObj =JSON.parse(msg);
	
	//console.log(msgObj);
    if (msgObj.type != "action") return; //Early return;

    var actions = msgObj.data.actions;
	console.log(actions);
    var actionName = actions[0].name; //assume that there is only one action in actions
    console.log("The received action is " + actionName);
  
    //you must know your registered actions in order to perform accordinlgy
    // we will not receive any action in our case
    if (actionName.toLowerCase() == "parking_state") 
    { 
       // your code here 
    }
    else {
         //this loop executes if some unregistered action is received
         //so you must register every action in cloud
        console.log('Do nothing since receiving unrecognized action ' + actionName);
        return;
    }
   
}



/**
 * Send one message to ARTIK Cloud
 */
//This function is responsible for sending commands to cloud
function sendStateToArtikCloud(parking){
    try{
        ts = ', "ts": '+getTimeMillis();
		console.log("Data to clould: "+parking);
        var data = {
            "indigolot": parseInt(parking).toString()
//setting the parking value from argument to our cloud variable "parking"
//we will get the value from arduino
            };
			//console.log(parseInt(data.indigolot));
			//var str=JSON.stringify(data);
			//var p=JSON.parse(str);
			//console.log(p);
        var payload = '{"sdid":"'+device_id+'"'+ts+', "data": '+JSON.stringify(data)+', "cid":"'+getTimeMillis()+'"}';
        console.log('Sending payload ' + payload + '\n');
        ws.send(payload, {mask: true});
    } catch (e) {
        console.error('Error in sending a message: ' + e.toString() +'\n');
    }
}



function exitClosePins() {
    
        console.log('Exit and destroy all pins!');
        process.exit();
    
}


start();
//exectes every time when data is received from arduino (30sec programmed delay from arduino)
port.on("open", function () {
    port.on('data', function(data) {

            console.log("Serial port received data:" + data);
            //sendStateToArtikCloud(data);//parking data to artik cloud
            sendStateToArtikCloud(data);
           
    });
});


process.on('SIGINT', exitClosePins);
