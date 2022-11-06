import Car from "./Car";
import Kakao from "./Kakao";

//CarImpl 클래스 선언
export default class CarImpl implements Car, Kakao {
    name = "K5";
    color = "white";
    start(){
        console.log("출발");
    }

    stop(){
        console.log("정차");
    }

    message = "hi"
    send() {
        console.log("message send");
    }
}