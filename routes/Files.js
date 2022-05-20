const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const path = require('path');

const Folders = require('../models/Folders');
const Files = require('../models/Files');
const Links = require('../models/Links');
const Users = require('../models/Users');

const jwt = require('jsonwebtoken');
const async = require('hbs/lib/async');

app.use(cookieParser());
app.use(fileUpload());

const GetName = (req) => {
  var decoded = jwt.verify(req.cookies['userdata'], 'amitkumar');
  return decoded.email;
}
const GetUser = async (req) => {
  var getname = GetName(req);
  const User = await Users.findOne({
    email: getname
  });

  return {
    name: User.profile.displayName,
    branch: User.branch,
    email: User.email,
    section: User.section
  }
}
app.get('/', (req, res) => {
  res.redirect('/files/root');
});

app.get('/root', async (req, res) => {
  try {
    var user = await GetUser(req);
    res.render('files/files', {
      user: user
    });
  } catch (error) {
    console.log(error);
  }
});


app.get('/folderlist', async (req, res) => {
  try {
    var getname = GetName(req);
    var folderlocation = req.query.location;
    folderlocation = folderlocation.split(" ").join('%20');
    const folders = await Folders.find({
      location: folderlocation,
      isDeleted: false,
      createdby: getname
    }).collation({
      locale: "en"
    }).sort({
      'name': 1
    });
    res.json(folders);
  } catch (error) {
    console.log(error);
  }
});

app.post('/sharefolder', async (req, res) => {
  const Folder = await Folders.findOne({
    _id: req.body.folderid,
    isDeleted: false,
  });
  console.log(req.body);
  var getname = GetName(req);
  // console.log(Folder);
  var accesss = req.body.branch + '_' + req.body.section;
  var getfoldername = getname.split('.').join('-').split('@')[0];
  var name = Folder.name.split(' ').join('%20');
  var oldlocation = Folder.location;
  console.log(oldlocation);
  console.log(Folder.location + '1x1');
  console.log(getfoldername + '1x1')
  var newlocation = oldlocation.replace(Folder.location + '1x1', getfoldername + '1x1')
  console.log(newlocation);
  Folder.accessto.push({
    name: accesss,
    mountlocation: newlocation
  });
  console.log(Folder);
  const childFolders = await Folders.find({
    isDeleted: false,
    location: {
      $regex: oldlocation,
      $options: 'i'
    }
  });
  // console.log(childFolders);
  const childLinks = await Links.find({
    isDeleted: false,
    linklocation: {
      $regex: oldlocation,
      $options: 'i'
    }
  });
  // console.log(childLinks);
  const childFiles = await Files.find({
    isDeleted: false,
    filelocation: {
      $regex: oldlocation,
      $options: 'i'
    }
  });
  // console.log(childFiles);
  childFolders.forEach(element => {
    var s=element.location.replace(Folder.location + '1x1', getfoldername + '1x1')
    element.accessto.push({
      name :accesss,
      mountlocation : s
    });
    console.log(element);
    element.save();
  });
  // childFiles.forEach(element => {
  //   element.filelocation = element.filelocation.replace(oldlocation, newlocation);
  //   element.save();
  // });
  // childLinks.forEach(element => {
  //   element.linklocation = element.linklocation.replace(oldlocation, newlocation);
  //   element.save();
  // });

  // await Folder.save();
  res.send("Folder : '" + name + "' Renamed to '" + Folder.name + "'");
});

app.get('/fileslist', async (req, res) => {
  try {
    var folderlocation = req.query.location;
    folderlocation = folderlocation.split(" ").join('%20');
    const files = await Files.find({
      filelocation: folderlocation,
      isDeleted: false
    }).collation({
      locale: "en"
    }).sort({
      'name': 1
    });
    res.json(files);
  } catch (error) {

  }
});


