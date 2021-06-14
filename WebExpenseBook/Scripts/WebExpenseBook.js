$(function () {
    //登録ボタン　→入力チェック・データ送信・クリア(とりあえず)
    $('.web-register-btn').click(function () {
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
            ItemName: $('#webMainItem').val(), ItemPrice: $('#webItemPrice').val(), ItemDate: $('#webAvailableDate').val(),
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
        if ($(LastDev).length == 0) {
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
        }
    });

    $('body').on('click', '.web-is-item-text, .web-commit-btn', function () {
        //テキストボックスに選択された値を代入
        var Target = $(this).attr('web-item-text-target');
        var Category;
        if ($(this).hasClass('web-commit-btn'))
            Category = $('#' + Target).val();
        else {
            Category = $(this).text();
            $('#' + Target).val(Category);
        }
        //区分情報をJSONで送信し、次の区分を取得する
        var Depth = Target.substr(12);
        if (Depth == "") {
            //品名の時は別の処理
            return;
        } else {
            //Jonsonデータを作成
            var data = { Depth: Depth, CategoryName: Category };
            //Ajax で転送し、返事をもらう
            $.ajax(
                {
                    url: '/Home/JsonCategory',
                    type: 'POST',
                    data: JSON.stringify(data),   // JSONの文字列に変換
                    contentType: 'application/json',    // content-typeをJSONに指定する
                    error: function () { console.log("何らかの理由で失敗しました");},
                    complete: function (data) {
                        var result = eval('(' + data.responseText + ')');
                        console.log("正常動作");
                        $('#webDiv'+Depth).after(MakeCategoryDiv( Depth, result));
                    },
                })
        }
        //$('.web-curb').text('true') ;
    });
    function MakeCategoryDiv(Depth, CategoryList) {
        const IdBase = 'webDiv';
        Depth++;
        var CategoryId = 'webCategoryD' + Depth;
        //先に消しておく
        $('#' + IdBase + Depth).remove();
        var Max = CategoryList.length;
        var NoItem = Max == 0 ? 'disabled>候補無し' : '>一覧から選ぶ';
        var HtmlText = '<div class="col" id="webDiv' + Depth + '"><label for="' + CategoryId +
            '" class="form-label web-require">区分</label><input type="search" class="form-control" id="' + CategoryId +
            '" placeholder="区分名"><div class="btn-group dropend"><button type="button"' +
            'class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria - expanded="false" ' +
             NoItem + '</button><ul class="dropdown-menu">';
        //ドロップダウンリストの生成
        for (i = 0; i < Max; i++) {
            HtmlText += '<li><a class="dropdown-item web-is-item-text" web-item-text-target="' + CategoryId +
                '" href="#">' + CategoryList[i].CategoryName + '</a></li>';
        }
        HtmlText += '</ul><button type="button" class="btn btn-primary ml-1 web-commit-btn" web-item-text-target="' + CategoryId + '">区分確定</button></div>';
        HtmlText += '</div>';
        //if (Max != 0 )
        //    $('.web-dummy-button').text('候補無し').prop('disabled', true);
        //else
        //    $('.web-dummy-button').text('一覧から選ぶ').prop('disabled', false);
        //弟要素をすべて削除
        Depth++;
        while ($('#' + IdBase + Depth).length)
            $('#' + IdBase + Depth++).remove();
        //アイテムを削除
        $('#webMainItem').val('');
       return HtmlText;
    }

    function MakeItemDiv(ItemList) {
        var ItemId = 'webMainItem';
        var Max = ItemList.length;
        var NoItem = Max == 0 ? '候補無し' : '一覧から選ぶ';
 //       var $TargetList = $('.web-dummy-button');
        var $TargetList = $('.web-item-list').empty();
        //ドロップダウンリストの生成
        if (Max == 0)
            $TargetList.append('<li><a class="dropdown-item web-is-item-text" web-item-text-target="webMainItem" href="#">候補なし</a></li>')
        else
            for (i = 0; i < Max; i++)
                $TargetList.append('<li><a class="dropdown-item web-is-item-text" web-item-text-target="webMainItem" href="#">' + ItemList[i].ItemName + '</a></li>')
        return;
    }
    //戻るボタンの対策
    $(window).on("beforeunload", () => {
        var ss = $('.web-curb').text();
        if (ss == "true") return "変更がありますが破棄して移動しますか？";
    });
});
