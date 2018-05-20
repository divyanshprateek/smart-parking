int irSensor1=0;
int irSensor2=0;
int irSensor = 0; // total sensor value
int total_car = 0;
int freeSlot = 0;
const int totalSlot = 2;

void setup() {
  Serial.begin(9600);
}

void loop() {
  // ir sensor value read as analog, maximum value can be 1024
  // value depends on the distance of obstacle
  irSensor1 = digitalRead(30);
  irSensor2 = digitalRead(31);
    // all four sensors values are added here to take decision easily 
  irSensor = irSensor1 + irSensor2;
  // these value may vary for your case
  // uncomment following line to check the value in terminal
  //Serial.println("total value = " +irSensor);
  if(irSensor==1)
      total_car = 1;
  if(irSensor==2)
      total_car = 2;
  // total free slot can find from (total slotlot - total car)  
  freeSlot = totalSlot - total_car; 
  // number of free slot then sent to raspberry pi
  Serial.println(freeSlot);
  // update the value every 1 seconds
  delay(1000);
  total_car = 0;
  irSensor = 0;

}
