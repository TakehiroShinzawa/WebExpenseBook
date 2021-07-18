
interface CategoryList {
    ParentName: string;
    CategoryName: string;
    CategotyPrice: number;
}
interface ChaildCategory {
    Depth: number;
    ParentName: string;
    CategoryName: string;
    Pattern: string;
}

interface EditItem {
    ItemId: number;
    ItemName: string;
    ItemPrice: number;
    ItemDate: Date;
    Pattern: string;
    Category: CategoryListNoPrice[]
}
interface ItemList {
    ItemId: number;
    ItemName: string;
    ItemPrice: number;
    ItemDate: Date;
}
interface CategoryListNoPrice {
    Depth : number;
    CategoryName: string;
}

interface ItemNameOnly {
    ItemName: string
}

interface CategoryListWithItemInfo {
    Category: CategoryListNoPrice[]
    IsItemExist: boolean;
}

class Utilitities {
    ToLocalString(date: Date): string {
        return [
            date.getFullYear(),
            ('0' + (date.getMonth() + 1)).slice(-2),
            ('0' + date.getDate()).slice(-2)
        ].join('-') + ' '
            + date.toLocaleTimeString();
    }
    DateStartEnd(StartDate: Date, EndDate: Date): void {
        StartDate.setHours(0);
        StartDate.setMinutes(0);
        StartDate.setSeconds(0);
        EndDate.setHours(23);
        EndDate.setMinutes(59);
        EndDate.setSeconds(59);
    }
    GetTerm(TargetMonth: string) {
        const StartDate: Date = new Date(TargetMonth);
        StartDate.setDate(1);
        const EndDate: Date = new Date(TargetMonth);

        EndDate.setMonth(EndDate.getMonth() + 1);
        EndDate.setDate(0);
        this.DateStartEnd(StartDate, EndDate);
        //開始終了の保存
        $('.webCalcStart').val(this.ToLocalString(StartDate).substr(0, 10));
        $('.webCalcEnd').val(this.ToLocalString(EndDate).substr(0, 10));
        return StartDate.getFullYear() + '年' + (StartDate.getMonth() + 1) + '月度';
    }
}
class PageControll {
    Pattern: string;
    constructor(Pattern: string) {
        const me = this;
        this.Pattern = Pattern;
        //増殖型でない要素のイベントを記述する
        document.getElementById("webMonthlyTab").addEventListener('click', () => {
            //タブの切り替わり
            //デフォルトは今月
            const StartDate = new Date();
            const StringDate = me.ToLocalString(StartDate).slice(0, 10);
            (<HTMLInputElement>document.getElementById('webCalculateMonth')).value = StringDate;
            (<HTMLInputElement>document.getElementById('webCalculateMonthText')).value = this.GetTerm(StringDate);
            this.GetInitalData();
        });
        $('.web-selected-month').click(function (t) {
            var month = $(this).attr('month');
            var year = $('#webTargetYear').val();
            $('#webCalcStart').val(year + '-' + month + '-01');
            me.ChangeMonth(0);
        })
        $('#webLastMonth').click(function () {
            me.ChangeMonth(-1);
        });
        $('#webNextMonth').click(function () {
            me.ChangeMonth(1);
        });
        $('#webCalculateMonthText').click(function () {
            $('#webTargetYear').val($('#webCalcStart').val().toString().slice(0, 4));
            $('#webDateModalShow').click();
        });
        $('#webCalculateMonth').change(() => {
            //現状の画面を初期化
            var $TopRow = $('webCalcTitleRow');
            $TopRow.siblings().remove();
            $('#webCalculateMonthText').val(me.GetTerm($('#webCalculateMonth').val().toString()));
            //集計開始
            me.GetInitalData();
        });
        //勘定科目のボタンクリック
        $('body').on('click', '.web-make-detail', function () {
            var TargetCategory = $(this).text();
            var ParentName = $(this).attr('web-parent-name');
            $(this).removeClass('web-make-detail')

            let Depth = Number($(this).attr("web-depth"));
            const $Target = $(this).closest('.row');
            Depth++;
            //Ajax で転送し、返事をもらう
            //Jonsonデータを作成
            var data = {
                Depth: Depth, TargetCategory: TargetCategory, ParentName: ParentName,
                StartDate: new Date($('#webCalcStart').val().toString()), EndDate: new Date($('#webCalcEnd').val().toString()), Pattern: Pattern
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
                        if ('ItemName' in result[0])
                            $Target.after(me.CreateItemScreen(Depth, result));
                        else
                            $Target.after(me.CreateCategoryScreen(Depth, result));
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
            const param: ItemList = {
                ItemId: Number($(this).attr("web-ItemId")), ItemName: $(this).attr("web-ItemName")
                , ItemDate: new Date($(this).attr("web-ItemDate")), ItemPrice: Number($(this).attr("web-ItemPrice"))
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
                        me.PrepairCategories(param, result);
                        $('#webItemModalShow').click();
                    },
                })
        });
        //モーダルの更新ボタン
        $('#webItemUpdate').click(function () {
            let IsNullText = false;
            let categories: CategoryListNoPrice[] = new Array();
            let i = 0;
            while ($('#webCategoryNameEdit' + i).length) {
                const $o = $('#webCategoryNameEdit' + i);
                const item = $o.val().toString();
                if (item == "") {
                    $o.addClass('bg-warning');
                    IsNullText = true;
                } else {
                    categories.push({ Depth: i, CategoryName: item });
                }
                i++;
            }
            const ItemId = Number($('#webItemIdEdit').val());

            const ItemName = me.IsNull($('#webItemNameEdit'));
            const ItemPrice = me.IsNull($('#webItemPriceEdit'));
            const ItemDate = me.IsNull($('#webAvailableDateEdit'));

            if (IsNullText || ItemName == "" || ItemPrice == "" || ItemDate == "") {
                alert('入力は必須です');
                return;
            }
            let param: EditItem = {
                ItemId: ItemId, ItemName: ItemName, ItemPrice: Number(ItemPrice), ItemDate: new Date(ItemDate),
                Pattern : me.Pattern, Category: categories
            };

            $.ajax(
                {
                    url: '/Home/JsonUpdateItem',
                    type: 'POST',
                    data: JSON.stringify(param),   // JSONの文字列に変換,   // Depthを取得
                    contentType: 'application/json',    // content-typeをJSONに指定する
                    error: function () { alert('失敗しました'); },
                    complete: function (data) {
                        const result = eval('(' + data.responseText + ')');
                        $('#webItemModalClose').click();
                        if (result == true) {
                            const ss = $('#webUpdatingItem').val().toString();
                            $($(ss).text(param.ItemName));
                        } else {
                            $('#webCalculateMonth').change();
                        }
                    },
                })
        });

