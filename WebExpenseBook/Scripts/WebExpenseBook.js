
$(function () {
    Pattern = '支出';
    //集計に関するスクリプト

    //日付から文字列に変換する関数
    function toLocaleString(date) {
        return [
            date.getFullYear(),
            ('0' + (date.getMonth() + 1)).slice(-2),
            ('0' + date.getDate()).slice(-2)
        ].join('-') + ' '
            + date.toLocaleTimeString();
    }
    function DateStarEnd(StartDate, EndDate) {
        StartDate.setHours(0);
        StartDate.setMinutes(0);
        StartDate.setSeconds(0);
        EndDate.setHours(23);
        EndDate.setMinutes(59);
        EndDate.setSeconds(59);
    }
    function GetTerm(TargetMonth) {
        var StartDate = new Date(TargetMonth);
        StartDate.setDate(1);
        var EndDate = TargetMonth;
        EndDate.setMonth(EndDate.getMonth() + 1);
        EndDate.setDate(0);
        DateStarEnd(StartDate, EndDate);
        //開始終了の保存
        $('#webCalcStart').val(toLocaleString(StartDate));
        $('#webCalcEnd').val(toLocaleString(EndDate));
        return TargetMonth.getFullYear() + '年' + (TargetMonth.getMonth() + 1) + '月度';
    }

    //保存してある日付でデータを取得
    function GetInitalData() {
        //勘定科目の羅列
        //Ajax で転送し、返事をもらう
        //Jonsonデータを作成
        var data = { Depth: 0, StartDate: new Date($('#webCalcStart').val()), EndDate: new Date($('#webCalcEnd').val()), Pattern: Pattern };
        $.ajax(
            {
                url: '/Home/JsonGetCategoryPrice',
                type: 'POST',
                data: JSON.stringify(data),   // JSONの文字列に変換,   // Depthを取得
                contentType: 'application/json',    // content-typeをJSONに指定する
                error: function () { },
                complete: function (data) {
                    var result = eval('(' + data.responseText + ')');
                    $('#webCalcTitleRow').after(CreateCategoryScreen(0, result));
                },
            })
    }

    //タブでのパネル切り替え時
    $('#webMonthlyTab').click(() => {
        //タブの切り替わり

        //デフォルトは今月
        var StartDate = new Date();
        $('#webCalculateMonth').attr('value', toLocaleString(StartDate).slice(0, 10));
        var res = GetTerm(StartDate);
        $('#webCalculateMonthText').val(res);
        GetInitalData();
    });
    function CreateCategoryScreen(Depth, CategoryList) {
        //
        var TargetID;
        var Hr;
        var Padding = '';
        var retHtml = "";
        var TotalPrice = 0;
        var IsTopCategory = Depth == 0;
        //col のパディングを作る
        for (var i = 0; i < Depth; i++)
            Padding += '・';
        //アイテムリストが来ることもある
        if (!IsTopCategory && 'ItemName' in CategoryList[0]) {
            var Count = CategoryList.length;
            //行を追加していく
            for (i = 0; i < Count; i++) {
                retHtml += '<div class="row web-top-rows" style="background-color:aquamarine" >' + Padding +
                    '<div class="col m-1"><span class="m-1"><button type = "button" class="btn btn-warning web-item-edit" web-ItemId="' + CategoryList[i].ItemId +
                    '" web-ItemName="' + CategoryList[i].ItemName + '" web-ItemDate="' + CategoryList[i].ItemDate +
                    '" web-ItemPrice="' + CategoryList[i].ItemPrice + '" web-editable-item-id="webEditableItem' + i + '" >修正</button ></span>' +
                    '<span class="m-1"><button type = "button" class="btn btn-warning web-item-delete" web-ItemId = "' + CategoryList[i].ItemId + '" ">削除</button></span>' +
                    '<label class="form-label ml-1">' +
                    CategoryList[i].ItemDate + '</label></div><div class="col m-1">' +
                    '<label class="form-label" id="webEditableItem' + i + '">' +
                    CategoryList[i].ItemName + '</label></div><div class="col-3 m-1">' +
                    '<input type="text" class="form-control" readonly="readonly" value="' +
                    CategoryList[i].ItemPrice.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' }) + '" />' +
                    '</div></div>';
            }
            return retHtml;
        }
        //区分の展開
        if (IsTopCategory) {
            //既存の行を削除
            Hr = '<hr class="web-top-hr" />';
            TargetID = 'webCalc';
            $('.web-top-rows').remove();
            $('.web-top-hr').remove();
        } else {
            TargetID = 'webDetail';
            Hr = '';
        }
        var Count = CategoryList.length;
        //行を追加していく
        for (i = 0; i < Count; i++) {
            retHtml += '<div class="row web-top-rows" style="background-color:aquamarine" >' + Padding +
                '<div class="col m-1"><button type="button" class="btn btn-primary web-make-detail" web-depth ="' + Depth +
                '" web-parent-name="' + CategoryList[i].ParentName + '" >' +
                CategoryList[i].CategoryName + '</button></div><div class="col-3 m-1">' +
                '<input type="text" class="form-control" readonly="readonly" value="' +
                CategoryList[i].CategotyPrice.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' }) + '" />' +
                '</div></div>' + Hr;
            if (IsTopCategory)
                TotalPrice += CategoryList[i].CategotyPrice;
        }
        if (IsTopCategory)
            $('#webTotalPrice').val(TotalPrice.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' }));
        return retHtml;
    }

    $('.web-selected-month').click(function () {
        var month = $(this).attr('month');
        var year = $('#webTargetYear').val();
        $('#webCalcStart').val(year + '-' + month + '-01');
        ChangeMonth(0);
    })
    $('#webCalculateMonthText').click(function () {
        $('#webTargetYear').val($('#webCalcStart').val().slice(0, 4));
        $('#webDateModal').modal('show');
    });
    $('#webLastMonth').click(function () {
        ChangeMonth(-1);
    });
    $('#webNextMonth').click(function () {
        ChangeMonth(1);
    });
    function ChangeMonth(t) {
        var td = new Date($('#webCalcStart').val());
        td.setMonth(td.getMonth() + t);
        $('#webCalculateMonth').attr('value', toLocaleString(td).slice(0, 10));
        $('#webCalculateMonth').change();
    }
    //
    $('#webCalculateMonth').change(() => {
        //現状の画面を初期化
        var $TopRow = $('webCalcTitleRow');
        $TopRow.siblings().remove();
        var CalcManth = new Date($('#webCalculateMonth').val());
        $('#webCalculateMonthText').val(GetTerm(CalcManth));
        //集計開始
        GetInitalData();

    });
    //勘定科目のボタンクリック
    $('body').on('click', '.web-make-detail', function () {
        var TargetCategory = $(this).text();
        var ParentName = $(this).attr('web-parent-name');
        $(this).removeClass('web-make-detail')
        var Depth = $(this).attr("web-depth");
        var $Target = $(this).closest('.row');
        Depth++;
        //Ajax で転送し、返事をもらう
        //Jonsonデータを作成
        var data = {
            Depth: Depth, TargetCategory: TargetCategory, ParentName: ParentName,
            StartDate: new Date($('#webCalcStart').val()), EndDate: new Date($('#webCalcEnd').val()), Pattern: Pattern
        };
        $.ajax(
            {
                url: '/Home/JsonGetCategoryPrice',
                type: 'POST',
                data: JSON.stringify(data),   // JSONの文字列に変換,   // Depthを取得
                contentType: 'application/json',    // content-typeをJSONに指定する
                error: function () { },
                complete: function (data) {
                    var result = eval('(' + data.responseText + ')');

                    $Target.after(CreateCategoryScreen(Depth, result));
                },
            })

    });
    //削除ボタン
    $('body').on('click', '.web-item-delete', function () {
        var ret = confirm("アイテムを削除します。よろしいですか？");
        if (!ret)
            return;
        var $Target = $(this).closest('.row');
        $Target.remove();
        //Ajax で転送し、返事をもらう
        //Jonsonデータを作成
        var data = { ItemId: $(this).attr("web-ItemId") };
        $.ajax(
            {
                url: '/Home/JsonDeleteItem',
                type: 'POST',
                data: JSON.stringify(data),   // JSONの文字列に変換,   // Depthを取得
                contentType: 'application/json',    // content-typeをJSONに指定する
                error: function () { alert('失敗しました') },
                complete: function (data) {
                    var result = eval('(' + data.responseText + ')');
                    alert('削除しました');
                    $('#webCalculateMonth').change();
                },
            })
    });
    //編集ボタン　
    $('body').on('click', '.web-item-edit', function () {
        $('#webRowMake').empty();
        $('#webUpdatingItem').val('#' + $(this).attr('web-editable-item-id'));
        //Ajax で転送し、返事をもらう
        //Jonsonデータを作成
        var param = {
            ItemId: $(this).attr("web-ItemId"), ItemName: $(this).attr("web-ItemName")
            , ItemDate: $(this).attr("web-ItemDate"), ItemPrice: $(this).attr("web-ItemPrice")
        };

        $.ajax(
            {
                url: '/Home/JsonEditItem',
                type: 'POST',
                data: JSON.stringify(param),   // JSONの文字列に変換,   // Depthを取得
                contentType: 'application/json',    // content-typeをJSONに指定する
                error: function () { alert('失敗しました'); },
                complete: function (data) {
                    var result = eval('(' + data.responseText + ')');
                    PrepairCategories(param, result);
                    $('#webItemModal').modal('show');
                },
            })
    });
    //モーダル作成
    function PrepairCategories(itemInfo, categoryList) {
        $('#webItemModal').find('input').removeClass('bg-warning');

        var length = categoryList.length;
        var html = "";
        for (var i = 0; i < length; i++) {
            html += '<div class="row"><div class="col web-require-strict"><label for="webCategoryNameEdit' + i +
                '" class="form-label web-require-strict">' + (i == 0 ? '勘定科目' : '区分') + '</label><input type="text" class="form-control web-require-strict" id="webCategoryNameEdit' + i +
                '" value="' + categoryList[i].CategoryName + '"></div></div>';
        }
        $('#webItemNameEdit').val(itemInfo.ItemName);
        $('#webItemPriceEdit').val(itemInfo.ItemPrice);
        var iDate = '' + itemInfo.ItemDate;
        iDate = iDate.replace(/\//g, '-');
        $('#webAvailableDateEdit').val(iDate);
        $('#webItemIdEdit').val(itemInfo.ItemId);
        $('#webRowMake').html(html);
    }
    //モーダルの更新ボタン
    $('#webItemUpdate').click(function () {
        var IsNullText = false;
        var categories = [];
        var i = 0;
        while ($('#webCategoryNameEdit' + i).length) {
            var $o = $('#webCategoryNameEdit' + i);
            var item = $o.val();
            if (item == "") {
                $o.addClass('bg-warning');
                IsNullText = true;
            } else
                categories.push({ Depth: i, CategoryName: item });
            i++;
        }
        var ItemId = $('#webItemIdEdit').val();

        var ItemName = IsNull($('#webItemNameEdit'));
        var ItemPrice = IsNull($('#webItemPriceEdit'));
        var ItemDate = IsNull($('#webAvailableDateEdit'));

        if (IsNullText || ItemName == "" || ItemPrice == "" || ItemDate == "") {
            alert('入力は必須です');
            return;
        }
        var param = {
            ItemId: ItemId, ItemName: ItemName, ItemPrice: ItemPrice, ItemDate: ItemDate
        };
        param.Category = categories;

        $.ajax(
            {
                url: '/Home/JsonUpdateItem',
                type: 'POST',
                data: JSON.stringify(param),   // JSONの文字列に変換,   // Depthを取得
                contentType: 'application/json',    // content-typeをJSONに指定する
                error: function () { alert('失敗しました'); },
                complete: function (data) {
                    var result = eval('(' + data.responseText + ')');
                    $('#webItemModal').modal('hide');
                    if (result == true) {
                        var ss = $('#webUpdatingItem').val();
                        $($('#webUpdatingItem').val()).text(param.ItemName);
                    } else {
                        $('#webCalculateMonth').change();
                    }
                },
            })
    });
    function IsNull($o) {
        if ($o.val() == "") {
            $o.addClass('bg-warning');
            return "";
        }
        $o.removeClass('bg-warning');
        return $o.val();
    }



    //入力に関するスクリプト

    //登録ボタン　→入力チェック・データ送信・クリア(とりあえず)
    $('#webItemRegister').click(function () {
        var IsNullText = false;
        $('.web-require').each((i, o) => {
            $(o).removeClass('bg-warning');
            if ($(o).val() == "" && $(o).hasClass('web-strict')) {
                $(o).addClass('bg-warning');
                IsNullText = true;
            }
        });
        if (IsNullText) {
            alert('入力は必須です');
            return;
        }
        //とりあえず金額だけ数値チェック
        try {

        }
        catch (e) {

        }
        finally {

        }
        //Item情報をJsonに入れて投げる
        var categories = [];
        var i = 0;
        while ($('#webCategoryD' + i).length)
            categories.push({ Depth: i, CategoryName: $('#webCategoryD' + i++).val() });
        var data = [];
        var data = {
            ItemName: $('#webMainItem').val(), ItemPrice: $('#webItemPrice').val(), ItemDate: $('#webAvailableDate').val(), Pattern: Pattern
        };
        data.Category = categories;
        //Ajax で転送し、返事をもらう
        $.ajax(
            {
                url: '/Home/JsonRegster',
                type: 'POST',
                data: JSON.stringify(data),   // JSONの文字列に変換
                contentType: 'application/json',    // content-typeをJSONに指定する
                error: function () { },
                complete: function (data) {
                    var result = eval('(' + data.responseText + ')');
                    ClearItemScreen(result);
                },
            })
    });
    function ClearItemScreen(CategoryList) {
        if (CategoryList != "") {
            var $TargetList = $('#webCategoryListD0').empty();
            //ドロップダウンリストの生成
            var Max = CategoryList.length;
            for (i = 0; i < Max; i++)
                $TargetList.append('<li><a class="dropdown-item web-is-item-text" web-item-text-target="webCategoryD0" href="#">' + CategoryList[i].CategoryName + '</a></li>')
        }

        var Depth = 1;
        //弟要素をすべて削除
        while ($('#webDiv' + Depth).length)
            $('#webDiv' + Depth++).remove();
        //アイテムを削除
        $('#webCategoryD0').val('');
        $('#webMainItem').val('');
        $('#webAvailableDate').val('');
        $('#webItemPrice').val('');
        $('.web-curb').text('false');
        $('#webItemRegister').attr('webEdittingDepth', '0');
        $('#webMainItemButton').text('候補無し').prop('disabled', true);
        $('#webMainItem').prop('disabled', true);
    };

    $('body').on('click', '.web-clear-btn', function () {
        ClearItemScreen("");
    });


    //onで処理を登録したら一度しか起動しなかったので、clickに戻した
    $('#webMainItemButton').click(function () {
        //品名の選択
        //区分情報をJSONで送信し、候補アイテムを取得する
        if ($('#webCategoryD0').val() == '')
            return;
        //Jonsonデータを作成
        var data = [];
        var i = 0;
        while ($('#webCategoryD' + i).length)
            data.push($('#webCategoryD' + i++).val());
        var LastDev = '#webDiv' + --i + ' li'
        //if ($(LastDev).length == 0) {
        //Ajax で転送し、返事をもらう
        $.ajax(
            {
                url: '/Home/JsonItem',
                type: 'POST',
                data: JSON.stringify(data),   // JSONの文字列に変換
                contentType: 'application/json',    // content-typeをJSONに指定する
                error: function () { },
                complete: function (data) {
                    var result = eval('(' + data.responseText + ')');
                    MakeItemDiv(result);

                },
            })
    });


    $('body').on('click', '.web-is-item-text, .web-commit-btn', function () {
        //テキストボックスに選択された値を代入
        var Target = '#' + $(this).attr('web-item-text-target');
        var Category;
        if ($(this).hasClass('web-commit-btn')) {
            //テキスト確定ボタンの場合、品名リストがからの時のみ起動する
            Category = $(Target).val();
        } else {
            Category = $(this).text();
            $(Target).val(Category);
        }
        var ParentName = $(Target).attr('web-parent-name') + Category;
        //区分情報をJSONで送信し、次の区分を取得する
        var Depth = Target.substr(13);
        if (Depth == "") {
            //品名の時は別の処理
            return;
        } else {
            //Jonsonデータを作成
            var para = {
                ParentName: ParentName, Depth: Depth, Pattern: Pattern
            };
            var i = 0;
            var data = [];
            while ($('#webCategoryD' + i).length)
                data.push($('#webCategoryD' + i++).val());
            para.items = data;
            //Ajax で転送し、返事をもらう
            $.ajax(
                {
                    url: '/Home/JsonCategory',
                    type: 'POST',
                    data: JSON.stringify(para),   // JSONの文字列に変換
                    contentType: 'application/json',    // content-typeをJSONに指定する
                    error: function () { console.log("何らかの理由で失敗しました"); },
                    complete: function (data) {
                        var result = eval('(' + data.responseText + ')');
                        if (Depth == 0)
                            $('#webDivEntry').html(MakeCategoryDiv(Depth, ParentName, result));
                        else
                            $('#webDiv' + Depth).after(MakeCategoryDiv(Depth, ParentName, result));

                    },
                })
        }
        $('.web-curb').text('true');
    });
    function MakeCategoryDiv(Depth, ParentName, CategoryList) {
        const IdBase = 'webDiv';
        Depth++;
        var CategoryId = 'webCategoryD' + Depth;
        $('#webItemRegister').attr('webEdittingDepth', Depth);
        //先に消しておく
        $('#' + IdBase + Depth).remove();
        var Max = CategoryList.Namelist.length;
        var NoItem = Max == 0 ? 'disabled>候補無し' : '>一覧から選ぶ';
        var HtmlText = '<div class="col" id="webDiv' + Depth + '"><label for="' + CategoryId +
            '" class="form-label web-require">区分</label><input type="search" class="form-control" id="' + CategoryId +
            '" placeholder="区分名" web-parent-name="' + ParentName + '"><div class="btn-group dropend"><button type="button"' +
            'class="btn btn-secondary dropdown-toggle web-dorop-items" data-toggle="dropdown" aria - expanded="false" ' +
            NoItem + '</button><ul class="dropdown-menu">';
        //ドロップダウンリストの生成
        for (i = 0; i < Max; i++) {
            HtmlText += '<li><a class="dropdown-item web-is-item-text" web-item-text-target="' + CategoryId +
                '" href="#">' + CategoryList.Namelist[i].CategoryName + '</a></li>';
        }
        HtmlText += '</ul><button type="button" class="btn btn-primary ml-1 web-commit-btn" web-item-text-target="' + CategoryId + '">区分確定</button></div>';
        HtmlText += '</div>';
        //弟要素をすべて削除
        Depth++;
        while ($('#' + IdBase + Depth).length)
            $('#' + IdBase + Depth++).remove();
        //アイテムを削除
        $('#webMainItem').val('');
        if (CategoryList.IsItemExist || Max == 0) {
            $('#webMainItemButton').text('一覧から選ぶ').prop('disabled', false);
            $('#webMainItem').prop('disabled', false);
            if (CategoryList.IsItemExist)
                HtmlText = '';
        }
        else {
            $('#webMainItemButton').text('候補無し').prop('disabled', true);
            $('#webMainItem').prop('disabled', true);
        }
        return HtmlText;
    }

    function MakeItemDiv(ItemList) {
        var ItemId = 'webMainItem';
        var Max = ItemList.length;
        var NoItem = Max == 0 ? '候補無し' : '一覧から選ぶ';
        var $TargetList = $('.web-item-list').empty();
        //ドロップダウンリストの生成
        if (Max == 0) {
            $TargetList.append('<li><a class="dropdown-item web-is-item-text" web-item-text-target="webMainItem" href="#">候補無し</a></li>')
        }
        else {
            for (i = 0; i < Max; i++)
                $TargetList.append('<li><a class="dropdown-item web-is-item-text" web-item-text-target="webMainItem" href="#">' + ItemList[i].ItemName + '</a></li>')
        }
        return;
    }
    //戻るボタンの対策
    $(window).on("beforeunload", () => {
        var ss = $('.web-curb').text();
        if ($('.web-curb').text() == "true") return "変更がありますが破棄して移動しますか？";
    });
});
