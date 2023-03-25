import ITree from "./ITree";
import { TreeBase } from "./TreeBase";

export class pdService extends TreeBase {
    constructor (
        public c_pdservice_name : String,
        public c_pdservice_contents : String,
        public c_pdservice_etc : String,
        public c_pdservice_owner : String,
        public c_pdservice_reviewer01 : String,
        public c_pdservice_reviewer02 : String,
        public c_pdservice_reviewer03 : String,
        public c_pdservice_reviewer04 : String,
        public c_pdservice_reviewer05 : String,
        public c_pdservice_writer_name : String,
        public c_pdservice_writer_cn : String,
        public c_pdservice_writer_mail : String,
        public c_pdservice_writer_date : String,

    ){
        super();
    }



}