        //入力に関するスクリプト
        //登録ボタン　→入力チェック・データ送信・クリア(とりあえず)
        $('#webItemRegister').click(function () {
            let IsNullText = false;
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
            var categories: CategoryListNoPrice[] = new Array();
            var i = 0;
            while ($('#webCategoryD' + i).length)
                categories.push({ Depth: i, CategoryName: $('#webCategoryD' + i++).val().toString() });
            let data: EditItem = {
                ItemName: $('#webMainItem').val().toString(), ItemPrice: Number($('#webItemPrice').val()),
                ItemDate: new Date($('#webAvailableDate').val().toString()), Pattern: Pattern,
                ItemId : 0,Category: categories
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
                        me.ClearItemScreen(result);
                    },
                })
        });
        //クリアボタン
        $('body').on('click', '.web-clear-btn', function () {
            me.ClearItemScreen(null);
        });
        //onで処理を登録したら一度しか起動しなかったので、clickに戻した
        $('#webMainItemButton').click(function () {
            //品名の選択
            //区分情報をJSONで送信し、候補アイテムを取得する
            if ($('#webCategoryD0').val() == '')
                return;
            //Jonsonデータを作成
            let param: string[]= new Array();
            let i = 0;
            while ($('#webCategoryD' + i).length)
                param.push($('#webCategoryD' + i++).val().toString());
            //Ajax で転送し、返事をもらう
            $.ajax(
                {
                    url: '/Home/JsonItem',
                    type: 'POST',
                    data: JSON.stringify(param),   // JSONの文字列に変換
                    contentType: 'application/json',    // content-typeをJSONに指定する
                    error: function () { },
                    complete: function (data) {
                        const result = eval('(' + data.responseText + ')');
                        me.MakeItemDiv(result);

                    },
                })
        });


        $('body').on('click', '.web-is-item-text, .web-commit-btn', function () {
            //テキストボックスに選択された値を代入
            const Target = '#' + $(this).attr('web-item-text-target');
            let Category :string;
            if ($(this).hasClass('web-commit-btn')) {
                //テキスト確定ボタンの場合、品名リストがからの時のみ起動する
                Category = $(Target).val().toString();
            } else {
                Category = $(this).text();
                $(Target).val(Category);
            }
            const ParentName = $(Target).attr('web-parent-name');
            //区分情報をJSONで送信し、次の区分を取得する
            let Depth = Target.substr(13);
            if (Depth == "") {
                //品名の時は別の処理
                return;
            } else {
                //Jonsonデータを作成

                const param: ChaildCategory = {
                    ParentName: ParentName,
                    Depth: Number(Depth),
                    Pattern: me.Pattern,
                    CategoryName: Category
                };
                //Ajax で転送し、返事をもらう
                $.ajax(
                    {
                        url: '/Home/JsonCategory',
                        type: 'POST',
                        data: JSON.stringify(param),   // JSONの文字列に変換
                        contentType: 'application/json',    // content-typeをJSONに指定する
                        error: function () { console.log("何らかの理由で失敗しました"); },
                        complete: function (data) {
                            var result = eval('(' + data.responseText + ')');
                            if (Depth == "0")
                                $('#webDivEntry').html(me.MakeCategoryDiv(0, Category, result));
                            else
                                $('#webDiv' + Depth).after(me.MakeCategoryDiv(Number(Depth), ParentName + Category, result));

                        },
                    })
            }
            $('.web-curb').text('true');
        });
    }
    IsNull($o : JQuery<HTMLElement>): string {
        if ($o.val() == "") {
            $o.addClass('bg-warning');
            return "";
        }
        $o.removeClass('bg-warning');
        return $o.val().toString();
    }

    //入力初期表示の作成
    ClearItemScreen(CategoryList: CategoryListNoPrice[]) {
        if (CategoryList != null) {
            const $TargetList = $('#webCategoryListD0').empty();
            //ドロップダウンリストの生成
            const Max = CategoryList.length;
            for (let i = 0; i < Max; i++)
                $TargetList.append('<li><a class="dropdown-item web-is-item-text" web-item-text-target="webCategoryD0" href="#">' + CategoryList[i].CategoryName + '</a></li>')
        }
        let Depth = 1;
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
    //アイテムの候補をドロップダウンに格納する
    MakeItemDiv(ItemList: ItemNameOnly[]) {
        const Max = ItemList.length;
        const NoItem = Max == 0 ? '候補無し' : '一覧から選ぶ';
        const $TargetList = $('.web-item-list').empty();
        //ドロップダウンリストの生成
        if (Max == 0) {
            $TargetList.append('<li><a class="dropdown-item web-is-item-text" web-item-text-target="webMainItem" href="#">候補無し</a></li>')
        }
        else {
            for (let i = 0; i < Max; i++)
                $TargetList.append('<li><a class="dropdown-item web-is-item-text" web-item-text-target="webMainItem" href="#">' + ItemList[i].ItemName + '</a></li>')
        }
        return;
    }

    //カテゴリ候補をドロップダウンに格納する
    MakeCategoryDiv(Depth: number, ParentName: string, CategoryList: CategoryListWithItemInfo) {
        const IdBase = 'webDiv';
        Depth++;
        var CategoryId = 'webCategoryD' + Depth;
        $('#webItemRegister').attr('webEdittingDepth', Depth);
        //先に消しておく
        $('#' + IdBase + Depth).remove();
        var Max = CategoryList.Category.length;
        var NoItem = Max == 0 ? 'disabled>候補無し' : '>一覧から選ぶ';
        var HtmlText = '<div class="col" id="webDiv' + Depth + '"><label for="' + CategoryId +
            '" class="form-label web-require">区分</label><input type="search" class="form-control" id="' + CategoryId +
            '" placeholder="区分名" web-parent-name="' + ParentName + '"><div class="btn-group dropend"><button type="button"' +
            'class="btn btn-secondary dropdown-toggle web-dorop-items" data-toggle="dropdown" aria - expanded="false" ' +
            NoItem + '</button><ul class="dropdown-menu">';
        //ドロップダウンリストの生成
        for (let i = 0; i < Max; i++) {
            HtmlText += '<li><a class="dropdown-item web-is-item-text" web-item-text-target="' + CategoryId +
                '" href="#">' + CategoryList.Category[i].CategoryName + '</a></li>';
        }
        HtmlText += '</ul><button type="button" class="btn btn-primary ml-1 web-commit-btn" web-item-text-target="' + CategoryId + '">区分確定</button></div>';
        HtmlText += '</div>';
        //弟要素をすべて削除
        Depth++;
        let IsUpperCategory = false;
        while ($('#' + IdBase + Depth).length) {
            $('#' + IdBase + Depth++).remove();
            IsUpperCategory = true;
        }
        if (IsUpperCategory)
            $('#webItemPrice').val('');

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
    ChangeMonth(t: number) {
    const td = new Date($('#webCalcStart').val().toString());
    td.setMonth(td.getMonth() + t);
    $('#webCalculateMonth').attr('value', this.ToLocalString(td).slice(0, 10));
    $('#webCalculateMonth').change();
}
  
    //保存してある日付でデータを取得
    GetInitalData() {
        //勘定科目の羅列
        //Ajax で転送し、返事をもらう
        //Jonsonデータを作成
        const data = { Depth: 0, StartDate: new Date((<HTMLInputElement>document.getElementById('webCalcStart')).value), EndDate: new Date((<HTMLInputElement>document.getElementById('webCalcEnd')).value), Pattern: this.Pattern };
        const me = this;
        $.ajax(
            {
                url: '/Home/JsonGetCategoryPrice',
                type: 'POST',
                data: JSON.stringify(data),   // JSONの文字列に変換,   // Depthを取得
                contentType: 'application/json',    // content-typeをJSONに指定する
                error: function () { },
                complete: function (data) {
                    const result = eval('(' + data.responseText + ')');
                    $('#webCalcTitleRow').after(me.CreateCategoryScreen(0, result));
                },
            })
    }
    //アイテムの表示
    CreateItemScreen(Depth: number, CategoryList: Array<ItemList>): string {
        let Padding = '';
        let retHtml = "";
        //col のパディングを作る
        for (let i = 0; i < Depth; i++)
            Padding += '・';
        const Count = CategoryList.length;
        //行を追加していく
        for (let i = 0; i < Count; i++) {
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

    //カテゴリの表示
    private CreateCategoryScreen(Depth: number, CategoryList: Array<CategoryList>): string {
        //
        let Hr;
        let Padding = '';
        let retHtml = "";
        let TotalPrice = 0;
        const IsTopCategory = Depth == 0;
        //col のパディングを作る
        for (let i = 0; i < Depth; i++)
            Padding += '・';
        //区分の展開
        if (IsTopCategory) {
            //既存の行を削除
            Hr = '<hr class="web-top-hr" />';
            $('.web-top-rows').remove();
            $('.web-top-hr').remove();
        } else {
            Hr = '';
        }
        const Count = CategoryList.length;
        //行を追加していく
        for (let i = 0; i < Count; i++) {
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

    //モーダルの内容を作成する
    PrepairCategories(itemInfo: ItemList, categoryList: Array<CategoryList>): void {
        $('#webItemModal').find('input').removeClass('bg-warning');
        const length = categoryList.length;
        var html = "";
        for (let i = 0; i < length; i++) {
            html += '<div class="row"><div class="col web-require-strict"><label for="webCategoryNameEdit' + i +
                '" class="form-label web-require-strict">' + (i == 0 ? '勘定科目' : '区分') + '</label><input type="text" class="form-control web-require-strict" id="webCategoryNameEdit' + i +
                '" value="' + categoryList[i].CategoryName + '"></div></div>';
        }
        $('#webItemNameEdit').val(itemInfo.ItemName);
        $('#webItemPriceEdit').val(itemInfo.ItemPrice);
        $('#webAvailableDateEdit').val(this.ToLocalString(itemInfo.ItemDate).substr(0, 10));
        $('#webItemIdEdit').val(itemInfo.ItemId);
        $('#webRowMake').html(html);
    }

    //日付関連ユーティリティ
    ToLocalString(date: Date): string {
        return [
            date.getFullYear(),
            ('0' + (date.getMonth() + 1)).slice(-2),
            ('0' + date.getDate()).slice(-2)
        ].join('-') + ' '
            + date.toLocaleTimeString();
    }
    DateStartEnd(StartDate: Date, EndDate: Date): void {
        StartDate.setHours(0);
        StartDate.setMinutes(0);
        StartDate.setSeconds(0);
        EndDate.setHours(23);
        EndDate.setMinutes(59);
        EndDate.setSeconds(59);
    }
    GetTerm(TargetMonth: string): string {
        let StartDate: Date = new Date(TargetMonth);
        StartDate.setDate(1);
        var EndDate: Date = new Date(TargetMonth);

        EndDate.setMonth(EndDate.getMonth() + 1);
        EndDate.setDate(0);
        this.DateStartEnd(StartDate, EndDate);
        //開始終了の保存
        (<HTMLInputElement>document.getElementById('webCalcStart')).value = this.ToLocalString(StartDate).substr(0, 10);
        (<HTMLInputElement>document.getElementById('webCalcEnd')).value = this.ToLocalString(EndDate).substr(0, 10);
        return StartDate.getFullYear() + '年' + (StartDate.getMonth() + 1) + '月度';
    }

}