#include <WiFi.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <Preferences.h>
#include <DHT.h>
#include <FuzzyLogic.h>   

// ================== CONFIG ==================
#define GAS_PIN 34
#define DHTPIN 14
#define DHTTYPE DHT11
#define RESET_BUTTON 4

#define BUZZER 15
#define LED_R 25
#define LED_G 26
#define LED_B 27

const char* serverUrl = "http://192.168.233.212:3000/api/data";
const char* device_id = "ESP32_001";

// ===========================================

DHT dht(DHTPIN, DHTTYPE);
WebServer server(80);
Preferences preferences;
FuzzyLogic fuzzy;   

String ssid = "";
String password = "";

bool isConnected = false;

void setColor(bool r, bool g, bool b) {
  digitalWrite(LED_R, r);
  digitalWrite(LED_G, g);
  digitalWrite(LED_B, b);
}


// ================== HTML ==================
String getHTML(String message) {

  String html = R"rawliteral(
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body {
        margin: 0;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #F5EBE0;
        font-family: Arial;
      }
      .card {
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        width: 260px;
        text-align: center;
      }
      input {
        width: 100%;
        padding: 8px;
        margin: 8px 0;
        border-radius: 5px;
        border: 1px solid #ccc;
      }
      button {
        width: 100%;
        padding: 10px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
      }
      .msg {
        font-size: 14px;
        margin-bottom: 10px;
      }
      .success { color: green; }
      .error { color: red; }
    </style>
  </head>

  <body>
    <div class="card">
      <h3>Cấu hình WiFi ESP32</h3>
  )rawliteral";

  if (message != "") {
    if (message.indexOf("thành công") >= 0) {
      html += "<div class='msg success'>" + message + "</div>";
    } else {
      html += "<div class='msg error'>" + message + "</div>";
    }
  }

  html += R"rawliteral(
      <form action="/save">
        <input name="ssid" placeholder="Tên WiFi">
        <input name="pass" type="password" placeholder="Mật khẩu">
        <button type="submit">Lưu</button>
      </form>
    </div>
  </body>
  </html>
  )rawliteral";

  return html;
}

// ================== CONNECT WIFI ==================
void connectWiFi() {
  Serial.println("Connecting to saved WiFi...");
  WiFi.begin(ssid.c_str(), password.c_str());

  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 20) {
    delay(500);
    Serial.print(".");
    retry++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConnected!");
    Serial.println(WiFi.localIP());
    isConnected = true;
  } else {
    Serial.println("\nFailed to connect");
    isConnected = false;
  }
}

// ================== AP MODE ==================
void startAPMode() {
  Serial.println("Starting AP Mode...");
  WiFi.softAP("ESP32-Setup");

  server.on("/", []() {
    server.send(200, "text/html", getHTML(""));
  });

  server.on("/save", []() {
    String newSSID = server.arg("ssid");
    String newPASS = server.arg("pass");

    WiFi.begin(newSSID.c_str(), newPASS.c_str());

    int retry = 0;
    while (WiFi.status() != WL_CONNECTED && retry < 20) {
      delay(500);
      retry++;
    }

    if (WiFi.status() == WL_CONNECTED) {
      preferences.putString("ssid", newSSID);
      preferences.putString("pass", newPASS);

      server.send(200, "text/html", getHTML("Kết nối thành công! Restarting..."));
      delay(2000);
      ESP.restart();
    } else {
      WiFi.disconnect();
      server.send(200, "text/html", getHTML("Sai WiFi hoặc mật khẩu!"));
    }
  });

  server.begin();
}

// ================== SETUP ==================
void setup() {
  Serial.begin(115200);
  dht.begin();

  pinMode(RESET_BUTTON, INPUT_PULLUP);

  pinMode(BUZZER, OUTPUT);
  pinMode(LED_R, OUTPUT);
  pinMode(LED_G, OUTPUT);
  pinMode(LED_B, OUTPUT);

  preferences.begin("wifi", false);

  ssid = preferences.getString("ssid", "");
  password = preferences.getString("pass", "");

  if (ssid != "") {
    connectWiFi();
  }

  if (!isConnected) {
    startAPMode();
  }
}

// ================== LOOP ==================
void loop() {

  // ===== RESET BUTTON =====
  if (digitalRead(RESET_BUTTON) == LOW) {
    delay(3000);
    if (digitalRead(RESET_BUTTON) == LOW) {
      Serial.println("Reset WiFi...");
      preferences.clear();
      delay(1000);
      ESP.restart();
    }
  }

  if (!isConnected) {
    setColor(1, 0, 0); // đỏ- không có WiFi
    server.handleClient();
    return;
  }

  int gas = analogRead(GAS_PIN);
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  if (isnan(temp) || isnan(hum)) {
    Serial.println("DHT read failed!");

    setColor(0, 0, 1); // blue- lỗi sensor
   
    delay(2000);
    return;
  }

  // ===== FUZZY =====
  float risk = fuzzy.evaluate(gas, temp, hum);

  String level = "SAFE";
  if (risk > 70) level = "DANGER";
  else if (risk > 40) level = "WARNING";

  Serial.println("===== SENSOR DATA =====");
  Serial.print("Gas: "); Serial.println(gas);
  Serial.print("Temp: "); Serial.println(temp);
  Serial.print("Humidity: "); Serial.println(hum);
  Serial.print("Risk: "); Serial.println(risk);
  Serial.println("Level: " + level);

  if (level == "SAFE") {
    setColor(0, 1, 0); // green
    digitalWrite(BUZZER, LOW);
  } 
  else if (level == "WARNING") {
    setColor(1, 1, 0); // vàng
    digitalWrite(BUZZER, HIGH);
  } 
  else {
    setColor(1, 0, 0); // đỏ
    digitalWrite(BUZZER, HIGH);
  }

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String json = "{";
    json += "\"device_id\":\"" + String(device_id) + "\",";
    json += "\"gas\":" + String(gas) + ",";
    json += "\"temperature\":" + String(temp) + ",";
    json += "\"humidity\":" + String(hum) + ",";
    json += "\"risk\":" + String(risk) + ",";
    json += "\"level\":\"" + level + "\"";
    json += "}";

    int code = http.POST(json);

    if (code <= 0) {
      setColor(1, 1, 1); // trắng- lỗi server
    }

    http.end();
  }

  delay(2000);
}