app.post('/deletefolder', async (req, res) => {
  try {
    const Folder = await Folders.findOne({
      _id: req.body.folderid
    });
    const nameoffolder = Folder.name.split(' ').join('%20');
    const loco = Folder.location + "1x1" + nameoffolder;
    const ChildFolders = await Folders.updateMany({
      isDeleted: false,
      location: {
        $regex: loco,
        $options: 'i'
      }
    }, {
      $set: {
        isDeleted: true
      }
    });
    const ChildLinks = await Links.updateMany({
      isDeleted: false,
      linklocation: {
        $regex: loco,
        $options: 'i'
      }
    }, {
      $set: {
        isDeleted: true
      }
    });
    const ChildFiles = await Files.updateMany({
      isDeleted: false,
      filelocation: {
        $regex: loco,
        $options: 'i'
      }
    }, {
      $set: {
        isDeleted: true
      }
    });
    Folder.isDeleted = true;
    await Folder.save();
    res.send("Folder : '" + Folder.name + "' Deleted");
  } catch (error) {
    console.log(error);
  }
});

app.post('/renamefolder', async (req, res) => {
  try {
    const Folder = await Folders.findOne({
      _id: req.body.folderid,
      isDeleted: false,
    });
    var name = Folder.name.split(' ').join('%20');
    var oldlocation = Folder.location + "1x1" + name;
    var newlocation = (Folder.location + "1x1" + req.body.newname).split(' ').join('%20');
    Folder.name = req.body.newname;
    const childFolders = await Folders.find({
      isDeleted: false,
      location: {
        $regex: oldlocation,
        $options: 'i'
      }
    });
    const childLinks = await Links.find({
      isDeleted: false,
      linklocation: {
        $regex: oldlocation,
        $options: 'i'
      }
    });

    const childFiles = await Files.find({
      isDeleted: false,
      filelocation: {
        $regex: oldlocation,
        $options: 'i'
      }
    });
    childFolders.forEach(element => {
      element.location = element.location.replace(oldlocation, newlocation);
      element.save();
    });
    childFiles.forEach(element => {
      element.filelocation = element.filelocation.replace(oldlocation, newlocation);
      element.save();
    });
    childLinks.forEach(element => {
      element.linklocation = element.linklocation.replace(oldlocation, newlocation);
      element.save();
    });

    await Folder.save();
    res.send("Folder : '" + name + "' Renamed to '" + Folder.name + "'");
  } catch (error) {
    console.log(error);
  }
});

app.post('/uploadfile', async (req, res) => {
  try {
    var getname = GetName(req);
    var getfoldername = getname.split('.').join('-').split('@')[0];
    var filelocation = req.body.location;
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
    sampleFile = req.files.file;
    var mimesupport = ["text/x-sass", "text/x-scss", "text/plain", "application/vnd.ms-powerpoint", "application/pdf", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "image/png", "image/gif", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword", "image/jpeg"];
    var MAX_SIZE = 10240;
    var found = (mimesupport.indexOf(sampleFile.mimetype) > -1);
    if (found && sampleFile.size < MAX_SIZE) {
      const checkFile = await Files.findOne({
        filelocation: filelocation,
        name: sampleFile.name,
        isDeleted: false,
        createdby: getname
      });
      if (checkFile) {
        res.send("File '" + checkFile.name + "' Already Exists");
      } else {
        var fileext = sampleFile.name.split('.')[1];
        const newfile = await new Files({
          name: sampleFile.name,
          filetype: sampleFile.mimetype,
          createdby: getname,
          filelocation: filelocation,
          isDeleted: false,
          createdon: Date.now()
        });
        const filename = newfile.id;
        var dir = path.join(__dirname, '..', "public/files/" + getfoldername);
        // var s=await sampleFile.mv(uploadPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, {
            recursive: true
          });
        }
        var uploadPath = dir + '/' + newfile._id + "." + fileext;
        await sampleFile.mv(uploadPath);
        newfile.save();
        res.send("File '" + newfile.name + "' Uploaded !");
      }
    } else {
      res.send("INVALID FILE TYPE or FILE EXCEEDING 10Mb ")
    }

  } catch (error) {
    console.log(error);
  }
})


