var SearchApiModule = (function () {
    "use strict";
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
        pagination += `<li class="prev ${currentPage === 1 ? 'disabled' : ''}"><a href="#" onclick="changePage(\'${search_section}\',${startPage - 1})">Prev</a></li>`;
        for (let i = 1; i <= endPage; i++) {
            pagination += `<li class="${currentPage === i ? 'active' : ''} page-num-${i}"><a href="#" onclick="changePage(\'${search_section}\',${i})">${i}</a></li>`;
        }
        pagination += `<li class="next ${totalPage === endPage ? 'disabled' : ''}"><a href="#" onclick="changePage(\'${search_section}\',${endPage + 1})">Next</a></li>`;
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
        let today = new Date();
        let no_search_result =
            `<section class="search-result">                    
                    <div class="search_head search_none" id="no_search_result_${search_section}">
                        <div class="search_title">
                            <span style="font-size: 13px; color:#a4c6ff;">
                                <span role="img" aria-label=":sparkles:" title=":sparkles:" style="background-color: transparent; display: inline-block; vertical-align: middle;">
                                    <img src="http://www.313.co.kr/arms/img/bestqulity.png" alt=":sparkles:" width="15" height="15" class="CToWUd" data-bit="iit" style="margin: 0px; padding: 0px; border: 0px; display: block; max-width: 100%; height: auto;">
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
            console.log("[searchApiModule :: appendSearchResultSections] :: search_result_arr길이 =>" +search_result_arr.length);
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

                    $("#jiraissue_section .search_result_group .search_result_items").append(
                        `<section class="search-result" data-toggle="modal" data-target="#search_detail_modal_jiraissue" data-backdrop="false">
                            <div class="search_head" id="hits_order_jiraissue_${index}">
                                <div class="search_title">
                                    <span style="font-size: 13px; color:#a4c6ff;">
                                        <span role="img" aria-label=":sparkles:" title=":sparkles:" style="background-color: transparent; display: inline-block; vertical-align: middle;">
                                            <img src="http://www.313.co.kr/arms/img/bestqulity.png" alt=":sparkles:" width="15" height="15" class="CToWUd" data-bit="iit" style="margin: 0px; padding: 0px; border: 0px; display: block; max-width: 100%; height: auto;">
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
                                        <small>${content["content"]["created"]}</small>
                                    </p>
                                </div>
                            </div>
                            <div class="search_content" style="height: 4rem; line-height: 1.58;  overflow: hidden;">
                                <span> 
                                    ${highlightFields_string}                        
                                </span>
                                <span>                                
                                </br>&nbsp; 이슈 : ${issue_key} &nbsp;&nbsp; 지라프로젝트: ${jiraproject_name} </br>                                															
                                &nbsp; 타임스탬프: ${content["content"]["timestamp"]}
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
            console.log("[searchApiModule :: appendSearchResultSections_fluentd] :: search_result_arr길이 =>" +search_result_arr.length);

            if(search_result_arr && search_result_arr.length !== 0) {
                search_result_arr.forEach(function (content, index) {
                    var highlight_stringify = "";
                    if(content["highlightFields"]) {
                        highlight_stringify = JSON.stringify(content["highlightFields"], undefined, 4);
                    }
                    let highlightFields_string = (highlight_stringify === "" ? content["content"]["log"] : highlight_stringify);
                    $("#log_section .search_result_group .search_result_items").append(
                        `<section class="search-result" data-toggle="modal" data-target="#search_detail_modal_log" data-backdrop="false">
                            <div class="search_head" id="hits_order_log_${index}">
                                <div class="search_title">
                                    <span style="font-size: 13px; color:#a4c6ff;">
                                        <span role="img" aria-label=":sparkles:" title=":sparkles:" style="background-color: transparent; display: inline-block; vertical-align: middle;">
                                            <img src="http://www.313.co.kr/arms/img/bestqulity.png" alt=":sparkles:" width="15" height="15" class="CToWUd" data-bit="iit" style="margin: 0px; padding: 0px; border: 0px; display: block; max-width: 100%; height: auto;">
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
                                        <small>${content["content"]["timestamp"]}</small>
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
        pagination += `<li class="prev ${current_page === 1 ? 'disabled' : ''}"><a href="#" onclick="changePage('${search_section}', ${Math.max(startPage - 10, 1)})">Prev</a></li>`;
        for (let i = startPage; i <= endPage; i++) {
            pagination += `<li class="${current_page === i ? 'active' : ''} page-num-${i}"><a href="#" onclick="changePage('${search_section}', ${i})">${i}</a></li>`;
        }
        pagination += `<li class="next ${current_page === total_page ? 'disabled' : ''}"><a href="#" onclick="changePage('${search_section}', ${Math.min(endPage + 1, total_page)})">Next</a></li>`;
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
            $("#search_detail_modal_jiraissue #detail_id_jiraissue").text(targetData["id"]);
            $("#search_detail_modal_jiraissue #detail_index_jiraissue").text(targetData["index"]);
            $("#search_detail_modal_jiraissue #detail_score_jiraissue").text(targetData["score"] === null ? " - " : (targetData["score"] !== NaN ? targetData["score"]: " - " ));
            $("#search_detail_modal_jiraissue #detail_type_jiraissue").text(targetData["type"] === undefined ? " - " : targetData["type"]);
            $("#search_detail_modal_jiraissue #detail_modal_summary_jiraissue").text(targetData["content"]["summary"]);
            $("#search_detail_modal_jiraissue #detail_modal_key_jiraissue").text(targetData["content"]["key"]);
            $("#search_detail_modal_jiraissue #detail_modal_key_jiraissue").text(targetData["content"]["created"]);
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
            $("#search_detail_modal_log #detail_id_log").text(targetData["id"]);
            $("#search_detail_modal_log #detail_index_log").text(targetData["index"]);
            $("#search_detail_modal_log #detail_score_log").text(targetData["score"] === null ? " - " : (targetData["score"] !== NaN ? targetData["score"]: " - " ));
            $("#search_detail_modal_log #detail_type_log").text(targetData["type"] === undefined ? " - " : targetData["type"]);

            $("#search_detail_modal_log #detail_modal_logname_log").text(targetData["content"]["logName"]);
            $("#search_detail_modal_log #detail_modal_timestamp_log").text(targetData["content"]["timestamp"]);
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
        setSearchResult, getSearchResult, getHitsTotal,
        updateButtons,
        getSearchResultDetail,
        changePage,
        mapDataToModal
    }
})(); //즉시실행 함수
