//--- package import
import {testMakePerson} from "./utils/makePerson";
import CarImpl from "./standard/CarImpl";
import CarExtImpl from "./standard/CarExtImpl";
import ObjExtCarImpl from "./standard/ObjExtCarImpl";
import Car from "./standard/Car";

function exam(variable:Car):Car {
    variable.name = "benz";
    return variable;
}
let funcSig: (arg1:Car) => Car = function (dummy:Car) : Car {
    dummy.name = " 더미 ";
    return dummy;
}

type snfunc = (arg1:string, arg2:number) => string
let f:snfunc = function (a1:string, a2:number): string {
    return "func";
}

console.log(   f("test",23)   );

let test:Car = {
    name : "test",
    color : "red",
    start : () => {
        console.log("test");
    },
    stop : () => {
        console.log("stop");
        return "check";
    }
}
console.log(test.stop());

let resultCar:Car = exam(test);
console.log(resultCar.name);

function printME( name:string, age:string):string {
 return name;
}
//
// let printME : (name:string, age:string) => {
//     return name;
// }

console.log(printME("test","test2"));