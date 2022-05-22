function RefreshList() {
      var pathname = window.location.pathname;
      var locarray = pathname.split("/");
      var folderLocation = locarray[3];
      var pathanalysis = window.location.pathname.replace("/club/pagefiles", '');
      $.get("/club/folderlist?location=" + folderLocation, function (data, status) {
            $("#filestructure ul").html("");
            console.log(data);
            data.forEach(element => {
                  if (pathanalysis) {
                        var folderid = 'pagefiles' + pathanalysis + '$' + element;
                  } else {
                        var folderid = 'pagefiles' + pathanalysis + '$' + element;
                  }
                  var makeid = element.split(' ').join('_');
                  $("#filestructure ul").append(`<li class="list-group-item" name="" id="folder_${makeid}">
                        <div class="row">
                            <div class="col folders" onclick="enterfolder(this)" id="${folderid}">
                                <img src="/assets/img/folder-icon.png" alt=""
                                    style="width: 1rem;margin-right: 1 rem;">
                                <span>${element}</span>
  
                            </div>
                            <div class="col option">
                                <span id="option_${makeid}" style="float: right;cursor: pointer;"
                                    onclick="optionMenu(this)"> <img src="/assets/img/option-menu.png" alt=""
                                        style="width: 1rem;margin-right: 1 rem;">
                                </span>
                            </div>
                        </div>
                    </li>`);
            });
      });
}

function removemessage() {
      $("#messages").html('');
}

function renamethefolder(params) {
      var folderid = params.id.split("_")[1];
      var newname = $("#renametext").val();
      $.post('/club/pagefiles/renamefolder', {
            newname: newname,
            folderid: folderid
      }, function (data, status) {
            RefreshList();
            $("#messages").html(`<div style="padding: 1rem"> ${data}
                    <span style="float: right"><img src="/assets/img/cross.png" alt="" style="width: 1rem;cursor:pointer;" onclick="removemessage()">
                    </span>
                </div>`);
      });
}


function renamefolder(params) {
      var folderid = params.id.split("_")[1];
      var getname = $("#folder_" + folderid + " div div span").html();
      $(".optionicons").html('');
      $("#removeoption_" + folderid).remove();
      $("#folder_" + folderid).append(`
        <hr>
                        <div class="row">
                            <div class="col">
                                <input type="text" id="renametext" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" value="${getname}">
                            </div>
                            <div class="col">
                                <button type="button" onclick="renamethefolder(this)" id="rename_${folderid}" class="btn btn-primary">Rename</button>
                            </div>
                        </div>
        
        `);
}

function deletefolder(params) {
      var foldername = params.id.replace('_', '$').split('$')[1];
      var foldername = $('#folder_' + foldername + " div div span").html();
      var pathname = window.location.pathname;
      var locarray = pathname.split("/");
      var folderLocation = locarray[3];
      console.log(params);
      $.post('/club/deletefolder', {
            foldername: foldername,
            location: folderLocation
      }, function (data, status) {
            $("#messages").html(`<div style="padding: 1rem"> ${data}
                    <span style="float: right"><img src="/assets/img/cross.png" alt="" style="width: 1rem;cursor:pointer;" onclick="removemessage()">
                    </span>
                </div>`);
            RefreshList();
      });
}

function removeoption(params) {
      var folderid = params.id.split("_")[1];
      $(".optionicons").remove();
      $("#removeoption_" + folderid).remove();
      $(`#folder_${folderid} div .option`).append(`<span id="option_${folderid}" style="float: right;cursor: pointer;" onclick="optionMenu(this)"> <img src="/assets/img/option-menu.png" alt=""
                                        style="width: 1rem;margin-right: 1 rem;">
                                </span>`);
      $(`#file_${folderid} div .option`).append(`<span id="fileoption_${folderid}" style="float: right;cursor: pointer;" onclick="fileoptionMenu(this)"> <img src="/assets/img/option-menu.png" alt=""
                                style="width: 1rem;margin-right: 1 rem;">
                        </span>`);
      $(`#link_${folderid} div .option`).append(`<span id="linkoption_${folderid}" style="float: right;cursor: pointer;" onclick="linkoptionMenu(this)"> <img src="/assets/img/option-menu.png" alt=""
                                style="width: 1rem;margin-right: 1 rem;">
                        </span>`);
}

function optionMenu(params) {
      var folderid = params.id.replace('_', '$').split('$')[1];
      $("#" + params.id).html("");
      $("#option_" + folderid).remove();
      $("#folder_" + folderid).append(`
                        <div class="optionicons">
                            <hr>
                            <div class="delete-icon" id="delete_${folderid}" onclick="deletefolder(this)">
                                <span >
                                    <div><img src="/assets/img/dust-bin.png" alt=""
                                        style="height: 1.5rem;margin-right: 1 rem;"></div>
                                </span>
                            </div>
                        </div>`);
      $("#folder_" + folderid + " div .option").append(
            `<span style="float: right" id="removeoption_${folderid}" onclick="removeoption(this)"><img src="/assets/img/cross.png"  style="width: 1rem;cursor:pointer;"></span>`
      );
}


