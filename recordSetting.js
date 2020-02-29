const hostURL = "https://script.google.com/macros/s/AKfycbyQwaNfRrnyBB4kCOvdMgUw_o6v8Z_lNUDqjNCT5Uo-dPKBvZ0/exec";
const liffID = "1653896800-NZb0kpGe";

let allGroup = [];
let allMembers = [];

//init
window.onload = function (e) {
  liff.init({
      liffId: liffID
    },
    data => {
      console.log('LIFF initialization ok', data)
      if (liff.isLoggedIn()) {
        console.log('LIFF is logged in')
        liff.getProfile()
          .then(profile => {
            console.log('getProfile ok displayName', profile.displayName);
            initializeApp(profile);
          })
          .catch((err) => {
            console.log('getProfile error', err);
          })
      } else {
        console.log('LIFF is not logged in');
        liff.login();
      }
    },
    err => {
      console.log('LIFF initialization failed', err);
    }
  );
};

function initializeApp(profile) {

  //show/hide element
  let div_loading = document.getElementById("loading");
  div_loading.className = "ui inverted dimmer";

  //query data
  const query_url = hostURL + "?type=setting_basic&lineId=" + profile.userId;
  axios.get(query_url)
    .then(response => {
      console.log("response.data: " + JSON.stringify(response.data))

      if (response.data.status === 200) {

        //check permission
        if (response.data.permission === "管理員" || response.data.permission === "最高權限") {
          allGroup = response.data.groupName.filter(item => item !== "講員");
          allMembers = response.data.groupMembers;

          let addMemberSegment = document.getElementById("add-member-segment");
          addMemberSegment.style.display = "block";

          let addMemberSelect = document.getElementById("add-member-select");
          allGroup.forEach(element => {
            let option = document.createElement("option");
            option.setAttribute("value", element);
            option.innerHTML = element;
            addMemberSelect.appendChild(option)
          });
        }
      }
    })
    .catch(error => {
      console.log(error);
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

function feedbackChange(element) {
  //console.log(element.value);
  let button = document.getElementById("btnFeedback");
  button.className = element.value === "" ? "ui fluid submit button disabled" : "ui fluid submit button";
}

function addMemberChange(element) {
  //console.log(element.value);
  let button = document.getElementById("btnAddMember");
  button.className = element.value === "" ? "ui fluid submit button disabled" : "ui fluid submit button";
}


function checkBothFormFilled() {
  let formName = document.getElementById("formName");
  let inputName = formName.value;

  let formGroup = document.getElementById("formGroup");
  let inputGroup = formGroup.value;

  //button enable/disable
  let button = document.getElementById("btnApply");
  if (inputName !== "" && inputGroup !== "") button.className = "ui fluid submit button";
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

          if (res.status === 200) {
            swal.fire({
              title: '申請成功',
              text: '點擊確定關閉視窗',
              type: 'success',
              onClose: () => {
                liff.sendMessages([{
                    type: 'text',
                    text: '申請權限完成'
                  }])
                  .then(() => {
                    console.log('message sent');
                    liff.closeWindow();
                  })
                  .catch((err) => {
                    console.log('error', err);
                    liff.closeWindow();
                  });
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
        error: function (xhr, ajaxOptions, thrownError) {
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

function applyFeedback() {

  liff.getProfile()
    .then(profile => {
      //add loading to button
      const btn = document.getElementById("btnFeedback");
      btn.className = "fluid ui loading submit button";

      const feedbackContent = document.getElementById("issue-content").value;

      const postData = {
        type: 'apply_feedback',
        content: feedbackContent,
        lineId: profile.userId,
      };
      console.log("post data: " + JSON.stringify(postData));

      $.ajax({
        url: hostURL,
        type: "POST",
        datatype: "json",
        data: postData,
        success: function (res, status) {
          //console.log("server result: " + JSON.stringify(res) + "\nstatus: " + status);
          btn.className = "fluid ui submit button";

          if (res.status === 200) {
            swal.fire({
              title: '回報成功，感謝你的幫助',
              text: '點擊確定關閉視窗',
              type: 'success',
              onClose: () => {
                document.getElementById("issue-content").value = "";
                liff.sendMessages([{
                    type: 'text',
                    text: '意見回饋完成'
                  }])
                  .then(() => {
                    console.log('message sent');
                    liff.closeWindow();
                  })
                  .catch((err) => {
                    console.log('error', err);
                    liff.closeWindow();
                  });
              }
            });
          }
        },
        error: function (xhr, ajaxOptions, thrownError) {
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

function applyAddMember() {

  liff.getProfile()
    .then(profile => {
      //add loading to button
      const btn = document.getElementById("btnAddMember");
      btn.className = "fluid ui loading submit button";

      const selectedGroup = document.getElementById("add-member-select").value;
      const newMemberName = document.getElementById("newMemberName").value;

      const postData = {
        type: 'apply_add_member',
        group: selectedGroup,
        name: newMemberName,
        lineId: profile.userId,
      };
      console.log("post data: " + JSON.stringify(postData));

      $.ajax({
        url: hostURL,
        type: "POST",
        datatype: "json",
        data: postData,
        success: function (res, status) {
          //console.log("server result: " + JSON.stringify(res) + "\nstatus: " + status);
          btn.className = "fluid ui submit button";

          if (res.status === 200) {
            swal.fire({
              title: '回報成功，感謝你的幫助',
              text: '點擊確定關閉視窗',
              type: 'success',
              onClose: () => {
                document.getElementById("issue-content").value = "";
                liff.sendMessages([{
                    type: 'text',
                    text: '意見回饋完成'
                  }])
                  .then(() => {
                    console.log('message sent');
                    liff.closeWindow();
                  })
                  .catch((err) => {
                    console.log('error', err);
                    liff.closeWindow();
                  });
              }
            });
          }
        },
        error: function (xhr, ajaxOptions, thrownError) {
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