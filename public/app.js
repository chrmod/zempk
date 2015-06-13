function setCrumbs(index) {
  var $crumbs = $("#crumbs a");
  $crumbs.removeClass("active");
  for(var i = 1; i <= index; i++) {
    $('#crumbs a[data-index='+i+']').addClass("active");
  }
}

$(document).ready(function () {
  $("#crumbs a").click(function (el) {
    var index = $(this).data("index");
    setCrumbs(index);
  });
});
