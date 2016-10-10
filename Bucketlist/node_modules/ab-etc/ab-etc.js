if (!abEtc) abEtc = {}

abEtc.insertHtml = function(source, destination) {
  var newHtml = jQuery( source ).html();
  jQuery(destination).html( newHtml );
}

