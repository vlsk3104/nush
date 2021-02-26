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

});

