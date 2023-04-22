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

// console.log(printME("test","test2"));

let array = new Array;
array.push(1);
array.push(resultCar);
array.push('3');

// console.log(array);

let numbers = [1,2,3];
let strings = ['Hello','World'];
// console.log(numbers, strings);

let a = [1,2,3];
let o = {name: 'Jack', age: 32};
// console.log(Array.isArray(a), Array.isArray(o));

let numArray: number[] = [1,2,3];
let strArray: string[] = ['Hello','World'];

type IPerson = {name: string, age?: number};
let personArray:IPerson[] = [{name: 'Jack'}, {name:'Jane', age:32}];


const split = (str:string, delim:string=''): string[] => str.split(delim);
console.log(split('hello'));
console.log(split('w_o_r_l_d','_'));

const join = (strArray:string[], delim:string=''):string => strArray.join(delim);

console.log(join(['h','e','l','l','o']));
console.log(join(['w','o','r','l','d'],'_'));

const nums: number[] = [1,2,3,4,5];
for(let index=0; index < nums.length; index++){
    const item: number = nums[index];
    console.log(item);
}

let arr:number[] = [1,2,3,4,5];
let [first, second, third, ...rest] = arr; // 비구조화
console.log(first,second,third, rest);

//구조화
let names = ['Jack', 'Jane', 'Steve'];

for(let index in names){
    const name = names[index];
    console.log(`[${index}] : ${name}`);
}

let jack:{[key:string]: string | number} = {name : 'Jack', age: 32};
// let jack = {name : 'Jack', age: 32};
for(let property in jack){
    console.log(`${property} : ${jack[property]}`);
}

for(let name of ['Jack', 'Jane', 'Steve']) { // object 일때 주로 사용
    console.log(name);
}

// const arrayLength = (array:T[]):number => array.length;
const arrayLength = <T>(array:T[]):number => array.length;
const isEmpty = <T>(array:T[]):boolean => arrayLength<T>(array) == 0;

let numArr: number[] = [1,2,3];
let strArr: string[] = ['Hello','World'];

let personArr: IPerson[] = [{name: 'Jack'}, {name : 'Jane', age: 32}];
console.log(arrayLength(numArr),
            arrayLength(strArr),
            arrayLength(personArr),
            isEmpty([]),
            isEmpty([1])
);