app.post('/deletefile', async (req, res) => {
  const deleteFile = await Files.findOne({
    _id: req.body.fileid,
    filelocation: req.body.filelocation,
    isDeleted: false
  });
  if (deleteFile) {
    deleteFile.isDeleted = true;
    deleteFile.save();
    res.send("File : '" + deleteFile.name + "' Deleted");
  } else {
    res.send("File Does Not Exist");
  }
});

app.post('/renamefile', async (req, res) => {
  try {
    const renamedFile = await Files.findOne({
      _id: req.body.fileid,
      filelocation: req.body.filelocation,
      isDeleted: false
    });
    if (renamedFile) {
      const oldname = renamedFile.name;
      renamedFile.name = req.body.newname;
      renamedFile.save();
      res.send("File : '" + oldname + "' Renamed to '" + renamedFile.name + "'");
    } else {
      res.send("File Does Not Exist");
    }
  } catch (error) {}

});

app.get('/linkslist', async (req, res) => {
  try {
    var folderlocation = req.query.location;
    folderlocation = folderlocation.split(" ").join('%20');
    const allLinks = await Links.find({
      linklocation: folderlocation,
      isDeleted: false
    });
    res.json(allLinks);
  } catch (error) {
    console.log(error);
  }
});

app.post('/createlink', async (req, res) => {
  try {
    const getname = GetName(req);
    const newLink = new Links({
      name: req.body.linkname,
      link: req.body.link,
      createdby: getname,
      isDeleted: false,
      linklocation: req.body.folderLocation
    });
    newLink.save();
    res.send("Link : '" + newLink.name + "' Created");
  } catch (error) {

  }
});


app.post('/deletelink', async (req, res) => {
  try {
    const deletedLink = await Links.findOne({
      _id: req.body.linkid,
      linklocation: req.body.linklocation,
      isDeleted: false
    });
    if (deletedLink) {
      deletedLink.isDeleted = true;
      deletedLink.save();
      res.send("Link : '" + deletedLink.name + "' Deleted");
    } else {
      res.send("Link Does Not Exist");
    }
  } catch (error) {
    console.log(error);
  }
});


app.post('/updatelink', async (req, res) => {
  try {
    const newlinkname = req.body.newlinkname;
    const newlink = req.body.newlink;
    const linkid = req.body.linkid;
    const UpdatedLink = await Links.updateOne({
      _id: linkid,
      isDeleted: false
    }, {
      $set: {
        name: newlinkname,
        link: newlink
      }
    });
    if (UpdatedLink.modifiedCount == 1) {
      res.send("Updated Link :" + newlinkname);
    }
  } catch (error) {

  }
});

app.post('/createfolder', async (req, res) => {
  try {

    const checkFolder = await Folders.findOne({
      name: req.body.foldername,
      location: req.body.location,
      isDeleted: false
    });
    if (checkFolder) {
      res.send("Folder Name :" + req.body.foldername + " Already Exists !")
    } else {
      const name = await GetName(req);
      const Folder = await new Folders({
        name: req.body.foldername,
        createdby: name,
        createdon: Date.now(),
        isDeleted: false,
        location: req.body.location
      });
      await Folder.save();
      res.send("Folder Created : '" + Folder.name + "'");
    }
  } catch (error) {
    console.log(error);
  }
});


app.get('/:location', async (req, res) => {
  try {
    var user = await GetUser(req);
    var folderlocation = await req.params.location;
    folderlocation = folderlocation.split(" ").join('%20');
    const folders = await Folders.find({
      location: folderlocation,
      isDeleted: false
    }).collation({
      locale: "en"
    }).sort({
      'name': 1
    });
    res.render('files/files', {
      user: user
    });
  } catch (error) {

  }
});

module.exports = app;