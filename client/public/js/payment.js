// ---------------------------
// 1. elementsインスタンスを用意する
// ---------------------------
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

// ---------------------------
// 2. htmlロードにelementインスタンスを生成、マウント
// ---------------------------
var style = {
  base: {
    color: "#32325d",
  }
};

var card = elements.create("card", { style: style });
card.mount("#card-element");//formタグ内のdivにマウント

// ---------------------------
// 3. cardインスタンスの状態変更をハンドリング
// ---------------------------
card.on('change', ({error}) => {
  const displayError = document.getElementById('card-errors');
  //エラーがあればcard-errosのdivにエラーメッセージを生成
  if (error) {
    displayError.textContent = error.message;
  } else {
    displayError.textContent = '';
  }
});


// ---------------------------
// 4. ボタンが押下された際に決済リクエストの送信、ハンドリング
// ---------------------------

//注文確定ボタンのDOMを取得する
const submitButton = document.getElementById("payment-form-submit");
//ボタンがクリックされたら、アクションを実行
submitButton.addEventListener("click", function(event){
  //スピナーを表示する
  displaySpinner();

  stripe
  .createPaymentMethod("card", card) //ここでPromiseが返ってくるので、thenで処理を続ける
  .then(function(result){
    if(result.error) {
      //エラー時の処理
      onError();
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
        onComplete(response);
      });
    }
  })
  .catch(function(){
    onError();
  });
});

// ---------------------------
// 5. 戻るボタンでリセット
// ---------------------------

//ボタンの要素を取得
let returnButtonNormal = document.getElementById("return-button-normal");
let returnButtonError = document.getElementById("return-button-error");
let returnButtonNotYet = document.getElementById("return-button-not-yet");
let returnButtonDefault = document.getElementById("return-button-default");

returnButtonNormal.addEventListener("click",reset);
returnButtonError.addEventListener("click",reset);
returnButtonNotYet.addEventListener("click",reset);
returnButtonDefault.addEventListener("click",reset);

//イベントハンドラ。リセットする。
function reset(event) {
  hideError();
  hideMessage();
  hideNotYetMessage();
  displayButton();
  card.mount("#card-element");
}

function onComplete(response) {
  shutdown();

  //スピナー終了
  hideSpinner();
  if(response.error) {
    onError();
  } else if (response.paymentIntentStatus === "succeeded") {

    //確定ボタンを消して完了メッセージを表示
    displayMessage();
  } else {
    displayNotYetMessage();
  }
}

function onError() {
  shutdown();

  if(!document.querySelector(".spinner-border").classList.contains("collapse")) {
    hideSpinner();
  }
  //確定ボタンを消してエラーメッセージを表示
  displayError();
}

function shutdown() {
  card.unmount();
  hideButton();
}

// ---------------------------
// x. 表示関連のスニペット
// ---------------------------

function hideSpinner() {
  document.querySelector(".spinner-border").classList.add("collapse")
}

function displaySpinner() {
  document.querySelector(".spinner-border").classList.remove("collapse");
}

//エラーメッセージ
function hideError() {
  document.querySelector(".contents-payment-error").classList.add("collapse");
}

function displayError() {
  document.querySelector(".contents-payment-error").classList.remove("collapse");
}

//成功メッセージ
function displayMessage() {
  document.querySelector(".contents-payment-result").classList.remove("collapse");
}

function hideMessage() {
  document.querySelector(".contents-payment-result").classList.add("collapse");
}

function displayNotYetMessage() {
  document.querySelector(".contents-payment-not-yet").classList.remove("collapse");
}

function hideNotYetMessage() {
  document.querySelector(".contents-payment-not-yet").classList.add("collapse");
}

//注文確定ボタン
function hideButton() {
  document.querySelector("#payment-form-submit").classList.add("collapse");
}

function displayButton() {
  document.querySelector("#payment-form-submit").classList.remove("collapse");
}
