#ifndef FUZZY_LOGIC_H
#define FUZZY_LOGIC_H

class FuzzyLogic {
public:
    float evaluate(float gas, float temp, float hum);

private:
    float low(float x, float a, float b);
    float medium(float x, float a, float b, float c);
    float high(float x, float a, float b);
    float defuzz(float l, float m, float h);
};

#endif