#include "FuzzyLogic.h"
#include <Arduino.h>

// ================== MEMBERSHIP ==================
float FuzzyLogic::low(float x, float a, float b) {
  if (x <= a)
    return 1;
  if (x >= b)
    return 0;
  return (b - x) / (b - a);
}

float FuzzyLogic::medium(float x, float a, float b, float c) {
  if (x <= a || x >= c)
    return 0;
  if (x == b)
    return 1;
  if (x < b)
    return (x - a) / (b - a);
  return (c - x) / (c - b);
}

float FuzzyLogic::high(float x, float a, float b) {
  if (x <= a)
    return 0;
  if (x >= b)
    return 1;
  return (x - a) / (b - a);
}

// ================== DEFUZZ ==================
float FuzzyLogic::defuzz(float l, float m, float h) {
  float num = l * 20 + m * 50 + h * 90;
  float den = l + m + h;
  if (den == 0)
    return 0;
  return num / den;
}

// ================== MAIN ==================
float FuzzyLogic::evaluate(float gas, float temp, float hum) {

  float gas_low = low(gas, 500, 1500);
  float gas_med = medium(gas, 1000, 2000, 3000);
  float gas_high = high(gas, 2000, 3500);

  float temp_low = low(temp, 25, 35);
  float temp_med = medium(temp, 30, 40, 50);
  float temp_high = high(temp, 40, 60);

  float hum_low = low(hum, 30, 50);
  float hum_med = medium(hum, 40, 60, 80);
  float hum_high = high(hum, 60, 90);

  // ===== HIGH =====
  float r1 = min(gas_high, min(temp_high, hum_low));
  float r2 = min(gas_high, min(temp_med, hum_low));
  float r3 = min(gas_med, min(temp_high, hum_low));
  float r4 = min(temp_high, hum_low);
  float r5 = min(gas_high, temp_high);
  float r6 = min(gas_high, hum_low);

  float out_high = max(r1, max(r2, max(r3, max(r4, max(r5, r6)))));

  // ===== MEDIUM =====
  float r7 = min(gas_med, min(temp_low, hum_med));
  float r8 = min(gas_med, temp_med);
  float r9 = min(temp_med, hum_low);

  float out_medium = max(r7, max(r8, r9));

  // ===== LOW =====
  float r10 = min(gas_low, min(temp_low, hum_high));
  float r11 = min(temp_low, hum_high);

  float out_low = max(r10, r11);

  return defuzz(out_low, out_medium, out_high);
}