function enterfolder(params) {
      window.location.href = "/club/" + params.id;
}

function createfolder() {
      var folderName = $("#foldername").val();
      if (folderName == "") {
            folderName = "New Folder";
      }
      var pathname = window.location.pathname;
      var locarray = pathname.split("/");
      var folderLocation = locarray[3];
      $.post("/club/createfolder", {
            foldername: folderName,
            location: folderLocation,
      }, function (data, success) {
            $("#messages").html(`<div style="padding: 1rem"> ${data}
                    <span style="float: right"><img src="/assets/img/cross.png" alt="" style="width: 1rem;cursor:pointer;" onclick="removemessage()">
                    </span>
                </div>`);
            $("#inputs").html("");
            RefreshList();
      });
}

function submitfile() {
      var pathname = window.location.pathname;
      var locarray = pathname.split("/");
      var fileLocation = locarray[2];
      var data = new FormData($("#fileform")[0]);
      $.ajax({
            type: "POST",
            enctype: 'multipart/form-data',
            url: "/club/uploadfile",
            data: data,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 600000,
            success: function (data, status) {
                  $("#messages").html(`<div style="padding: 1rem"> ${data}
              <span style="float: right"><img src="/assets/img/cross.png" alt="" style="width: 1rem;cursor:pointer;" onclick="removemessage()">
              </span>
              </div>`);
              
                  $("#inputs").html("");
                  RefreshFiles();
                  if (data.search('index.html')!=-1) {
                        window.location.reload();
                  }
            }
      });
}

function RefreshFiles() {
      var pathname = window.location.pathname;
      var locarray = pathname.split("/");
      var folderLocation = locarray[3];
      $.get("/club/fileslist?location=" + folderLocation, function (data, status) {
            $("#filesstructure ul").html("");
            data.forEach(element => {
                  var makeid=element.split('.').join('_');
                  $("#filesstructure ul").append(`<li class="list-group-item" id="file_${makeid}">
                        <div class="row">
                            <div class="col files">
                                <img src="/assets/img/file-icon.png" alt=""
                                    style="width: 1rem;margin-right: 1 rem;">
                                <span>${element}</span>

                            </div>
                            <div class="col option">
                                <span id="fileoption_${makeid}" style="float: right;cursor: pointer;"
                                    onclick="fileoptionMenu(this)"> <img src="/assets/img/option-menu.png" alt=""
                                        style="width: 1rem;margin-right: 1 rem;">
                                </span>
                            </div>
                        </div>
                    </li>`);

            });
      });

}

function deletefile(params) {
      var fileid=params.id.replace('_','$').split('$')[1];
      var fileLocation=window.location.pathname;
      if (fileLocation=="/club/pagefiles/"||fileLocation=="/club/pagefiles") {
      }else{
            fileLocation = window.location.pathname.replace('/$',' ').split(' ')[1].split('$').join('/');
      }
      var filename=$("#file_"+fileid+" div div span").html();
      $.post('/club/deletefile', {
            filename :filename,
            filelocation: fileLocation
      }, function (data, status) {
            $("#messages").html(`<div style="padding: 1rem"> ${data}
                    <span style="float: right"><img src="/assets/img/cross.png" alt="" style="width: 1rem;cursor:pointer;" onclick="removemessage()">
                    </span>
                </div>`);
            $("#inputs").html("");
            if (data.search('index.html')!=-1) {
                  window.location.reload();
            }
            RefreshFiles();
      });
}

function renamethefile(params) {
      var fileid = params.id.split("_")[1];
      var pathname = window.location.pathname;
      var locarray = pathname.split("/");
      var fileLocation = locarray[2];
      var newname = $("#renametext").val();
      $.post('/club/pagefiles/renamefile', {
            fileid: fileid,
            newname: newname,
            filelocation: fileLocation
      }, function (data, status) {
            $("#messages").html(`<div style="padding: 1rem"> ${data}
          <span style="float: right"><img src="/assets/img/cross.png" alt="" style="width: 1rem;cursor:pointer;" onclick="removemessage()">
          </span>
          </div>`);
            $("#inputs").html("");
            RefreshFiles();
      });
}

function renamefile(params) {
      var fileid = params.id.split("_")[1];
      $("#" + params.id).html("");
      var getname = $("#file_" + fileid + " div div span").html();
      $("#fileoption_" + fileid).remove();
      $("#removeoption_" + fileid).remove();
      $(".optionicons").html('');
      $("#file_" + fileid).append(`
      <hr>
                      <div class="row">
                          <div class="col">
                              <input type="text" id="renametext" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" value="${getname}">
                          </div>
                          <div class="col">
                              <button type="button" onclick="renamethefile(this)" id="rename_${fileid}" class="btn btn-primary">Rename</button>
                          </div>
                      </div>
      
      `);
}

