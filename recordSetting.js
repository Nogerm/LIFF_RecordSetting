const hostURL = "https://script.google.com/macros/s/AKfycbyQwaNfRrnyBB4kCOvdMgUw_o6v8Z_lNUDqjNCT5Uo-dPKBvZ0/exec";

//init
window.onload = function (e) {

  //init data
  document.getElementById("formName").value = "";
  document.getElementById("formGroup").value = "";

  liff.init(
    data => {
      // Now you can call LIFF API
      initializeApp(data);
    },
    err => {
      // LIFF initialization failed
      alert("init fail");

      //show/hide element
      let div_loading = document.getElementById("loading");
      div_loading.className = "ui inverted dimmer";
    }
  );
};

function initializeApp(data) {

  //show/hide element
  let div_loading = document.getElementById("loading");
  div_loading.className = "ui inverted dimmer";
}

function nameChange(element) {
  //console.log(element.value);
  checkBothFormFilled();
}

function groupChange(element) {
  //console.log(element.value);
  checkBothFormFilled();
}

function checkBothFormFilled () {
  let formName  = document.getElementById("formName");
  let inputName = formName.value;

  let formGroup = document.getElementById("formGroup");
  let inputGroup = formGroup.value;

  //button enable/disable
  let button = document.getElementById("btnApply");
  if(inputName !== "" && inputGroup !== "") button.className = "ui fluid submit button";
  else button.className = "ui fluid submit button disabled";
}

function applyAuth() {

  liff.getProfile()
  .then(profile => {
    //add loading to button
    const btn = document.getElementById("btnApply");
    btn.className = "fluid ui loading submit button";

    const postData = {
      type: 'apply_auth',
      userName: document.getElementById("formName").value,
      groupName: document.getElementById("formGroup").value,
      lineId: profile.userId,
    };
    //alert("post data: " + postData);
  
    $.ajax({
      url: hostURL,
      type: "POST",
      datatype: "json",
      data: postData,
      success: function (res, status) {
        //alert("server result: " + JSON.stringify(res) + "\nstatus: " + status);
        btn.className = "fluid ui submit button";
        
        if(res.status === 200) {
          swal.fire({
            title: '申請成功',
            text: '點擊確定關閉視窗',
            type: 'success',
            onClose: () => {
              liff.closeWindow();
            }
          });
        } else if (res.status === 202) {
          swal.fire({
            title: '申請重複',
            text: '資料審查中，請耐心等候',
            type: 'error'
          });
        }
      },
      error: function(xhr, ajaxOptions, thrownError) {
        btn.className = "fluid ui submit button";
        swal.fire({
          title: '錯誤',
          text: "post error: " + xhr.responseText + "\najaxOptions: " + ajaxOptions + "\nthrownError: " + thrownError,
          type: 'error'
        });
      }
    });
  })
  .catch((err) => {
    console.log('error', err);
    swal.fire({
      title: '錯誤',
      text: err,
      type: 'error'
    });
  });
}

