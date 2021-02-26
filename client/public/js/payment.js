var stripe = Stripe("pk_test_xxx");
var elements = stripe.elements();

// 注文情報。サーバではこのJSONを受け取って処理を行う。
var order = {
    items : [
        {
            name : "scrab",
            amount : 2000,
            quantity : 2
        },
        {
            name : "soap",
            amount : 1500,
            quantity : 1
        }
    ],
    currency : "jpy",
    paymentMethodId : null
}

var style = {
  base: {
    color: "#32325d",
  }
};

var card = elements.create("card", { style: style });
card.mount("#card-element");//formタグ内のdivにマウント

card.on('change', ({error}) => {
  const displayError = document.getElementById('card-errors');
  //エラーがあればcard-errosのdivにエラーメッセージを生成
  if (error) {
    displayError.textContent = error.message;
  } else {
    displayError.textContent = '';
  }
});

//注文確定ボタンのDOMを取得する
const submitButton = document.getElementById("payment-form-submit");
//ボタンがクリックされたら、アクションを実行
submitButton.addEventListener("click", function(event){
  stripe
  .createPaymentMethod("card", card) //ここでPromiseが返ってくるので、thenで処理を続ける
  .then(function(result){
    if(result.error) {
      //エラー時の処理
    } else {
      //成功したときの処理。サーバサイドに注文情報を送信する
      //支払いメソッドIDをリクエストデータに詰める
      order.paymentMethodId = result.paymentMethod.id;
      //サーバサイドへ決済情報を渡して結果をハンドリングする
      //サーバは http://localhost:3000/v1/order/payment にPOSTでリクエストを受け付けている
      fetch("http://localhost:3000/v1/order/payment", {
        method: "POST", //HTTPメソッド。データを送信するのでPOST
        headers: {"Content-Type": "application/json"}, //HTTPヘッダー
        body: JSON.stringify(order) //リクエストボディ。orderオブジェクトを文字列化して設定します。
      })
      .then(function(result){
        return result.json(); //HTTPレスポンスからボディをJSONを取り出して次のメソッドに引き渡す
      })
      .then(function(response){
        //正常終了。
      });
    }
  })
  .catch(function(){
  });
});

