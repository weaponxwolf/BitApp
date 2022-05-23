

$(document).ready(function(){
     var pathname=window.location.pathname;
     var link=pathname.split('/')[1];
     if (link=='academics') {
           $("#academicslink").addClass('active');
           $('title').html('Academics')
     }
     if (link=='explore') {
           $("#explorelink").addClass('active');
           $('title').html('Explore')
     }
     if (link=='maps') {
           $("#mapslink").addClass('active');
           $('title').html('Maps')
     }
     if (link=='files') {
           $("#fileslink").addClass('active');
           $('title').html('Files')
     }
     if (link=='academics') {
           $("#academicslink").addClass('active');
           $('title').html('Academics')
     }
});

