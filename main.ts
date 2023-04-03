enum UnitAddress {
    DEVICE_ADDRESS = 0x53
};

enum CommandCodes {
    RESET_CMD_CTR = 0x00,
    RESET_SW = 0x01,
    FORCE = 0x11,
    PAUSE = 0x12,
    START = 0x13
};

enum RegisterAddress {
    PART_ID = 0x00,
    REV_ID = 0x01,
    MFR_ID = 0x02,
    INFO_0 = 0x03,
    INFO_1 = 0x04,
    HOSTIN_3 = 0x07,
    HOSTIN_2 = 0x08,

    HOSTIN_0 = 0x0A,
    COMMAND = 0x0B,
    IRQ_ENABLE = 0x0F,
    RESPONSE_0 = 0x11,
    RESPONSE_1 = 0x10,

    IRQ_STATUS = 0x12,
    HOSTOUT_0 = 0x13,
    HOSTOUT_1 = 0x14,
    HOSTOUT_2 = 0x15,
    HOSTOUT_3 = 0x16,
    HOSTOUT_4 = 0x17,
    HOSTOUT_5 = 0x18,
    HOSTOUT_6 = 0x19,
    HOSTOUT_7 = 0x1A,
    HOSTOUT_8 = 0x1B,
    HOSTOUT_9 = 0x1C,
    HOSTOUT_10 = 0x1D,
    HOSTOUT_11 = 0x1E,
    HOSTOUT_12 = 0x1F,
    HOSTOUT_13 = 0x20,
    HOSTOUT_14 = 0x21,
    HOSTOUT_15 = 0x22,
    HOSTOUT_16 = 0x23,
    HOSTOUT_17 = 0x24,
    HOSTOUT_18 = 0x25,
    HOSTOUT_19 = 0x26,
    HOSTOUT_20 = 0x27,
    HOSTOUT_21 = 0x28,
    HOSTOUT_22 = 0x29,
    HOSTOUT_23 = 0x2A,
    HOSTOUT_24 = 0x2B,
    HOSTOUT_25 = 0x2C
};

enum ParameterAddress {
    I2C_ADDR = 0x00,
    CHAN_LIST = 0x01,

    ADCCONFIG_0 = 0x02,
    ADCSENS_0 = 0x03,
    ADCPOST_0 = 0x04,
    MEASCONFIG_0 = 0x05,

    ADCCONFIG_1 = 0x06,
    ADCPOST_1 = 0x08,
    ADCSENS_1 = 0x07,
    MEASCONFIG_1 = 0x09,

    ADCCONFIG_2 = 0x0A,
    ADCSENS_2 = 0x0B,
    ADCPOST_2 = 0x0C,
    MEASCONFIG_2 = 0x0D,

    ADCCONFIG_3 = 0x0E,
    ADCSENS_3 = 0x0F,
    ADCPOST_3 = 0x10,
    MEASCONFIG_3 = 0x11,

    ADCCONFIG_4 = 0x12,
    ADCSENS_4 = 0x13,
    ADCPOST_4 = 0x14,
    MEASCONFIG_4 = 0x15,

    ADCCONFIG_5 = 0x16,
    ADCSENS_5 = 0x17,
    ADCPOST_5 = 0x18,
    MEASCONFIG_5 = 0x19,

    MEASRATE_H = 0x1A,
    MEASRATE_L = 0x1B,
    MEASCOUNT_0 = 0x1C,
    MEASCOUNT_1 = 0x1D,
    MEASCOUNT_2 = 0x1E,

    LED1_A = 0x1F,
    LED1_B = 0x20,
    LED2_A = 0x21,
    LED2_B = 0x22,
    LED3_A = 0x23,
    LED3_B = 0x24,

    THRESHOLD0_H = 0x25,
    THRESHOLD0_L = 0x26,
    THRESHOLD1_H = 0x27,
    THRESHOLD1_L = 0x28,
    THRESHOLD2_H = 0x29,
    THRESHOLD2_L = 0x2A,

    BURST = 0x2B
};

namespace SI1151 {


    export class SI1151 {

        conf: Buffer;
        writeBuf: Buffer;

        /**
           Configures a channel at a given index
        */

        private config_channel(index: number) {
            //
            let len = 4;

            if (len != 4 || index < 0 || index > 5)
                return;

            let inc = index * len;

            /*serial.writeLine("conf0 " + this.conf[0]);
            serial.writeLine("conf1 " + this.conf[1]);
            serial.writeLine("conf2 " + this.conf[2]);
            serial.writeLine("conf3 " + this.conf[3]);*/


            this.param_set(ParameterAddress.ADCCONFIG_0 + inc, this.conf[0]);
            this.param_set(ParameterAddress.ADCSENS_0 + inc, this.conf[1]);
            this.param_set(ParameterAddress.ADCPOST_0 + inc, this.conf[2]);
            this.param_set(ParameterAddress.MEASCONFIG_0 + inc, this.conf[3]);
        }