function fileoptionMenu(params) {
      var fileid = params.id.replace('_','$').split('$')[1];
      $("#" + params.id).html("");
      $("#fileoption_" + fileid).remove();
      $("#file_" + fileid).append(`
                        <div class="optionicons">
                            <hr>
                            <div class="delete-icon" id="delete_${fileid}" onclick="deletefile(this)">
                                <span >
                                    <div><img src="/assets/img/dust-bin.png" alt=""
                                        style="height: 1.5rem;margin-right: 1 rem;"></div>
                                </span>
                            </div>
                            
                        </div>`);
      $("#file_" + fileid + " div .option").append(
            `<span style="float: right" id="removeoption_${fileid}" onclick="removeoption(this)"><img src="/assets/img/cross.png"  style="width: 1rem;cursor:pointer;"></span>`
      );
}


$(document).ready(function () {
      var pathname = window.location.pathname;
      var locarray = pathname.split("/");
      var folderLocation = locarray[3];
      var pathanalysis = window.location.pathname.replace("/club/pagefiles", '');
      $.get("/club/folderlist?location=" + folderLocation, function (data, status) {
            $("#filestructure ul").html("");
            data.forEach(element => {
                  if (pathanalysis) {
                        var folderid = 'pagefiles' + pathanalysis + '$' + element;
                  } else {
                        var folderid = 'page' + pathanalysis + '$' + element;
                  }
                  var makeid = element.split(' ').join('_');
                  $("#filestructure ul").append(`<li class="list-group-item" name="" id="folder_${makeid}">
                        <div class="row">
                            <div class="col folders" onclick="enterfolder(this)" id="${folderid}">
                                <img src="/assets/img/folder-icon.png" alt=""
                                    style="width: 1rem;margin-right: 1 rem;">
                                <span>${element}</span>
  
                            </div>
                            <div class="col option">
                                <span id="option_${makeid}" style="float: right;cursor: pointer;"
                                    onclick="optionMenu(this)"> <img src="/assets/img/option-menu.png" alt=""
                                        style="width: 1rem;margin-right: 1 rem;">
                                </span>
                            </div>
                        </div>
                    </li>`);
            });
      });
      var pathname = window.location.pathname;
      var locarray = pathname.split("/");
      var folderLocation = locarray[3];
      $.get("/club/fileslist?location=" + folderLocation, function (data, status) {
            $("#filesstructure ul").html("");
            data.forEach(element => {
                  var makeid=element.split('.').join('_');
                  $("#filesstructure ul").append(`<li class="list-group-item" id="file_${makeid}">
                        <div class="row">
                            <div class="col files">
                                <img src="/assets/img/file-icon.png" alt=""
                                    style="width: 1rem;margin-right: 1 rem;">
                                <span>${element}</span>

                            </div>
                            <div class="col option">
                                <span id="fileoption_${makeid}" style="float: right;cursor: pointer;"
                                    onclick="fileoptionMenu(this)"> <img src="/assets/img/option-menu.png" alt=""
                                        style="width: 1rem;margin-right: 1 rem;">
                                </span>
                            </div>
                        </div>
                    </li>`);

            });
      });


      $("#createfolder").click(function () {
            $("#messages").html("");
            $("#inputs").html(`<div class="form-group">
            <input type="text" class="form-control" aria-describedby="emailHelp" id="foldername" placeholder="Enter Folder Name...">
            </div><button onclick="createfolder()" type="button" class="btn btn-primary col-3">Create</button>`)
      });

      $("#uploadfile").click(function () {
            var pathname = window.location.pathname;
            var folderLocation = pathname.replace('$',' ').split(' ')[1];
            $("#messages").html("");
            $("#inputs").html(
                  `<form method="POST" id="fileform" enctype="multipart/form-data">
                    <input name="file" type="file" class="form-control" aria-describedby="emailHelp" placeholder="Enter Folder Name...">
                    <input name="location" value="${folderLocation}" style="display:none">
                    <br>
                </form>
                <button type="submit" onclick="submitfile()" id="submitfile" type="button" class="btn btn-primary">Upload</button>
                `
            );
      });


      $("#breadcrumb").append(
            `<li class="breadcrumb-item"><a href="/club/pagefiles/">Page Files </a></li>`);

      
      var pathname = window.location.pathname;
      if (pathname == '/page/pagefiles/' || pathname == '/club/pagefiles') {
            
      }else{
            var linkpaths = "";
            if (pathname.replace('$', ' ').split(' ')[1]) {
                  pathname = pathname.replace('$', ' ').split(' ')[1].split('$');
                  pathname.forEach(element => {
                        element = element.split('%20').join(' ');
                        linkpaths = linkpaths + '$' + element;
                        $("#breadcrumb").append(
                              `<li class="breadcrumb-item"><a href="/club/pagefiles/${linkpaths}">${element}</a></li>`);
                        
                  })
            }
            
      }



});