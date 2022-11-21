import {testMakePerson} from "./utils/makePerson";
import CarImpl from "./standard/CarImpl";
import CarExtImpl from "./standard/CarExtImpl";
import ObjExtCarImpl from "./standard/ObjExtCarImpl";
import Car from "./standard/Car";

testMakePerson();


//object 타입으로 정확하게는 리터럴 객체 선언
/**
 * interface 인터페이스 이름 {
 *  key: type;
 *  key: type;
 * }
 */

interface UserInfo {
    name:string,
    age: number
}

//기본적으로 Object 선언하는 방식으로 선언
const user:UserInfo = {
    name: "ryan",
    age: 20,
}
console.log(user.name) // ryan




//리터럴 객체인데, 인터페이스의 타입을 다양하게 사용한 예제
enum Gender {
    Man,
    Woman
}

interface UserVariousInfo {
    name: string;
    age: number;
    gender?: Gender; // 있어도 되고 없어도 되는 옵셔널 설멎(물음표)
    readonly birth: number; //읽기 전용
    [key:number]: string; // 여러 속성 정보를 받을 때 사용 (key:number, value:string)
}

//gender 포함
const user1:UserVariousInfo = {
    name: "ryan1",
    age: 20,
    gender: Gender.Man,
    birth:19901210,
}

//gedner 제외
const user2:UserVariousInfo = {
    name: "ryan2",
    age: 22,
    birth:19891225
}

//index 사용
const user3:UserVariousInfo = {
    name: "ryan2",
    age: 22,
    birth:19891225,
    1: "1반",
    2: "2번"
}
console.log("인터페이스 객체 -> " + user1.gender);
console.log("물음표 -> " + user2.gender);
console.log("키벨류 사용 -> " + user3[2]); // ----- deep dive


// 진짜 인터페이스 사용은 이런것이다.
const carImpl:Car = new CarImpl();
console.log("<- CarImpl 사용 -> ");
carImpl.start();
carImpl.stop();

var test:Car = new CarImpl();

// 인터페이스 확장 인스턴스 샘플
const carExtImpl = new CarExtImpl();
console.log("<- carExtImpl 사용 -> ");
carExtImpl.start();
carExtImpl.sound();
carExtImpl.stop();

const objExtCarImpl = new ObjExtCarImpl("이름","색상","모델");
console.log("<- 확장된 객체를 다시 확장한 인스턴스 사용 -> ");
objExtCarImpl.start();