        /**
           Writes data over i2c
        */
        private write_data(len: number) {    //check

            //let buf: Buffer = pins.createBuffer(len+1);
            //buf = this.writeBuf;
            pins.i2cWriteBuffer(UnitAddress.DEVICE_ADDRESS, this.writeBuf, false);

        }

        /**
           Reads data from a register over i2c
        */
        private read_register(addr: number, reg: number, bytesOfData: number): number {  //int     //check

            let buf: Buffer = pins.createBuffer(bytesOfData);
            buf[0] = reg;
            pins.i2cWriteBuffer(addr, buf, false);
            buf = pins.i2cReadBuffer(addr, 1, false);
            return buf[0];

        }

        /**
           param set as shown in the datasheet
        */
        private param_set(loc: number, val: number) {   //eher check
            //let packet: Buffer = pins.createBuffer(2);
            let r;
            let cmmnd_ctr;

            do {
                cmmnd_ctr = this.read_register(UnitAddress.DEVICE_ADDRESS, RegisterAddress.RESPONSE_0, 1);

                this.writeBuf = pins.createBuffer(2);
                this.writeBuf[0] = RegisterAddress.HOSTIN_0;
                this.writeBuf[1] = val;
                //serial.writeLine("val= " + val);
                this.write_data(2);

                this.writeBuf[0] = RegisterAddress.COMMAND;
                this.writeBuf[1] = loc | (0B10 << 6);
                //serial.writeLine("loc= " + loc);
                this.write_data(2);

                r = this.read_register(UnitAddress.DEVICE_ADDRESS, RegisterAddress.RESPONSE_0, 1);
            } while (r > cmmnd_ctr);
        }


        /**
         param query as shown in the datasheet
        */
        private param_query(loc: number): number {
            let result = -1;
            let r;
            let cmmnd_ctr;

            do {
                cmmnd_ctr = this.read_register(UnitAddress.DEVICE_ADDRESS, RegisterAddress.RESPONSE_0, 1);

                this.writeBuf = pins.createBuffer(2);
                this.writeBuf[0] = RegisterAddress.COMMAND;
                this.writeBuf[1] = loc | (0B01 << 6);

                this.write_data(2);

                r = this.read_register(UnitAddress.DEVICE_ADDRESS, RegisterAddress.RESPONSE_0, 1);
            } while (r > cmmnd_ctr);

            result = this.read_register(UnitAddress.DEVICE_ADDRESS, RegisterAddress.RESPONSE_1, 1);

            return result;
        }

        /**
         Sends command to the command register
        */
        send_command(code: number) {    //check
            let packet: Buffer = pins.createBuffer(2);
            let r;
            let cmmnd_ctr;
            do {
                cmmnd_ctr = this.read_register(UnitAddress.DEVICE_ADDRESS, RegisterAddress.RESPONSE_0, 1);

                //packet[0] = RegisterAddress.COMMAND;
                //packet[1] = code;
                this.writeBuf = pins.createBuffer(2);
                this.writeBuf[0] = RegisterAddress.COMMAND;
                this.writeBuf[1] = code;
                //serial.writeLine("0 und " + this.writeBuf[0]);
                //serial.writeLine("1 und " + this.writeBuf[1]);


                this.write_data(2);

                r = this.read_register(UnitAddress.DEVICE_ADDRESS, RegisterAddress.RESPONSE_0, 1);
            } while (r > cmmnd_ctr);

        }

        /**
         Returns int given a byte array
        */
        /*get_int_from_bytes(uint8_t * data, size_t len): number{
            int result = 0;
            int shift = 8 * len;
            
            for (int i = 0; i < len; i++) {
                shift -= 8;
                result |= ((data[i] << shift) & (0xFF << shift));
            }
            return result;
        }*/

