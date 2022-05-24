function RefreshList() {
    var pathname = window.location.pathname;
    var locarray = pathname.split("/");
    var folderLocation = locarray[2];
    $.get("/files/folderlist?location=" + folderLocation, function (data, status) {
        $("#filestructure ul").html("");
        data.forEach(element => {
            $("#filestructure ul").append(`<li class="list-group-item" id="folder_${element._id}">
                      <div class="row">
                          <div class="col folders" onclick="enterfolder(this)" id="${element.location}_${element.name}">
                              <img src="/assets/img/folder-icon.png" alt=""
                                  style="width: 1rem;margin-right: 1 rem;">
                              <span>${element.name}</span>

                          </div>
                          <div class="col option">
                              <span id="option_${element._id}" style="float: right;cursor: pointer;"
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
    newname=newname.replace(/\s\s+/g,' ');
    newname.trim();
    if (newname[0]==' ') {
        newname= newname.slice(1);
    }
    if (newname[newname.length-1]==' ') {
        newname = newname.slice(0, -1);
    }
    if (newname == "") {
        newname = "New Folder";
    }
    $.post('/files/renamefolder', {
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
    var folderid = params.id.split("_")[1];
    $.post('/files/deletefolder', {
        folderid: folderid
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

function sharetoclass(params){
    var folderid = params.id.split("_")[1];
    console.log(folderid);
    var getname = $("#folder_" + folderid + " div div span").html();
    $(".optionicons").html('');
    $("#removeoption_" + folderid).remove();
     var branch=params.id.split("_")[2];
     var section=params.id.split("_")[3];
    $.post('/files/sharefolder',{
        folderid:folderid,
        section : section,
        branch : branch
    },function(data,status){
        console.log(data);
    });
}

function sharefiletoclass(params){
    var fileid = params.id.split("_")[1];
    console.log(fileid);
    var getname = $("#folder_" + fileid + " div div span").html();
    $(".optionicons").html('');
    $("#removeoption_" + fileid).remove();
     var branch=params.id.split("_")[2];
     var section=params.id.split("_")[3];
    $.post('/files/sharefile',{
        fileid: fileid,
        section : section,
        branch : branch
    },function(data,status){
        console.log(data);
    });
}

function sharefolder(params){
    var folderid = params.id.split("_")[1];
    var getname = $("#folder_" + folderid + " div div span").html();
    $(".optionicons").html('');
    $("#removeoption_" + folderid).remove();
     var branch=$("#branch").html();
     var section=$("#usersection").html();
    $("#folder_" + folderid).append(`
      <hr>
                      <div class="row">
                      <span style="float:left;margin-right:2rem;margin-left:2rem;">Share To : </span>
                            <button type="button" class="btn btn-light" id="sharetoclass_${folderid}_${branch}_${section}" onclick="sharetoclass(this)"> ${branch} ${section}</button>
                      </div>
      
      `);
}

function sharefile(params){
    var fileid = params.id.split("_")[1];
    var getname = $("#file_" + fileid + " div div span").html();
    $(".optionicons").html('');
    $("#removeoption_" + fileid).remove();
     var branch=$("#branch").html();
     var section=$("#usersection").html();
    $("#file_" + fileid).append(`
      <hr>
                      <div class="row">
                      <span style="float:left;margin-right:2rem;margin-left:2rem;">Share To : </span>
                            <button type="button" class="btn btn-light" id="sharefiletoclass_${fileid}_${branch}_${section}" onclick="sharefiletoclass(this)"> ${branch} ${section}</button>
                      </div>
      
      `);
}

function optionMenu(params) {
    var folderid = params.id.split("_")[1];
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
                          <div class="rename-icon" id="rename_${folderid}" onclick="renamefolder(this)">
                              <span >
                                  <div><img src="/assets/img/rename.png" alt=""
                                      style="height: 1.5rem;margin-right: 1 rem;"></div>
                              </span>
                          </div>
                          <div class="share-icon" id="share_${folderid}" onclick="sharefolder(this)">
                              <span >
                                  <div><img src="/assets/img/share.png" alt=""
                                      style="height: 1.5rem;margin-right: 1 rem;"></div>
                              </span>
                          </div>
                      </div>`);
    $("#folder_" + folderid + " div .option").append(
        `<span style="float: right" id="removeoption_${folderid}" onclick="removeoption(this)"><img src="/assets/img/cross.png"  style="width: 1rem;cursor:pointer;"></span>`
    );
}

function hiii() {
    console.log("YOOOO");
}



function enterfolder(params) {
    var gotoloc=params.id.replace('_','1x1');
    window.location.href = "/files/" + gotoloc;
}

function createfolder() {

    var folderName = $("#foldername").val();
    folderName=folderName.replace(/\s\s+/g,' ');
    folderName.trim();
    if (folderName[0]==' ') {
        folderName = folderName.slice(1);
    }
    if (folderName[folderName.length-1]==' ') {
        folderName = folderName.slice(0, -1);
    }
    if (folderName == "") {
        folderName = "New Folder";
    }
    var pathname = window.location.pathname;
    var locarray = pathname.split("/");
    var folderLocation = locarray[2];
    $.post("/files/createfolder", {
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
        url: "/files/uploadfile",
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
        }
    });
}

function RefreshFiles() {
    var pathname = window.location.pathname;
    var locarray = pathname.split("/");
    var folderLocation = locarray[2];
    $.get("/files/fileslist?location=" + folderLocation, function (data, status) {
        $("#filesstructure ul").html("");
        data.forEach(element => {
            $("#filesstructure ul").append(`<li class="list-group-item" id="file_${element._id}">
              <div class="row">
                  <div class="col files" >
                      <img src="/assets/img/file-icon.png" alt=""
                          style="width: 1rem;margin-right: 1 rem;">
                      <span>${element.name}</span>

                  </div>
                  <div class="col option">
                      <span id="fileoption_${element._id}" style="float: right;cursor: pointer;"
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
    var fileid = params.id.split("_")[1];
    var pathname = window.location.pathname;
    var locarray = pathname.split("/");
    var fileLocation = locarray[2];
    $.post('/files/deletefile', {
        fileid: fileid,
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

function renamethefile(params) {
    var fileid = params.id.split("_")[1];
    var pathname = window.location.pathname;
    var locarray = pathname.split("/");
    var fileLocation = locarray[2];
    var newname = $("#renametext").val();
    $.post('/files/renamefile', {
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
    var fileid = params.id.split("_")[1];
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
                          </div><div class="rename-icon" id="rename_${fileid}" onclick="renamefile(this)">
                          <span >
                              <div><img src="/assets/img/rename.png" alt=""
                                  style="height: 1.5rem;margin-right: 1 rem;"></div>
                          </span>
                      </div>
                          <div class="share-icon" id="share_${fileid}" onclick="sharefile(this)">
                              <span >
                                  <div><img src="/assets/img/share.png" alt=""
                                      style="height: 1.5rem;margin-right: 1 rem;"></div>
                              </span>
                          </div>
                      </div>`);
    $("#file_" + fileid + " div .option").append(
        `<span style="float: right" id="removeoption_${fileid}" onclick="removeoption(this)"><img src="/assets/img/cross.png"  style="width: 1rem;cursor:pointer;"></span>`
    );
}

function updatethelink(params){
    var linkid = params.id.split("_")[1];
    var newlinkname = $("#renamelinkname").val();
    var newlink = $("#renamelink").val();
    $.post('/files/updatelink', {
        linkid :linkid,
        newlinkname :newlinkname,
        newlink : newlink
    }, function (data, status) {
        $("#messages").html(`<div style="padding: 1rem"> ${data}
                  <span style="float: right"><img src="/assets/img/cross.png" alt="" style="width: 1rem;cursor:pointer;" onclick="removemessage()">
                  </span>
              </div>`);
        RefreshLinks();
    });
}

function renamelink(params) {
    var linkid = params.id.split("_")[1];
    $("#" + params.id).html("");
    var linkname = $("#link_" + linkid + " div div .linkname").html();
    var thelink = $("#link_" + linkid + " div div .thelink").html();
    $("#linkoption_" + linkid).remove();
    $("#removeoption_" + linkid).remove();
    $(".optionicons").html('');
    $("#link_" + linkid).append(`
    <hr>
                    
                        <div class="col">
                            <input type="text" id="renamelinkname" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" value="${linkname}">
                        </div>
                        <br>
                        <div class="col">
                            <input type="text" id="renamelink" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" value="${thelink}">
                        </div>
                        <br>
                        <div class="col">
                            <button type="button" onclick="updatethelink(this)" id="rename_${linkid}" class="btn btn-primary">Update</button>
                        </div>
                    
    
    `);
}

function deletelink(params) {
    var linkid = params.id.split("_")[1];
    var pathname = window.location.pathname;
    var locarray = pathname.split("/");
    var linkLocation = locarray[2];
    $.post('/files/deletelink', {
        linkid: linkid,
        linklocation: linkLocation
    }, function (data, status) {
        $("#messages").html(`<div style="padding: 1rem"> ${data}
                  <span style="float: right"><img src="/assets/img/cross.png" alt="" style="width: 1rem;cursor:pointer;" onclick="removemessage()">
                  </span>
              </div>`);
        $("#inputs").html("");
        RefreshLinks();
    });
}

function linkoptionMenu(params) {
    var linkid = params.id.split("_")[1];
    $("#" + params.id).html("");
    $("#linkoption_" + linkid).remove();
    $("#link_" + linkid).append(`
    <div class="optionicons">
        <hr>
        
        <div class="delete-icon" id="delete_${linkid}" onclick="deletelink(this)">
            <span >
                <div><img src="/assets/img/dust-bin.png" alt=""
                    style="height: 1.5rem;margin-right: 1 rem;"></div>
            </span>
        </div>
        <div class="rename-icon" id="rename_${linkid}" onclick="renamelink(this)">
            <span >
                <div><img src="/assets/img/rename.png" alt=""
                    style="height: 1.5rem;margin-right: 1 rem;"></div>
            </span>
        </div>
        <div class="share-icon" id="share_${linkid}" onclick="sharelink(this)">
            <span >
                <div><img src="/assets/img/share.png" alt=""
                    style="height: 1.5rem;margin-right: 1 rem;"></div>
            </span>
        </div>
    </div>`);
    $("#link_" + linkid + " div .option").append(
        `<span style="float: right" id="removeoption_${linkid}" onclick="removeoption(this)"><img src="/assets/img/cross.png"  style="width: 1rem;cursor:pointer;"></span>`
    );
}


function openlink(params) {
    var linkid = params.id.split("_")[1];
    console.log(linkid);
    var thelink = $("#link_" + linkid + " div div .thelink").html();
    window.open(thelink, '_blank');
}


function RefreshLinks() {
    var pathname = window.location.pathname;
    var locarray = pathname.split("/");
    var folderLocation = locarray[2];
    $.get("/files/linkslist?location=" + folderLocation, function (data, status) {
        $("#linksstructure ul").html("");
        data.forEach(element => {
            $("#linksstructure ul").append(`<li class="list-group-item" id="link_${element._id}">
              <div class="row">
                  <div class="col-10 files" onclick='openlink(this)' id="openlink_${element._id}" style="overflow:hidden;text-overflow: ellipsis;white-space: nowrap;" onclick="openlink()">
                      <img src="/assets/img/link-icon.png" alt=""
                          style="width: 1rem;margin-right: 1 rem;">
                      <span class="linkname">${element.name}</span>
                      <span class="thelink" style="font-size: 0.8rem;color: #7ed294e6 ;"> ${element.link} </span>
                  </div>
                  <div class="col-2 option">
                      <span id="linkoption_${element._id}" style="float: right;cursor: pointer;"
                          onclick="linkoptionMenu(this)"> <img src="/assets/img/option-menu.png" alt=""
                              style="width: 1rem;margin-right: 1 rem;">
                      </span>
                  </div>
              </div>
          </li>`);
        });
    });
}

function createlink() {
    var linkname = $("#linkname").val();
    var link = $("#link").val();
    var pathname = window.location.pathname;
    var locarray = pathname.split("/");
    var folderLocation = locarray[2];
    $.post('/files/createlink', {
        linkname: linkname,
        link: link,
        folderLocation: folderLocation
    }, function (data, success) {
        $("#messages").html(`<div style="padding: 1rem"> ${data}
<span style="float: right"><img src="/assets/img/cross.png" alt="" style="width: 1rem;cursor:pointer;" onclick="removemessage()">
</span>
</div>`);
        $("#inputs").html("");
        RefreshLinks();
    });

}


$(document).ready(function () {
    var pathname = window.location.pathname;
    var locarray = pathname.split("/");
    var folderLocation = locarray[2];
    $.get("/files/folderlist?location=" + folderLocation, function (data, status) {
        $("#filestructure ul").html("");
        data.forEach(element => {
            $("#filestructure ul").append(`<li class="list-group-item" id="folder_${element._id}">
                      <div class="row">
                          <div class="col folders" onclick="enterfolder(this)" id="${element.location}_${element.name}">
                              <img src="/assets/img/folder-icon.png" alt=""
                                  style="width: 1rem;margin-right: 1 rem;">
                              <span>${element.name}</span>

                          </div>
                          <div class="col option">
                              <span id="option_${element._id}" style="float: right;cursor: pointer;"
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
    var folderLocation = locarray[2];
    $.get("/files/fileslist?location=" + folderLocation, function (data, status) {
        $("#filesstructure ul").html("");
        data.forEach(element => {
            $("#filesstructure ul").append(`<li class="list-group-item" id="file_${element._id}">
                      <div class="row">
                          <div class="col files">
                              <img src="/assets/img/file-icon.png" alt=""
                                  style="width: 1rem;margin-right: 1 rem;">
                              <span>${element.name}</span>

                          </div>
                          <div class="col option">
                              <span id="fileoption_${element._id}" style="float: right;cursor: pointer;"
                                  onclick="fileoptionMenu(this)"> <img src="/assets/img/option-menu.png" alt=""
                                      style="width: 1rem;margin-right: 1 rem;">
                              </span>
                          </div>
                      </div>
                  </li>`);
        });
    });

    var pathname = window.location.pathname;
    var locarray = pathname.split("/");
    var folderLocation = locarray[2];
    $.get("/files/linkslist?location=" + folderLocation, function (data, status) {
        $("#linksstructure ul").html("");
        data.forEach(element => {
            $("#linksstructure ul").append(`<li class="list-group-item" id="link_${element._id}">
                      <div class="row">
                          <div class="col-10 files" onclick='openlink(this)' id="openlink_${element._id}" style="overflow:hidden;text-overflow: ellipsis;white-space: nowrap;" onclick="openlink()">
                              <img src="/assets/img/link-icon.png" alt=""
                                  style="width: 1rem;margin-right: 1 rem;">
                              <span class="linkname">${element.name}</span>
                              <span class="thelink" style="font-size: 0.8rem;color: #7ed294e6 ;"> ${element.link} </span>
                          </div>
                          <div class="col-2 option">
                              <span id="linkoption_${element._id}" style="float: right;cursor: pointer;"
                                  onclick="linkoptionMenu(this)"> <img src="/assets/img/option-menu.png" alt=""
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
        var locarray = pathname.split("/");
        var folderLocation = locarray[2];
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

    $("#createlink").click(function () {
        var pathname = window.location.pathname;
        var locarray = pathname.split("/");
        var folderLocation = locarray[2];
        $("#messages").html("");
        $("#inputs").html(
            `<div class="form-group">
  <input type="text" class="form-control" aria-describedby="emailHelp" id="linkname" placeholder="Enter Link Name...">
  <br>
  <input type="text" class="form-control" aria-describedby="emailHelp" id="link" placeholder="Enter Link ...">
  </div><button onclick="createlink()" type="button" class="btn btn-primary col-3">Create</button>`
        );
    });

    var pathname = window.location.pathname;
    var locarray = pathname.split("/");
    var folderLocation = locarray[2];
    var myarray = folderLocation.split('1x1');
    var path = "root";
    myarray.forEach(element => {
        if (element == "root") {} else {
            path = path + "1x1" + element;
        }
        var element = element.split('%20').join(' ');
        $("#breadcrumb").append(
            `<li class="breadcrumb-item"><a href="/files/${path}">${element}</a></li>`);
    });
});