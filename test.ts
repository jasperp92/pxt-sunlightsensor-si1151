
SI1151.initSunlight()
basic.forever(function () {
    serial.writeLine("Licht:" + SI1151.getHalfWord_Visible())
    serial.writeLine("IR: " + SI1151.getHalfWordIR())
    serial.writeLine("UV: " + SI1151.getHalfWordUV())
})