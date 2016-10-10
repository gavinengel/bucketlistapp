  
  $("#kendoUiMobileApp").kendoTouch({
      enableSwipe: true,
      //touchstart: function(e) { console.log("touch start"); },
      swipe: function(e) { 
        /* [ map ] [ calendar ] [ agenda ] */
        var newView = '';

        if (app.mobileApp.view().id == 'components/mapView/view.html') {
          if (e.direction == 'left') {
            newView = 'calendar';
          }
        }
        else if (app.mobileApp.view().id == 'components/calendarView/view.html') {
          if (e.direction == 'right') {
            newView = 'map';
          }
          else if (e.direction == 'left') {
            newView = 'agenda';
          }
        }
        else if (app.mobileApp.view().id == 'components/agendaView/view.html') {
          if (e.direction == 'right') {
            newView = 'calendar';
          }
        }

        if (newView) {
          console.log('navigate to: '+newView);
          app.mobileApp.navigate("#components/" + newView + "View/view.html");
        }

      }//,
      //tap: function(e) { console.log("tap"); },
      //doubletap: function(e) { console.log("double tap"); },
      //hold: function(e) { console.log("hold"); }
  });
