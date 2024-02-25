var SearchApiModule = (function () {
    "use strict";
    var searchResult = {
        "jiraissue" : null,
        "fluentd" : null
    };

    let items_per_page=10; //페이지별 아이템 갯수. 기본값 10으로 설정

    // 검색한 자료 세팅
    var setItemsPerPage = function (items_per_page) {
        items_per_page = +items_per_page;
        return items_per_page;
    };

    var setSearchResult = function(search_section, search_results, current_page, items_per_Page) {
        if(search_section) {
            searchResult[search_section] = search_results;
            paginateAndDisplayData(search_section, current_page,items_per_Page);
        } else {
            console.log("[searchApiModule :: setSearchResult] ::: search_section 없습니다.");
        }
    };

    var getSearchResult = function(search_section) {
        return searchResult[search_section];
    };

    // 클릭 했을 때, 모달 띄우기 위한 자료.
    var getSearchResultDetail = function (search_section, order) {
        console.log("[searchApiModule :: getSearchResultDetail] :: search_section -> " + search_section + ", order ->" + order);
        return searchResult[search_section][order];
    };
    var paginateAndDisplayData = function (search_section, currentPage, itemsPerPage) {
        const data = getSearchResult(search_section);
        let items_per_page = setItemsPerPage(itemsPerPage);
        // 현재 페이지에서 보여줄 데이터 추출
        const startIndex = (currentPage - 1) * items_per_page;
        const endIndex = startIndex + items_per_page;
        const currentPageData = data.slice(startIndex, endIndex);
        console.log("startIndex : " + startIndex);  console.log("endIndex : " + endIndex);
        console.log(currentPageData);
        // 페이징된 데이터를 화면에 표시
        displayData(search_section, currentPageData, currentPage, items_per_page);

        const totalPage = Math.ceil(data.length / items_per_page);
        const countPageBlock = 10; // 페이지블록 수 (한번에 보여줄 페이지 수)

        let startPage = ((currentPage-1) / 10) * 10 + 1;
        let endPage = startPage + countPageBlock -1;

        if (totalPage < currentPage) {
            currentPage = totalPage;
        }
        if (endPage > totalPage) {
            endPage = totalPage;
        }

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

    var displayData = function (search_section, currentPageData, startIndex, endIndex) {
        console.log("[searchApiModule :: displayData] :: search_section -> " + search_section +", startIndex-> " + startIndex);
        // 데이터를 화면에 표시하는 코드 작성
        let search_result_arr = currentPageData;
        let today = new Date();
        let no_search_result =
            `<section class="search-result">
                    <!-- 검색 결과 생성 시, append 하는 방식 -->
                    <div class="search_head search_none">
                        <div class="search_title">
                            <span style="font-size: 13px; color:#a4c6ff;">
                                <span role="img" aria-label=":sparkles:" title=":sparkles:" style="background-color: transparent; display: inline-block; vertical-align: middle;">
                                    <img src="http://www.313.co.kr/arms/img/bestqulity.png" alt=":sparkles:" width="15" height="15" class="CToWUd" data-bit="iit" style="margin: 0px; padding: 0px; border: 0px; display: block; max-width: 100%; height: auto;">
                                </span>                                
                                &nbsp; 검색 결과가 없습니다. &nbsp;
                            </span>
                        </div>
                        <div class="search_category">
                            <p class="text-muted" style="margin: 5px 0;">
                                <!--<small>카테고리 fluentd-20240204</small>-->
                                <small> - </small>
                            </p>
                            <p class="text-success" style="margin: 5px 0;">
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
                    let 순서 = startIndex+index;
                    $("#jiraissue_section .search_result_group .search_result_items").append(
                        `<section class="search-result">
                            <div class="search_head" id="hits_order_jiraissue_${순서}" data-toggle="modal" data-target="#search_detail_modal_jiraissue" data-backdrop="false">
                                <div class="search_title">
                                    <span style="font-size: 13px; color:#a4c6ff;">
                                        <span role="img" aria-label=":sparkles:" title=":sparkles:" style="background-color: transparent; display: inline-block; vertical-align: middle;">
                                            <img src="http://www.313.co.kr/arms/img/bestqulity.png" alt=":sparkles:" width="15" height="15" class="CToWUd" data-bit="iit" style="margin: 0px; padding: 0px; border: 0px; display: block; max-width: 100%; height: auto;">
                                        </span>
                                        <!-- 지라이슈 summary 나오도록 -->
                                        &nbsp;${content["content"]["summary"]}							
                                    </span>
                                </div>
                                <div class="search_category">
                                    <p class="text-muted" style="margin: 5px 0;">
                                        <!--<small>카테고리 fluentd-20240204</small>-->
                                        <small>${content["index"]}</small>
                                    </p>
                                    <p class="text-success" style="margin: 5px 0;">
                                        <small>${content["content"]["created"]}</small>
                                    </p>
                                </div>
                            </div>
                            <div class="search_content" style="height: 4rem; line-height: 1.58;  overflow: hidden;">
                                <span>
                                이슈키: ${content["content"]["key"]} &nbsp;&nbsp; 지라프로젝트: ${content["content"]["project"]["project_name"]} </br>
                                생성일: ${content["content"]["created"]} &nbsp;&nbsp;															
                                타임스탬프: ${content["content"]["timestamp"]}
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
            console.log(search_result_arr);
            if(search_result_arr && search_result_arr.length !== 0) {
                search_result_arr.forEach(function (content, index) {
                    let 순서 = startIndex+index;
                    $("#log_section .search_result_group .search_result_items").append(
                        `<section class="search-result">
                            <div class="search_head" id="hits_order_log_${순서}" data-toggle="modal" data-target="#search_detail_modal_log" data-backdrop="false">
                                <div class="search_title">
                                    <span style="font-size: 13px; color:#a4c6ff;">
                                        <span role="img" aria-label=":sparkles:" title=":sparkles:" style="background-color: transparent; display: inline-block; vertical-align: middle;">
                                            <img src="http://www.313.co.kr/arms/img/bestqulity.png" alt=":sparkles:" width="15" height="15" class="CToWUd" data-bit="iit" style="margin: 0px; padding: 0px; border: 0px; display: block; max-width: 100%; height: auto;">
                                        </span>
                                        <!-- 로그네임 표시 -->
                                        &nbsp;${content["content"]["logName"]}							
                                    </span>
                                </div>
                                <div class="search_category">
                                    <p class="text-muted" style="margin: 5px 0;">                                        
                                        <small>${content["index"]}</small>
                                    </p>
                                    <p class="text-success" style="margin: 5px 0;">
                                        <small>${content["content"]["timestamp"]}</small>
                                    </p>
                                </div>
                            </div>
                            <div class="search_content" style="height: 4rem; line-height: 1.58;  overflow: hidden;">
                                <span>
                                ${content["content"]["log"]}
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

    var changePage = function (search_section, page) { // 11페이지가 나오면.
        const current_page = page;

        const startIndex = (current_page - 1) * items_per_page;
        const endIndex = startIndex + items_per_page;

        console.log("[searchApiModule :: changePage] :: startIndex -> " + startIndex+ ", endIndex -> " +endIndex);
        const currentPageData = getSearchResult(search_section).slice(startIndex, endIndex);
        console.log("[searchApiModule :: changePage] :: currentPageData => ");
        console.log(currentPageData);
        displayData(search_section, currentPageData, startIndex, endIndex);
        updateButtons(search_section, current_page);
    };

    var updateButtons = function(search_section, current_page) {
        console.log("updateButtons :: current_page => " + current_page);
        const total_page = Math.ceil(getSearchResult(search_section).length / items_per_page);
        const $pagination = $('#'+search_section+'_section .pagination-div .pagination');
        const $prevButton = $('#'+search_section+'_section .pagination-div .pagination .prev');
        const $nextButton = $('#'+search_section+'_section .pagination-div .pagination .next');
        const countPageBlock = 10;

        let startPage = ((current_page-1) / 10) * 10 + 1;
        let endPage = startPage + countPageBlock -1;

        if (total_page < current_page) {
            current_page = total_page;
        }
        if (endPage > total_page) {
            endPage = total_page;
        }

        // 만약 current_page가 11, 21, 31, 41, 51 이면 해당 페이지를 누를 당시, prev ~ next가 갱신(next를 누른 것) - 첫번째 블록이 아니면서 첫째페이지
        if( ((current_page % 10) === 1 && (current_page / 10) !== 0)) {
            let pagination = '';
            pagination += '<ul class="pagination">';
            pagination += `<li class="prev ${current_page === 1 ? 'disabled' : ''}"><a href="#" onclick="changePage(\'${search_section}\',${startPage - 1})">Prev</a></li>`;
            for (let i = current_page; i <= endPage; i++) {
                pagination += `<li class="${current_page === i ? 'active' : ''} page-num-${i}"><a href="#" onclick="changePage(\'${search_section}\',${i})">${i}</a></li>`;
            }
            pagination += `<li class="next ${current_page === endPage ? 'disabled' : ''}"><a href="#" onclick="changePage(\'${search_section}\',${endPage + 1})">Next</a></li>`;
            pagination += '</ul>';
            let pagination_spot = '#'+search_section+'_section'+' .pagination-div';
            console.log(pagination);
            $(pagination_spot).html("");
            $(pagination_spot).html(pagination);
        }

        // 만약 current_page가 10, 20, 30, 40, 50 이면 해당 페이지를 누를 당시, prev ~ next가 갱신(prev를 누르거나 해당 블록의 endpage를 누른것) - 첫번재 블록이 아니면서 마지막페이지 or next 버튼
        if ((current_page % 10) === 0) {
            let 시작지점 = (current_page < 10 ? 1 : current_page - 9);
            let pagination = '';
            pagination += '<ul class="pagination">';
            pagination += `<li class="prev ${current_page === 1 ? 'disabled' : ''}"><a href="#" onclick="changePage(\'${search_section}\',${startPage - 1})">Prev</a></li>`;
            for (let i = 시작지점; i <= current_page; i++) {
                pagination += `<li class="${current_page === i ? 'active' : ''} page-num-${i}"><a href="#" onclick="changePage(\'${search_section}\',${i})">${i}</a></li>`;
            }
            pagination += `<li class="next ${current_page === endPage ? 'disabled' : ''}"><a href="#" onclick="changePage(\'${search_section}\',${endPage + 1})">Next</a></li>`;
            pagination += '</ul>';
            let pagination_spot = '#'+search_section+'_section'+' .pagination-div';
            $(pagination_spot).html("");
            $(pagination_spot).html(pagination);
        }

        if (startPage === 0) {
            $prevButton.addClass('disabled');
        } else {
            $prevButton.removeClass('disabled');
        }

        if (current_page === total_page) {
            $nextButton.addClass('disabled');
        } else {
            $nextButton.removeClass('disabled');
        }

        // 이전에 선택된 페이지 요소에서 'active' 클래스 제거
        $pagination.find('.active').removeClass('active');
        // 선택된 페이지 번호에 해당하는 요소에 'active' 클래스 추가
        $pagination.find('.page-num-' + current_page).addClass('active');
    }
    var mapDataToModal = function (search_section, order) {
        const targetData = SearchApiModule.getSearchResultDetail(search_section,order);
        console.log("[searchApiModule :: mapDataToModal] :: targetData => "); console.log(targetData);

        if(search_section === "jiraissue") {
            $("#search_detail_modal_jiraissue #detail_id_jiraissue").text(targetData["id"]);
            $("#search_detail_modal_jiraissue #detail_index_jiraissue").text(targetData["index"]);
            $("#search_detail_modal_jiraissue #detail_score_jiraissue").text(targetData["score"] === null ? "-" : targetData["score"]);
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
            CKEDITOR.instances.modal_detail_log_jiraissue.setData(JSON.stringify(targetData));
        }
        else if (search_section === "log") {
            $("#search_detail_modal_log #detail_id_log").text(targetData["id"]);
            $("#search_detail_modal_log #detail_index_log").text(targetData["index"]);
            $("#search_detail_modal_log #detail_score_log").text(targetData["score"] === null ? "-" : targetData["score"]);
            $("#search_detail_modal_log #detail_type_log").text(targetData["type"] === undefined ? " - " : targetData["type"]);

            $("#search_detail_modal_log #detail_modal_logname_log").text(targetData["content"]["logName"]);
            $("#search_detail_modal_log #detail_modal_timestamp_log").text(targetData["content"]["timestamp"]);
            $("#search_detail_modal_log #detail_modal_source_log").text(targetData["content"]["source"]);
            $("#search_detail_modal_log #detail_modal_container_id_log").text(targetData["content"]["container_id"] === null? "-" : targetData["content"]["container_id"].substring(0,12));
            $("#search_detail_modal_log #detail_modal_container_name_log").text(targetData["content"]["container_name"]);

            CKEDITOR.instances.modal_detail_log_log.setData(JSON.stringify(targetData["content"]["log"]));
        }
    };

    return {
        setSearchResult,
        getSearchResult,
        getSearchResultDetail,
        paginateAndDisplayData,
        displayData,
        changePage,
        mapDataToModal
    }
})(); //즉시실행 함수