(function($) {
    $.fn.extend({
        tablePlugin: function(options) {
            let table = this;
            let settings = {
                'resize': true,
                'filter': true,
                'sorter': true,
                'pager': true,
                'widgetOptions': {
                    'filterInput': '#devicefilter',
                    'sorterHeader': '.thead-sorter',
                    'pagerSelectors': {
                        'container': '.pager',
                        'first': '.pager-first',
                        'prev': '.pager-prev',
                        'next': '.pager-next',
                        'last': '.pager-last',
                        'pageDisplay': '.pager-pagedisplay',
                        'pageSize': '.pagesize',
                        'gotoPage': '.gotoPage'
                    },
                    'pagerSize': 10,
                    'pagerOutput': '{currentPage} / {allPage}'
                }
            };
            if (options === 'tableUpdate') {
                if (settings['pager']) pagerConnect(table);
            } else {
                settings = $.extend(settings, options);
                if (settings['resize']) resizeConnect(table);
                if (settings['filter']) filterConnect(table);
                if (settings['sorter']) sorterConnect(table);
                if (settings['pager']) pagerConnect(table);
            }
            function resizeConnect(table) {
                if (!table.hasClass('table-header-resize')) console.error('table no current class');
                if ($('style#table-header-resize-style').length == 0) {
                    let css = '.table-header-resize .resize-header {';
                        css += 'position: absolute;';
                        css += 'width: 10px; height: 100%;';
                        css += 'top: 0; right: -5px;';
                        css += 'cursor: col-resize; z-index: 3;';
                        css += 'user-select: none; -moz-user-select: none;';
                        css += '}';
                        css += '.table-header-resize .resize-header.click {';
                        css += 'background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAICAYAAADeM14FAAAAIElEQVQImaXMoQEAAAiAMP5/elaDTeICQaUCnbC74fkY5ANnmaGztV4AAAAASUVORK5CYII=");';
                        css += 'background-repeat: no-repeat repeat; background-position: center;';
                        css += '}';
                        css += '.table-header-resize .resize-td-ellipsis {';
                        css += 'max-width: 0; overflow: hidden;';
                        css += 'text-overflow: ellipsis; white-space: nowrap;';
                        css += '}';
                    let head = document.head || document.getElementsByTagName('head')[0];
                    let style = document.createElement('style');
                    style.type = 'text/css';
                    style.id = 'table-header-resize-style';
                    if (style.styleSheet){ // This is required for IE8 and below.
                        style.styleSheet.cssText = css;
                    } else {
                        style.appendChild(document.createTextNode(css));
                    }
                    head.appendChild(style);
                }
                let dragging = null;
                let mousePos = null;
                let ths = $('thead th', table);
                for (let j = 0, k = ths.length; j < k; j++) {
                    let th = ths.eq(j);
                    th.css({
                        'position': 'relative',
                        'white-space': 'nowrap'
                    });
                    if (j != k - 1) {
                        let d = $('<div>').addClass('resize-header');
                        d.on('click', function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                        });
                        th.append(d);
                    }
                }
                let thead = $('thead', table);
                thead.on('mousedown', function (e) {
                    if($(e.target).hasClass('resize-header')) {
                        e.preventDefault();
                        e.stopPropagation();
                        dragging = $(e.target);
                        dragging.addClass('click');
                        mousePos = e.clientX;
                    }
                });
                thead.on('mousemove', function (e) {
                    if (!dragging) return false;
                    e.preventDefault();
                    e.stopPropagation();
                    let dis = (e.clientX - mousePos);
                    dragging.parent().outerWidth(dragging.parent().outerWidth() + dis);
                    dragging.parent().next().outerWidth(dragging.parent().next().outerWidth() - dis);
                    mousePos = e.clientX;
                });
                thead.on('mouseup', function (e) {
                    if (!dragging) return false;
                    e.preventDefault();
                    e.stopPropagation();
                    dragging.removeClass('click');
                    dragging = null;
                    mousePos = null;
                });
                thead.on('mouseleave', function (e) {
                    if (!dragging) return false;
                    e.preventDefault();
                    e.stopPropagation();
                    dragging.removeClass('click');
                    dragging.parent().outerWidth(dragging.parent().outerWidth());
                    dragging.parent().next().outerWidth(dragging.parent().next().outerWidth());
                    dragging = null;
                    mousePos = null;
                });
            }
            function filterConnect(table) {
                if (!table.hasClass('table-data-filter')) console.error('table no current class');
                if ($('style#table-data-filter-style').length == 0) {
                    let css = '.table-data-filter .filtered { display: none !important; }';
                    let head = document.head || document.getElementsByTagName('head')[0];
                    let style = document.createElement('style');
                    style.type = 'text/css';
                    style.id = 'table-data-filter-style';
                    if (style.styleSheet){ // This is required for IE8 and below.
                        style.styleSheet.cssText = css;
                    } else {
                        style.appendChild(document.createTextNode(css));
                    }
                    head.appendChild(style);
                }
                let _row = {
                    'CheckBox': 0, 'Status': 1, 'ModelName': 2, 'DeviceName': 3,
                    'IPAddress': 4, 'DeviceMAC': 5, 'LastUpdateTime': 6, 'Operation-m': 7,
                    'NowPlaying': 0, 'PackageName': 1, 'TaskStatus': 2, 'Operation-s': 3
                };
                let input = $(settings['widgetOptions']['filterInput']);
                input.on('keyup', function (e) {
                    let mValue = this.value;
                    if (mValue.length > 3) {
                        if (/\./.test(mValue)) {
                            let trs = $('tr', table);
                            trs.removeClass('filtered');
                            for (let i = 1; i < trs.length; i+=2) {
                                let td_ip = trs.eq(i).find('td').eq(_row['IPAddress']);
                                if (!new RegExp(mValue).test(td_ip.html())) {
                                    trs.eq(i).addClass('filtered');
                                    trs.eq(i+1).addClass('filtered');
                                }
                            }
                        } else {
                            let trs = $('tr', table);
                            trs.removeClass('filtered');
                            for (let i = 1; i < trs.length; i+=2) {
                                let td_mac = trs.eq(i).find('td').eq(_row['DeviceMAC']);
                                if (!new RegExp(mValue).test(td_mac.html())) {
                                    trs.eq(i).addClass('filtered');
                                    trs.eq(i+1).addClass('filtered');
                                }
                            }
                        }
                    } else {
                        $('tr', table).removeClass('filtered');
                    }
                });
            }
            function sorterConnect(table) {
                if (!table.hasClass('table-data-sorter')) console.error('table no current class');
                if ($('style#table-data-sorter-style').length == 0) {
                    let css = '.table-data-sorter .thead-sorter {';
                        css += 'cursor: pointer;';
                        css += '}';
                        css += '.table-data-sorter .thead-sorter::after {';
                        css += 'content: "";';
                        css += 'padding-right: 15px;';
                        css += 'background-image: url(data:image/gif;base64,R0lGODlhFQAJAIAAACMtMP///yH5BAEAAAEALAAAAAAVAAkAAAIXjI+AywnaYnhUMoqt3gZXPmVg94yJVQAAOw==);';
                        css += 'background-repeat: no-repeat;';
                        css += 'background-position: center;';
                        css += '}';
                        css += '.table-data-sorter .thead-sorter.thead-sorter-Asc::after {';
                        css += 'background-image: url(data:image/gif;base64,R0lGODlhFQAEAIAAACMtMP///yH5BAEAAAEALAAAAAAVAAQAAAINjI8Bya2wnINUMopZAQA7);';
                        css += '}';
                        css += '.table-data-sorter .thead-sorter.thead-sorter-Desc::after {';
                        css += 'background-image: url(data:image/gif;base64,R0lGODlhFQAEAIAAACMtMP///yH5BAEAAAEALAAAAAAVAAQAAAINjB+gC+jP2ptn0WskLQA7);';
                        css += '}';
                    let head = document.head || document.getElementsByTagName('head')[0];
                    let style = document.createElement('style');
                    style.type = 'text/css';
                    style.id = 'table-data-sorter-style';
                    if (style.styleSheet){ // This is required for IE8 and below.
                        style.styleSheet.cssText = css;
                    } else {
                        style.appendChild(document.createTextNode(css));
                    }
                    head.appendChild(style);
                }
                let ths = $('thead th.thead-sorter', table);
                ths.on('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    let target = $(e.currentTarget);
                    let idx = $('thead th', table).index(target);
                    let tbs = $('tbody tr', table);
                    let tarr = [];
                    for (let i = 0, j = 0; i < tbs.length; i+=2, j++) {
                        tarr.push([tbs.eq(j*2+0), tbs.eq(j*2+1)]);
                    }
                    if (target.hasClass('thead-sorter-Asc')) {
                        target.removeClass('thead-sorter-Asc').addClass('thead-sorter-Desc');
                        if (/sorter-data-([^\s]*)/.test(target.attr('class'))) {
                            let mKey = target.attr('class').match(/sorter-(data-[^\s]*)/)[1];
                            tarr.sort(function (a, b) {
                                let mVal_a = a[0].find('td').eq(idx).attr(mKey);
                                let mVal_b = b[0].find('td').eq(idx).attr(mKey);
                                return mVal_b.localeCompare(mVal_a);
                            });
                        } else {
                            tarr.sort(function (a, b) {
                                let mVal_a = a[0].find('td').eq(idx).text();
                                let mVal_b = b[0].find('td').eq(idx).text();
                                return mVal_b.localeCompare(mVal_a);
                            });
                        }
                    } else if (target.hasClass('thead-sorter-Desc')) {
                        target.removeClass('thead-sorter-Desc').addClass('thead-sorter-Asc');
                        if (/sorter-data-([^\s]*)/.test(target.attr('class'))) {
                            let mKey = target.attr('class').match(/sorter-(data-[^\s]*)/)[1];
                            tarr.sort(function (a, b) {
                                let mVal_a = a[0].find('td').eq(idx).attr(mKey);
                                let mVal_b = b[0].find('td').eq(idx).attr(mKey);
                                return mVal_a.localeCompare(mVal_b);
                            });
                        } else {
                            tarr.sort(function (a, b) {
                                let mVal_a = a[0].find('td').eq(idx).text();
                                let mVal_b = b[0].find('td').eq(idx).text();
                                return mVal_a.localeCompare(mVal_b);
                            });
                        }
                    } else {
                        ths.removeClass('thead-sorter-Asc').removeClass('thead-sorter-Desc');
                        target.addClass('thead-sorter-Asc');
                        if (/sorter-data-([^\s]*)/.test(target.attr('class'))) {
                            let mKey = target.attr('class').match(/sorter-(data-[^\s]*)/)[1];
                            tarr.sort(function (a, b) {
                                let mVal_a = a[0].find('td').eq(idx).attr(mKey);
                                let mVal_b = b[0].find('td').eq(idx).attr(mKey);
                                return mVal_a.localeCompare(mVal_b);
                            });
                        } else {
                            tarr.sort(function (a, b) {
                                let mVal_a = a[0].find('td').eq(idx).text();
                                let mVal_b = b[0].find('td').eq(idx).text();
                                return mVal_a.localeCompare(mVal_b);
                            });
                        }
                    }
                    $('tbody', table).append([].concat.apply([], tarr));
                });
            }
            function pagerConnect(table) {
                if (!table.hasClass('table-data-pager')) console.error('table no current class');
                if ($('style#table-data-pager-style').length == 0) {
                    let css = '.table-data-pager .pagered { display: none;';
                        css += '}';
                    let head = document.head || document.getElementsByTagName('head')[0];
                    let style = document.createElement('style');
                    style.type = 'text/css';
                    style.id = 'table-data-pager-style';
                    if (style.styleSheet){ // This is required for IE8 and below.
                        style.styleSheet.cssText = css;
                    } else {
                        style.appendChild(document.createTextNode(css));
                    }
                    head.appendChild(style);
                }
                let inputs = $(settings['widgetOptions']['pagerSelectors']['container']);
                let currentPage = 1;
                let tbs = $('tbody tr', table);
                if (tbs.length == 0) return console.log('Data table need update.');
                let allPage = Math.round(tbs.length / 2 / settings['widgetOptions']['pagerSize']) + 1;
                dataBind();
                function dataBind() {
                    if (allPage == 1) {
                        tbs.removeClass('pagered');
                        inputBind('disable');
                        displayBind();
                    } else {
                        tbs.addClass('pagered');
                        let start = (currentPage - 1) * settings['widgetOptions']['pagerSize'] * 2;
                        let end =  currentPage * settings['widgetOptions']['pagerSize'] * 2;
                        console.log(tbs);
                        console.log(currentPage, allPage, start, end);
                        tbs.slice(start, end).removeClass('pagered');
                        inputBind();
                        displayBind();
                    }
                }
                function inputBind(params) {
                    $(settings['widgetOptions']['pagerSelectors']['first'], inputs).off('click');
                    $(settings['widgetOptions']['pagerSelectors']['prev'], inputs).off('click');
                    $(settings['widgetOptions']['pagerSelectors']['next'], inputs).off('click');
                    $(settings['widgetOptions']['pagerSelectors']['last'], inputs).off('click');
                    if (params === 'disable') {
                        $(settings['widgetOptions']['pagerSelectors']['first'], inputs).addClass('disabled');
                        $(settings['widgetOptions']['pagerSelectors']['prev'], inputs).addClass('disabled');
                        $(settings['widgetOptions']['pagerSelectors']['next'], inputs).addClass('disabled');
                        $(settings['widgetOptions']['pagerSelectors']['last'], inputs).addClass('disabled');
                    } else {
                        if (currentPage == 1) {
                            $(settings['widgetOptions']['pagerSelectors']['first'], inputs).addClass('disabled');
                            $(settings['widgetOptions']['pagerSelectors']['prev'], inputs).addClass('disabled');
                            $(settings['widgetOptions']['pagerSelectors']['next'], inputs).removeClass('disabled');
                            $(settings['widgetOptions']['pagerSelectors']['last'], inputs).removeClass('disabled');
                        } else if (currentPage == allPage) {
                            $(settings['widgetOptions']['pagerSelectors']['first'], inputs).removeClass('disabled');
                            $(settings['widgetOptions']['pagerSelectors']['prev'], inputs).removeClass('disabled');
                            $(settings['widgetOptions']['pagerSelectors']['next'], inputs).addClass('disabled');
                            $(settings['widgetOptions']['pagerSelectors']['last'], inputs).addClass('disabled');
                        } else {
                            $(settings['widgetOptions']['pagerSelectors']['first'], inputs).removeClass('disabled');
                            $(settings['widgetOptions']['pagerSelectors']['prev'], inputs).removeClass('disabled');
                            $(settings['widgetOptions']['pagerSelectors']['next'], inputs).removeClass('disabled');
                            $(settings['widgetOptions']['pagerSelectors']['last'], inputs).removeClass('disabled');
                        }

                        $(settings['widgetOptions']['pagerSelectors']['first'], inputs).on('click', function (e) {
                            currentPage = 1;
                            $(settings['widgetOptions']['pagerSelectors']['first'], inputs).addClass('disabled');
                            $(settings['widgetOptions']['pagerSelectors']['prev'], inputs).addClass('disabled');
                            $(settings['widgetOptions']['pagerSelectors']['next'], inputs).removeClass('disabled');
                            $(settings['widgetOptions']['pagerSelectors']['last'], inputs).removeClass('disabled');
                            dataBind();
                        });
                        $(settings['widgetOptions']['pagerSelectors']['prev'], inputs).on('click', function (e) {
                            if (currentPage > 1) {
                                currentPage = currentPage - 1;
                                if (currentPage == 1) {
                                    $(settings['widgetOptions']['pagerSelectors']['first'], inputs).addClass('disabled');
                                    $(settings['widgetOptions']['pagerSelectors']['prev'], inputs).addClass('disabled');
                                } else {
                                    $(settings['widgetOptions']['pagerSelectors']['first'], inputs).removeClass('disabled');
                                    $(settings['widgetOptions']['pagerSelectors']['prev'], inputs).removeClass('disabled');
                                }
                                $(settings['widgetOptions']['pagerSelectors']['next'], inputs).removeClass('disabled');
                                $(settings['widgetOptions']['pagerSelectors']['last'], inputs).removeClass('disabled');
                                dataBind();
                            }
                        });
                        $(settings['widgetOptions']['pagerSelectors']['next'], inputs).on('click', function (e) {
                            if (currentPage < allPage) {
                                currentPage = currentPage + 1;
                                $(settings['widgetOptions']['pagerSelectors']['first'], inputs).removeClass('disabled');
                                $(settings['widgetOptions']['pagerSelectors']['prev'], inputs).removeClass('disabled');
                                if (currentPage == allPage) {
                                    $(settings['widgetOptions']['pagerSelectors']['next'], inputs).addClass('disabled');
                                    $(settings['widgetOptions']['pagerSelectors']['last'], inputs).addClass('disabled');
                                } else {
                                    $(settings['widgetOptions']['pagerSelectors']['next'], inputs).removeClass('disabled');
                                    $(settings['widgetOptions']['pagerSelectors']['last'], inputs).removeClass('disabled');
                                }
                                dataBind();
                            }
                        });
                        $(settings['widgetOptions']['pagerSelectors']['last'], inputs).on('click', function (e) {
                            currentPage = allPage;
                            $(settings['widgetOptions']['pagerSelectors']['first'], inputs).removeClass('disabled');
                            $(settings['widgetOptions']['pagerSelectors']['prev'], inputs).removeClass('disabled');
                            $(settings['widgetOptions']['pagerSelectors']['next'], inputs).addClass('disabled');
                            $(settings['widgetOptions']['pagerSelectors']['last'], inputs).addClass('disabled');
                            dataBind();
                        });
                    }
                }
                function displayBind() {
                    let display = settings['widgetOptions']['pagerOutput'];
                    display = display.replace('{currentPage}', currentPage).replace('{allPage}', allPage);
                    $(settings['widgetOptions']['pagerSelectors']['pageDisplay']).text(display);
                }
            }
            return this;
        }
     });
}(jQuery));