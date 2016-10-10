  $("#kendoUiMobileApp").kendoTouch({
      enableSwipe: true,
      //touchstart: function(e) { console.log("touch start"); },
      swipe: function(e) { 
        //console.log("swipe " + e.direction); 
        //console.log("current view:");
        if (app.mobileApp.view().id == 'components/mapView/view.html') {
          if (e.direction == 'right') {
            console.log('right!')
            // components/aboutView/view.html 
            // _kendoApp.navigate(location);
            // router.navigate("/items/books/59?user=John");
            app.mobileApp.navigate("#components/profileView/view.html");

          }
        }
      }//,
      //tap: function(e) { console.log("tap"); },
      //doubletap: function(e) { console.log("double tap"); },
      //hold: function(e) { console.log("hold"); }
  });
