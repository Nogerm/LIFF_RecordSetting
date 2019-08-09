const hostURL = "https://script.google.com/macros/s/AKfycbyQwaNfRrnyBB4kCOvdMgUw_o6v8Z_lNUDqjNCT5Uo-dPKBvZ0/exec";
let lineId = "";
let inputName = "";
let inputGroup = "";

//init
window.onload = function (e) {

  //init data
  lineId = "";
  inputName = "";
  inputGroup = "";
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
  lineId = data.context.userId;
  //check user permission
  const query_url = hostURL + "?type=record&lineId=" + data.context.userId;
  axios.get(query_url)
  .then(response => {
    // Success

    //show/hide element
    let div_loading = document.getElementById("loading");
    div_loading.className = "ui inverted dimmer";

  })
  .catch(error => {
    // Error
    console.log(error);
    alert(error);
  });
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
  inputName = formName.value;

  let formGroup = document.getElementById("formGroup");
  inputGroup = formGroup.value;

  //button enable/disable
  let button = document.getElementById("btnApply");
  if(inputName !== "" && inputGroup !== "") button.className = "ui fluid submit button";
  else button.className = "ui fluid submit button disabled";
}

function applyAuth() {
  //add loading to button
  const btn = document.getElementById("btnApply");
  btn.className = "fluid ui loading submit button";

  const postData = {
    type: 'apply_auth',
    userName: "Name",
    groupName: "Group",
    lineId: lineId
  };
  //alert("post data: " + postData);

  $.ajax({
    url: hostURL,
    type: "POST",
    datatype: "json",
    data: postData,
    success: function (res, status) {
      alert("server result: " + JSON.stringify(res) + "\nstatus: " + status);
      btn.className = "fluid ui submit button";
      swal.fire({
        title: '回報成功',
        text: '點擊確定關閉視窗',
        type: 'success',
        onClose: () => {
          liff.closeWindow();
        }
      });
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
}