        init(): boolean {

            if (this.ReadByte(0x00) != 0x51) {  //Device ID, 0x51 if Si1151
                return false;
            }
            this.send_command(CommandCodes.START);

            this.param_set(ParameterAddress.CHAN_LIST, 0B000010);   //channel1 enabled

            this.param_set(ParameterAddress.MEASRATE_H, 0);
            this.param_set(ParameterAddress.MEASRATE_L, 1);  // 1 for a base period of 800 us
            this.param_set(ParameterAddress.MEASCOUNT_0, 5);
            this.param_set(ParameterAddress.MEASCOUNT_1, 10);
            this.param_set(ParameterAddress.MEASCOUNT_2, 10);
            this.param_set(ParameterAddress.THRESHOLD0_L, 200);
            this.param_set(ParameterAddress.THRESHOLD0_H, 0);

            this.writeBuf = pins.createBuffer(2);
            this.writeBuf[0] = RegisterAddress.IRQ_ENABLE;
            //this.write_data(1);
            this.writeBuf[1] = 0B000010;
            this.write_data(2);

            this.conf = pins.createBuffer(4);

            //this.conf[0] = 0B00000000;
            //this.conf[1] = 0B00000010,

            //777
            //this.conf[2] = 0B00000001;      //Arduino
            //this.conf[2] = 0B01111000;      //Raspy
            //this.conf[3] = 0B11000001;      //Arduino
            //this.conf[3] = 0B11000000;      //Raspy

            this.conf[0] = 13;
            this.conf[1] = 0;
            this.conf[2] = 0;
            this.conf[3] = 0;

            this.config_channel(0);

            this.conf[0] = 15;
            this.conf[1] = 0;
            this.conf[2] = 0;
            this.conf[3] = 0;

            this.config_channel(1);

            this.conf[0] = 2;
            this.conf[1] = 0;
            this.conf[2] = 0;
            this.conf[3] = 0;

            this.config_channel(2);

            /*this.conf[0] = 0B00000000;
            this.conf[1] = 0B00000010,
            this.conf[2] = 0B01111000;
            this.conf[3] = 0B11000000;
            this.config_channel(1);*/

            basic.pause(100);
            //let read_register;
            //let adr;

            /*adr = 0x01;
            read_register = this.param_query(adr);
            serial.writeLine("read register adr: " + adr + ", data: " + read_register);
            adr = RegisterAddress.IRQ_ENABLE; //0x0F
            read_register = this.read_register(0x53,adr,1);
            serial.writeLine("read register adr: " + adr + ", data: " + read_register);*/

            return true;

        }

        ReadHalfWord_IR(): number {
            this.param_set(ParameterAddress.CHAN_LIST, 0B000001);   //channel0 enabled
            this.send_command(CommandCodes.FORCE);
            let data: Buffer = pins.createBuffer(3);
            data[0] = this.read_register(UnitAddress.DEVICE_ADDRESS, RegisterAddress.HOSTOUT_0, 1);
            data[1] = this.read_register(UnitAddress.DEVICE_ADDRESS, RegisterAddress.HOSTOUT_1, 1);
            // Si115X::send_command(Si115X::PAUSE);
            // data[3] = data[0] * 256 + data[1];
            return data[0] * 256 + data[1]; //* 256 + data[1];
        }



        //Kann keinen UV-Idx messen

        ReadHalfWord_VISIBLE(): number {
            this.param_set(ParameterAddress.CHAN_LIST, 0B000001);   //channel0 enabled
            this.send_command(CommandCodes.FORCE);
            let data: Buffer = pins.createBuffer(3);
            data[0] = this.read_register(UnitAddress.DEVICE_ADDRESS, RegisterAddress.HOSTOUT_0, 1);
            data[1] = this.read_register(UnitAddress.DEVICE_ADDRESS, RegisterAddress.HOSTOUT_1, 1);
            //serial.writeLine("RegisterAdress.Hostout0 " + RegisterAddress.HOSTOUT_0);
            //serial.writeLine("data0 " + data[0]);
            //serial.writeLine("data1 " + data[1]);
            //serial.writeLine("return " + (data[0] * 256 + data[1]) / 3);

            return (data[0] * 256 + data[1]) / 3;

        }

        ReadHalfWord_UV(): number {
            this.param_set(ParameterAddress.CHAN_LIST, 0B000001);   //channel0 enabled
            this.send_command(CommandCodes.FORCE);
            let data: Buffer = pins.createBuffer(3);
            data[0] = this.read_register(UnitAddress.DEVICE_ADDRESS, RegisterAddress.HOSTOUT_0, 1);
            data[1] = this.read_register(UnitAddress.DEVICE_ADDRESS, RegisterAddress.HOSTOUT_1, 1);

            return ((data[1] * 256 + data[0]) / 3) * 0.0012;

        }

        private ReadByte(Reg: number): number {
            let buf: Buffer = pins.createBuffer(1);

            buf[0] = Reg;
            pins.i2cWriteBuffer(UnitAddress.DEVICE_ADDRESS, buf, false);
            buf = pins.i2cReadBuffer(UnitAddress.DEVICE_ADDRESS, 1, false);

            return buf[0];
        }
    }


    /**
* init Grove Sunlight module
* 
*/
    let si1151 = new SI1151();
    //% group="sunlight sensor SI1151"
    //% block="init sunlight sensor"
    export function initSunlight() {
        //if (!sgp30) {
        si1151.init();
    }

    /**
    * get halfword sunlight
    * 
    */
    //% group="sunlight sensor SI1151"
    //% block="read visible light"
    export function getHalfWord_Visible(): number {
        return Math.round(si1151.ReadHalfWord_VISIBLE());
    }

    /**
    * get halfword sunlight
    * 
    */
    //% group="sunlight sensor SI1151"
    //% block="read IR"
    export function getHalfWordIR(): number {
        return Math.round(si1151.ReadHalfWord_IR());
    }

        /**
    * get halfword uv
    * 
    */
    //% group="sunlight sensor SI1151"
    //% block="read UV"
    export function getHalfWordUV(): number {
        return Math.round(si1151.ReadHalfWord_UV());
    }
}