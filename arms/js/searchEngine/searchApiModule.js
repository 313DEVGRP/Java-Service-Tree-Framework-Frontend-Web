var SearchApiModule = (function () {
    "use strict";

    var searchRangeDate = {
        "start-date": null,
        "end-date" : null
    };

    var getRangeDate = function () {
        return searchRangeDate;
    };

    var setRangeDate = function (rangeTypeId) {
        let today = new Date();
        let today_ISOString = today.toISOString(); // UTC+00:00 기준으로 "2024-03-12T12:25:27.525Z"
        searchRangeDate["end-date"] = setEndTimeOfTheDay(today_ISOString);
        console.log("[searchApiModule :: setRangeDate] :: today => " + today);
        console.log("[searchApiModule :: setRangeDate] :: today.ISOString => " + today.toISOString());

        switch (rangeTypeId) {
            case "custom-range" :
                searchRangeDate["start-date"] = ($("#date_timepicker_start").val() === null ? null : setStartTimeOfTheDay($("#date_timepicker_start").val()));
                searchRangeDate["end-date"] = ($("#date_timepicker_end").val() === null ? setEndTimeOfTheDay(today.toISOString()) : setEndTimeOfTheDay($("#date_timepicker_end").val()));
                break;
            case "all-time":
                searchRangeDate["start-date"] = null;
                break;
            case "previous-hour":
                let oneHourAgo = new Date(today.getTime() - (1 * 60 * 60 * 1000));
                searchRangeDate["start-date"] = oneHourAgo.toISOString();
                searchRangeDate["end-date"] = today.toISOString();
                break;
            case "previous-day":
                let oneDayAgo = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
                searchRangeDate["start-date"] = setStartTimeOfTheDay(oneDayAgo);
                break;
            case "previous-week":
                let oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                searchRangeDate["start-date"] = setStartTimeOfTheDay(oneWeekAgo);
                break;
            case "previous-month":
                let oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                searchRangeDate["start-date"] = setStartTimeOfTheDay(oneMonthAgo);
                break;
            case "previous-year":
                let oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
                searchRangeDate["start-date"] = setStartTimeOfTheDay(oneYearAgo);
                break;
        }
    };

    // 끝_날짜 시간 23:59:59 설정
    var setEndTimeOfTheDay = function (dateString) {
        let date = new Date(dateString);
        date.setHours(23);
        date.setMinutes(59);
        date.setSeconds(59);
        date.setMilliseconds(0);
        return date.toISOString();
    };
    // 시작_날짜 끝 시간 0:0:0 설정 (24:00:00, 12:00:00으로 보임 -> 아래 setMidnightToZero 활용)
    var setStartTimeOfTheDay = function (dateString) {
        let date = new Date(dateString);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date.toISOString();
    };

    // 자정  24:00:00 -> 00:00:00 으로 변경
    var setMidnightToZero = function(dateString) {
        let date = new Date(dateString);
        let formattedDate;
        // 시간을 자정인 경우 "오전 00:00:00"으로 수정
        if (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0) {
            const parts = ['오전', '00:00:00'];
            formattedDate = `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}. ${parts.join(' ')}`;
            return formattedDate;
        } else {
            formattedDate = date.toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'});
            return formattedDate;
        }
    };
    var setRangeDateAsync = function(rangeTypeId) {
        return new Promise( (resolve, reject) => {
            setRangeDate(rangeTypeId);
            resolve();
        });
    };

    var searchResult = {
        "jiraissue" : null,
        "log" : null
    };

    // 검색결과 총수
    var hitsTotal = {
        "jiraissue" : null,
        "log" : null
    };

    var setSearchResult = function(search_section, search_results, current_page, items_per_Page) {
        if(search_section) {
            searchResult[search_section] = search_results["검색결과_목록"];
            hitsTotal[search_section] = search_results["결과_총수"];

            displayResults(search_section, getSearchResult(search_section), getHitsTotal(search_section));
            displayPagination(search_section, current_page);

        } else {
            console.log("[searchApiModule :: setSearchResult] ::: search_section 없습니다.");
        }
    };

    var getSearchResult = function(search_section) {
        return searchResult[search_section];
    };

    var getHitsTotal = function(search_section) {
        return hitsTotal[search_section];
    };

    // 클릭 했을 때, 모달 띄우기 위한 자료.
    var getSearchResultDetail = function (search_section, order) {
        console.log("[searchApiModule :: getSearchResultDetail] :: search_section -> " + search_section + ", order ->" + order);
        return searchResult[search_section][order];
    };

    var displayPagination = function (search_section, currentPage) {

        const totalPage = Math.ceil(hitsTotal[search_section] / 10);
        const countPageBlock = 10; // 페이지블록 수 (한번에 보여줄 페이지 수)
        let startPage = ((currentPage-1) / 10) * 10 + 1;
        let endPage = startPage + countPageBlock -1;

        if (totalPage < currentPage) { currentPage = totalPage; }
        if (endPage > totalPage) {     endPage = totalPage;     }

        let pagination = '';
        pagination += '<ul class="pagination">';
        pagination += `<li class="prev ${currentPage === 1 ? 'disabled' : ''}"><a onclick="changePage(\'${search_section}\',${startPage - 1})">Prev</a></li>`;
        for (let i = 1; i <= endPage; i++) {
            pagination += `<li class="${currentPage === i ? 'active' : ''} page-num-${i}"><a onclick="changePage(\'${search_section}\',${i})">${i}</a></li>`;
        }
        pagination += `<li class="next ${totalPage === endPage ? 'disabled' : ''}"><a onclick="changePage(\'${search_section}\',${endPage + 1})">Next</a></li>`;
        pagination += '</ul>';

        let pagination_spot = '#'+search_section+'_section'+' .pagination-div';
        $(pagination_spot).html(pagination);
    };

    var displayResults = function (search_section, searchResult, hitsTotal) {
        console.log("[searchApiModule :: displayData] :: search_section -> " + search_section);
        // 데이터를 화면에 표시하는 코드 작성
        let search_result_arr = searchResult;
        let hits_total = 0;
        if(hitsTotal) {
            hits_total = hitsTotal;
            let total_text = (hitsTotal >= 10000 ? " 10000건 이상" : "'총"+hits_total+"건'");
            $("#"+search_section+"_section .search_results_total").text(total_text);
            $("#"+search_section+"_section .search_results_total").css("color","#a4c6ff");
        } else {
            $("#"+search_section+"_section .search_results_total").text("0건");
            $("#"+search_section+"_section .search_results_total").css("color",null);
        }
        let today = new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'});
        let no_search_result =
            `<section class="search-result">                    
                    <div class="search_head search_none" id="no_search_result_${search_section}">
                        <div class="search_title">
                            <span style="font-size: 13px; color:#a4c6ff;">
                                <span role="img" aria-label=":sparkles:" title=":sparkles:" style="background-color: transparent; display: inline-block; vertical-align: middle;">
                                    <img src="/arms/img/bestqulity.png" alt=":sparkles:" width="15" height="15" class="CToWUd" data-bit="iit" style="margin: 0px; padding: 0px; border: 0px; display: block; max-width: 100%; height: auto;">
                                </span>                                
                                &nbsp; 검색 결과가 없습니다. &nbsp;
                            </span>
                        </div>
                        <div class="search_category" style="display: flex">
                            <p class="text-muted" style="margin: 5px 0;">                                
                                <small> - </small>
                            </p>
                            <p class="text-success" style="margin: 5px 0 5px 5px;">
                                <small>${today}</small>
                            </p>
                        </div>
                    </div>
                    <div class="search_content" style="height: 4rem; line-height: 1.58;  overflow: hidden;">
                        <span>
                        검색 결과가 없습니다. 현재시각 :: ${today}
                        </span>
                    </div>
                </section>`;

        if(search_section === 'jiraissue') {
            $("#jiraissue_section .search_result_group .search_result_items").html("");
            if(search_result_arr && search_result_arr.length !== 0) {
                search_result_arr.forEach(function (content, index) {
                    var highlight_stringify = "";
                    var issue_key = (content["content"]["key"] !== null ? content["content"]["key"] : " - " );
                    var jiraproject_name = (content["content"]["project"] !== null ? content["content"]["project"]["project_name"] : " - ");
                    if(content["highlightFields"]) {
                        highlight_stringify = JSON.stringify(content["highlightFields"], undefined, 4);
                    }
                    // highlightFields ES 자체 도출 필드
                    let highlightFields_string = (highlight_stringify === "" ? " - " : highlight_stringify);
                    let timestamp_kst = new Date(content["content"]["timestamp"]).toLocaleString('ko-KR',{timeZone: 'Asia/Seoul'});
                    $("#jiraissue_section .search_result_group .search_result_items").append(
                        `<section class="search-result" data-toggle="modal" data-target="#search_detail_modal_jiraissue">
                            <div class="search_head" id="hits_order_jiraissue_${index}">
                                <div class="search_title">
                                    <span style="font-size: 13px; color:#a4c6ff;">
                                        <span role="img" aria-label=":sparkles:" title=":sparkles:" style="background-color: transparent; display: inline-block; vertical-align: middle;">
                                            <img src="/arms/img/bestqulity.png" alt=":sparkles:" width="15" height="15" class="CToWUd" data-bit="iit" style="margin: 0px; padding: 0px; border: 0px; display: block; max-width: 100%; height: auto;">
                                        </span>
                                        <!-- 지라이슈 summary 나오도록 -->
                                        &nbsp;${content["content"]["summary"]}							
                                    </span>
                                </div>
                                <div class="search_category" style="display: flex">
                                    <p class="text-muted" style="margin: 5px 0;">                                        
                                        <small>${content["index"]}</small>
                                    </p>
                                    <p class="text-success" style="margin: 5px 0 5px 5px;">
                                        <small>${timestamp_kst}</small>
                                    </p>
                                </div>
                            </div>
                            <div class="search_content" style="height: 4rem; line-height: 1.58;  overflow: hidden;">
                                <span> 
                                    ${highlightFields_string}                        
                                </span>
                                <span>                                
                                </br>&nbsp; 이슈 : ${issue_key} &nbsp;&nbsp; 지라프로젝트: ${jiraproject_name} </br>                                															
                                &nbsp; 최초생성일: ${content["content"]["created"]}
                                </span>
                            </div>
                        </section>`
                    );
                });
            } else {
                $("#jiraissue_section .search_result_group .search_result_items").append(no_search_result);
            }
        }
        else if (search_section === 'log') {
            $("#log_section .search_result_group .search_result_items").html("");
            if(search_result_arr && search_result_arr.length !== 0) {
                search_result_arr.forEach(function (content, index) {
                    var highlight_stringify = "";
                    if(content["highlightFields"]) {
                        highlight_stringify = JSON.stringify(content["highlightFields"], undefined, 4);
                    }
                    let highlightFields_string = (highlight_stringify === "" ? content["content"]["log"] : highlight_stringify);
                    let timestamp_kst = new Date(content["content"]["timestamp"]).toLocaleString('ko-KR',{timeZone: 'Asia/Seoul'});
                    $("#log_section .search_result_group .search_result_items").append(
                        `<section class="search-result" data-toggle="modal" data-target="#search_detail_modal_log">
                            <div class="search_head" id="hits_order_log_${index}">
                                <div class="search_title">
                                    <span style="font-size: 13px; color:#a4c6ff;">
                                        <span role="img" aria-label=":sparkles:" title=":sparkles:" style="background-color: transparent; display: inline-block; vertical-align: middle;">
                                            <img src="/arms/img/bestqulity.png" alt=":sparkles:" width="15" height="15" class="CToWUd" data-bit="iit" style="margin: 0px; padding: 0px; border: 0px; display: block; max-width: 100%; height: auto;">
                                        </span>
                                        <!-- 로그네임 표시 -->
                                        &nbsp;${content["content"]["logName"]}							
                                    </span>
                                </div>
                                <div class="search_category" style="display: flex">
                                    <p class="text-muted" style="margin: 5px 0;">                                        
                                        <small>${content["index"]}</small>
                                    </p>
                                    <p class="text-success" style="margin: 5px 0 5px 5px;">
                                        <small>${timestamp_kst}</small>
                                    </p>
                                </div>
                            </div>
                            <div class="search_content" style="height: 4rem; line-height: 1.58;  overflow: hidden;">
                                <span> 
                                    ${highlightFields_string}                        
                                </span>
                            </div>
                        </section>`
                    );
                });
            } else {
                $("#log_section .search_result_group .search_result_items").append(no_search_result);
            }
        }

    };

    var updateButtons = function (search_section, current_page, pageStart) {
        console.log("[searchApiModule :: updateButtons] :: current_page => " + current_page);
        let total_page = Math.ceil(hitsTotal[search_section] / 10); //총 페이지
        const $pagination = $('#'+search_section+'_section .pagination-div .pagination');
        const $prevButton = $('#'+search_section+'_section .pagination-div .pagination .prev');
        const $nextButton = $('#'+search_section+'_section .pagination-div .pagination .next');
        let countPageBlock = 10;
        let startPage = ((pageStart-1) / 10) * 10 + 1;
        let endPage = Math.min(startPage + 9, total_page);
        // let endPage = startPage + countPageBlock -1;

        if (total_page < current_page) {
            current_page = total_page;
        }

        if (endPage >= total_page) {
            endPage = total_page;
        }

        let pagination = '<ul class="pagination">';
        pagination += `<li class="prev ${current_page === 1 ? 'disabled' : ''}"><a onclick="changePage('${search_section}', ${Math.max(startPage - 10, 1)})">Prev</a></li>`;
        for (let i = startPage; i <= endPage; i++) {
            pagination += `<li class="${current_page === i ? 'active' : ''} page-num-${i}"><a onclick="changePage('${search_section}', ${i})">${i}</a></li>`;
        }
        pagination += `<li class="next ${current_page === total_page ? 'disabled' : ''}"><a onclick="changePage('${search_section}', ${Math.min(endPage + 1, total_page)})">Next</a></li>`;
        pagination += '</ul>';

        let pagination_spot = '#' + search_section + '_section' + ' .pagination-div';
        $(pagination_spot).html(pagination);

        $prevButton.toggleClass('disabled', startPage === 1);
        $nextButton.toggleClass('disabled', endPage === total_page);

        $prevButton.toggleClass('disabled', startPage === 1);
        $nextButton.toggleClass('disabled', endPage === total_page);

        // 이전에 선택된 페이지 요소에서 'active' 클래스 제거
        $pagination.find('.active').removeClass('active');
        // 선택된 페이지 번호에 해당하는 요소에 'active' 클래스 추가
        $pagination.find('.page-num-' + current_page).addClass('active');
    };

    var mapDataToModal = function (search_section, order) {
        const targetData = SearchApiModule.getSearchResultDetail(search_section,order);
        console.log("[searchApiModule :: mapDataToModal] :: search_section => " + search_section);
        console.log("[searchApiModule :: mapDataToModal] :: order => " + order);
        console.log("[searchApiModule :: mapDataToModal] :: targetData => "); console.log(targetData);

        if(search_section === "jiraissue") {
            let timestamp_kst = new Date(targetData["content"]["timestamp"]).toLocaleString('ko-KR',{timeZone: 'Asia/Seoul'});
            let created_kst = new Date(targetData["content"]["created"]).toLocaleString('ko-KR',{timeZone: 'Asia/Seoul'});
            $("#search_detail_modal_jiraissue #detail_id_jiraissue").text(targetData["id"]);
            $("#search_detail_modal_jiraissue #detail_index_jiraissue").text(targetData["index"]);
            $("#search_detail_modal_jiraissue #detail_score_jiraissue").text(score_data(targetData["score"]));
            $("#search_detail_modal_jiraissue #detail_type_jiraissue").text(targetData["type"] === undefined ? " - " : targetData["type"]);
            $("#search_detail_modal_jiraissue #detail_modal_summary_jiraissue").text(targetData["content"]["summary"]);
            $("#search_detail_modal_jiraissue #detail_modal_key_jiraissue").text(targetData["content"]["key"]);
            $("#search_detail_modal_jiraissue #detail_modal_timestamp_jiraissue").text(timestamp_kst);
            $("#search_detail_modal_jiraissue #detail_modal_created_jiraissue").text(created_kst);

            if(targetData["content"]["assignee"]) {
                $("#search_detail_modal_jiraissue #detail_modal_assignee_name_jiraissue")
                    .text(targetData["content"]["assignee"]["assignee_displayName"]);
            } else {
                $("#search_detail_modal_jiraissue #detail_modal_assignee_name_jiraissue").text("담당자 정보 없음");
            }

            $("#search_detail_modal_jiraissue #modal_detail_log_jiraissue").html("");

            let highlightFieldsObject = targetData["highlightFields"];
            let unique_key_array = result_of_highlightFileds(highlightFieldsObject);

            var stringify = JSON.stringify(targetData, undefined, 4);
            var prettify = hljs.highlight(stringify,{language : "JSON" }).value;

            if(unique_key_array.length > 0) {
                let replacedResult = replacedText(prettify, unique_key_array);
                $("#search_detail_modal_jiraissue #modal_detail_log_jiraissue").html(replacedResult);
            } else {
                $("#search_detail_modal_jiraissue #modal_detail_log_jiraissue").html(prettify);
            }

        }
        else if (search_section === "log") {
            let timestamp_kst = new Date(targetData["content"]["timestamp"]).toLocaleString('ko-KR',{timeZone: 'Asia/Seoul'});
            $("#search_detail_modal_log #detail_id_log").text(targetData["id"]);
            $("#search_detail_modal_log #detail_index_log").text(targetData["index"]);
            $("#search_detail_modal_log #detail_score_log").text(score_data(targetData["score"]));
            $("#search_detail_modal_log #detail_type_log").text(targetData["type"] === undefined ? " - " : targetData["type"]);

            $("#search_detail_modal_log #detail_modal_logname_log").text(targetData["content"]["logName"]);
            $("#search_detail_modal_log #detail_modal_timestamp_log").text(timestamp_kst);
            $("#search_detail_modal_log #detail_modal_source_log").text(targetData["content"]["source"]);
            $("#search_detail_modal_log #detail_modal_container_id_log").text(targetData["content"]["container_id"] === null? "-" : targetData["content"]["container_id"].substring(0,12));
            $("#search_detail_modal_log #detail_modal_container_name_log").text(targetData["content"]["container_name"]);

            $("#search_detail_modal_log #modal_detail_log_log").html("");

            let highlightFieldsObject = targetData["highlightFields"];
            let unique_key_array = result_of_highlightFileds(highlightFieldsObject);

            var stringify = JSON.stringify(targetData["content"], undefined, 4);
            var prettify = hljs.highlight(stringify,{language : "JSON" }).value;

            if(unique_key_array.length > 0) {
                let replacedResult = replacedText(prettify, unique_key_array);
                $("#search_detail_modal_log #modal_detail_log_log").html(replacedResult);
            } else {
                $("#search_detail_modal_log #modal_detail_log_log").html(prettify);
            }

        }
    };

    var score_data = function (param) { // null, 'NaN', NaN 인 경우
        if (param === null || param === "NaN" || isNaN(param)) {
            return " - ";
        } else {
            return param;
        }
    };

    var result_of_highlightFileds = function (highlightFieldsObject) {
        let uniqueValues = new Set();
        if(highlightFieldsObject) {
            for (let key in highlightFieldsObject) {
                highlightFieldsObject[key].forEach(value => uniqueValues.add(extractValue_in_em(value)));
            }
        }
        return uniqueValues.size > 0 ? Array.from(uniqueValues) : [];
    }

    // 정규표현식으로 <em></em> 사이 값 추출
    function extractValue_in_em(str) {
        var regex = /<em>(.*?)<\/em>/;
        var match = regex.exec(str);

        if(match) {
            return match[1];
        }
    }

    // 원본 코드에서 target_text를 만나면 <em>target_text</em>의 형태로 교체
    var replacedText = function (original_text, target_text_arr) {
        console.log("[searchApiModule :: replacedText] :: target_text_arr");
        console.log(target_text_arr);
        for (let i = 0; i <target_text_arr.length; i++) {
            let target_text = target_text_arr[i];
            console.log("[searchApiModule :: replacedText] :: target_text => " + target_text);
            let regex = new RegExp(target_text, 'g');
            original_text = original_text.replace(regex,`<em>${target_text}</em>`);
        }
        return original_text;
    }

    return {
        // 날짜 구간 설정
        setRangeDate, getRangeDate, setRangeDateAsync, setMidnightToZero,
        // 검색 결과
        setSearchResult, getSearchResult, getHitsTotal,
        // 페이지 변경
        changePage,
        // 페이지 선택시, 페이지네이션 업데이트
        updateButtons,
        // 검색결과 상세, Modal 데이터 매핑
        getSearchResultDetail, mapDataToModal
    }
})(); //즉시실행 함수
