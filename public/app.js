function setCrumbs(index) {
  var text = [
    "Rookie",
    "Hustler",
    "Mogul",
    "Kingpin"
  ];
  var $crumbs = $(".crumbs a");
  $crumbs.removeClass("active");
  for(var i = 1; i <= index; i++) {
    $('.crumbs a[data-index='+i+']').addClass("active");
  }
  var iconBar = $(".icons .crumbs a");
  iconBar.addClass('active');
  iconBar.text(text[index-1]);
}

$(document).ready(function () {
  $(".crumbs a").click(function (el) {
    var index = $(this).data("index");
    setCrumbs(index);
  });
});
